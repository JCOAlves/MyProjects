import { Injectable, signal } from '@angular/core';
import environment from '../../environments/environment';
import { createDemoProjects, DEMO_PROFILE } from './demo-data';
import type {
  Collaborator,
  MemberInput,
  Note,
  NoteInput,
  Profile,
  Project,
  ProjectInput,
  Task,
} from './models';

const PROJECTS_KEY = 'ppi.workspace.v1';
const PROFILE_KEY = 'ppi.demo-session.v1';
const INTEGRATION_MESSAGE =
  'O acesso à API ainda não está disponível. O backend precisa implementar autenticação e autorização. Ative o modo de demonstração para explorar as páginas.';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class WorkspaceConflictError extends Error {}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, label: string, maximum: number, optional = false): string {
  if (typeof value !== 'string') throw new Error(`${label} inválido.`);
  const result = value.trim();
  if (!optional && !result) throw new Error(`Preencha ${label.toLocaleLowerCase('pt-BR')}.`);
  if (result.length > maximum) throw new Error(`${label} deve ter até ${maximum} caracteres.`);
  return result;
}

function email(value: unknown): string {
  const result = text(value, 'Email', 100).toLowerCase();
  if (!EMAIL.test(result)) throw new Error('Informe um endereço de email válido.');
  return result;
}

function id(value: unknown): string {
  return text(value, 'Identificador', 120);
}

function date(value: unknown, optional = false): string {
  if (optional && value === '') return '';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Informe uma data válida.');
  }
  const parsed = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error('Informe uma data válida.');
  }
  return value;
}

function timestamp(value: unknown): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new Error('A data dos dados salvos é inválida.');
  }
  return new Date(value).toISOString();
}

function choice<T extends string>(value: unknown, values: readonly T[], label: string): T {
  if (typeof value !== 'string' || !values.includes(value as T))
    throw new Error(`${label} inválido.`);
  return value as T;
}

function list<T extends { id: string }>(
  value: unknown,
  limit: number,
  parse: (item: unknown) => T,
): T[] {
  if (!Array.isArray(value) || value.length > limit)
    throw new Error('Os dados salvos ultrapassam o limite da demonstração.');
  const result = value.map(parse);
  if (new Set(result.map((item) => item.id)).size !== result.length)
    throw new Error('Os dados salvos contêm identificadores repetidos.');
  return result;
}

function parseProfile(value: unknown): Profile {
  if (!record(value)) throw new Error('Perfil inválido.');
  const profile: Profile = {
    id: id(value['id']),
    name: text(value['name'], 'Nome completo', 100),
    email: email(value['email']),
  };
  if (profile.name.length < 2) throw new Error('O nome deve ter pelo menos 2 caracteres.');
  if (value['avatar'] !== undefined && value['avatar'] !== '') {
    const avatar = value['avatar'];
    const encoded =
      typeof avatar === 'string' && avatar.length <= 1_500_000
        ? /^data:image\/(?:png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(avatar)?.[1]
        : undefined;
    const decodedBytes = encoded
      ? (encoded.length * 3) / 4 - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0)
      : 0;
    if (!encoded || encoded.length % 4 !== 0 || decodedBytes > 1_048_576) {
      throw new Error('Escolha uma foto PNG, JPEG ou WebP de até 1 MB.');
    }
    profile.avatar = avatar as string;
  }
  return profile;
}

function parseTask(value: unknown): Task {
  if (!record(value) || typeof value['done'] !== 'boolean') throw new Error('Tarefa inválida.');
  return {
    id: id(value['id']),
    title: text(value['title'], 'Nome da tarefa', 100),
    description: text(value['description'] ?? '', 'Descrição da tarefa', 5000, true),
    priority: choice(value['priority'], ['high', 'medium', 'low'], 'Prioridade'),
    done: value['done'],
    deadline: date(value['deadline'], true),
  };
}

function parseNote(value: unknown): Note {
  if (!record(value)) throw new Error('Anotação inválida.');
  return {
    id: id(value['id']),
    title: text(value['title'], 'Título da anotação', 120),
    content: text(value['content'], 'Texto da anotação', 10000),
    updatedAt: timestamp(value['updatedAt']),
  };
}

function parseMember(value: unknown): Collaborator {
  if (!record(value)) throw new Error('Colaborador inválido.');
  return {
    id: id(value['id']),
    name: text(value['name'], 'Nome do colaborador', 100),
    email: email(value['email']),
    role: choice(value['role'], ['viewer', 'editor'], 'Permissão'),
  };
}

function parseProject(value: unknown): Project {
  if (!record(value)) throw new Error('Projeto inválido.');
  const project: Project = {
    id: id(value['id']),
    title: text(value['title'], 'Nome do projeto', 120),
    description: text(value['description'], 'Descrição do projeto', 5000, true),
    icon: choice(value['icon'], ['laptop', 'bulb', 'chart', 'folder', 'book', 'rocket'], 'Ícone'),
    color: choice(value['color'], ['blue', 'amber', 'violet', 'teal'], 'Cor'),
    createdAt: timestamp(value['createdAt']),
    updatedAt: timestamp(value['updatedAt']),
    tasks: list(value['tasks'], 1000, parseTask),
    notes: list(value['notes'], 250, parseNote),
    members: list(value['members'], 100, parseMember),
  };
  if (new Set(project.members.map((member) => member.email)).size !== project.members.length) {
    throw new Error('Há emails de colaboradores repetidos no projeto.');
  }
  return project;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly currentUser = signal<Profile | null>(null);
  private readonly currentProjects = signal<Project[]>([]);
  readonly user = this.currentUser.asReadonly();
  readonly projects = this.currentProjects.asReadonly();
  readonly storageError = signal('');
  readonly demoMode = environment.demoMode;
  private unreadableProjects: string | null = null;
  private lastSavedProjects: string | null = null;
  private projectStorageError = '';
  private profileStorageError = '';

  constructor() {
    if (!this.demoMode) return;
    this.currentProjects.set(this.restoreProjects());
    this.restoreProfile();
  }

  /** This is a local UI demonstration, never a credential verification service. */
  async signIn(address: string, password: string): Promise<void> {
    this.assertDemo();
    const normalizedEmail = email(address);
    this.validatePassword(password);
    const previous = this.currentUser();
    this.saveProfile({
      id: 'demo-user',
      name:
        previous?.email === normalizedEmail
          ? previous.name
          : normalizedEmail === DEMO_PROFILE.email
            ? DEMO_PROFILE.name
            : 'Visitante',
      email: normalizedEmail,
      ...(previous?.email === normalizedEmail && previous.avatar
        ? { avatar: previous.avatar }
        : {}),
    });
  }

  async signUp(name: string, address: string, password: string): Promise<void> {
    this.assertDemo();
    this.validatePassword(password);
    this.saveProfile(parseProfile({ id: 'demo-user', name, email: address }));
  }

  async startDemo(): Promise<void> {
    this.assertDemo();
    this.saveProfile({ ...DEMO_PROFILE });
  }

  signOut(): void {
    try {
      sessionStorage.removeItem(PROFILE_KEY);
    } catch {
      this.setStorageError(
        'profile',
        'Não foi possível encerrar a sessão local. Verifique se o armazenamento do navegador está permitido.',
      );
      throw new Error(this.storageError());
    }
    this.currentUser.set(null);
    this.setStorageError('profile', '');
  }

  updateProfile(input: Pick<Profile, 'name' | 'email' | 'avatar'>): void {
    this.assertEditable();
    this.saveProfile(parseProfile({ ...this.currentUser()!, ...input }));
  }

  createProject(input: ProjectInput): Project {
    this.assertEditable();
    const now = new Date().toISOString();
    const project = parseProject({
      ...input,
      id: this.newId(),
      createdAt: now,
      updatedAt: now,
      tasks: [],
      notes: [],
      members: [],
    });
    this.commitProjects([project, ...this.currentProjects()]);
    return project;
  }

  updateProject(projectId: string, input: Partial<ProjectInput>): void {
    this.changeProject(projectId, (project) => ({
      ...project,
      title: input.title ?? project.title,
      description: input.description ?? project.description,
      icon: input.icon ?? project.icon,
      color: input.color ?? project.color,
    }));
  }

  deleteProject(projectId: string): void {
    this.assertEditable();
    this.requireProject(projectId);
    this.commitProjects(this.currentProjects().filter((project) => project.id !== projectId));
  }

  addTask(projectId: string, input: Omit<Task, 'id'>): void {
    const task = parseTask({ ...input, id: this.newId() });
    this.changeProject(projectId, (project) => ({ ...project, tasks: [...project.tasks, task] }));
  }

  updateTask(projectId: string, taskId: string, input: Partial<Task>): void {
    this.changeProject(projectId, (project) => {
      if (!project.tasks.some((task) => task.id === taskId))
        throw new Error('A tarefa não foi encontrada.');
      return {
        ...project,
        tasks: project.tasks.map((task) =>
          task.id === taskId ? parseTask({ ...task, ...input, id: task.id }) : task,
        ),
      };
    });
  }

  deleteTask(projectId: string, taskId: string): void {
    this.changeProject(projectId, (project) => {
      if (!project.tasks.some((task) => task.id === taskId))
        throw new Error('A tarefa não foi encontrada.');
      return { ...project, tasks: project.tasks.filter((task) => task.id !== taskId) };
    });
  }

  addNote(projectId: string, input: NoteInput): void {
    const note = parseNote({ ...input, id: this.newId(), updatedAt: new Date().toISOString() });
    this.changeProject(projectId, (project) => ({ ...project, notes: [...project.notes, note] }));
  }

  updateNote(projectId: string, noteId: string, input: NoteInput): void {
    this.changeProject(projectId, (project) => {
      if (!project.notes.some((note) => note.id === noteId))
        throw new Error('A anotação não foi encontrada.');
      return {
        ...project,
        notes: project.notes.map((note) =>
          note.id === noteId
            ? parseNote({ ...note, ...input, id: note.id, updatedAt: new Date().toISOString() })
            : note,
        ),
      };
    });
  }

  deleteNote(projectId: string, noteId: string): void {
    this.changeProject(projectId, (project) => {
      if (!project.notes.some((note) => note.id === noteId))
        throw new Error('A anotação não foi encontrada.');
      return { ...project, notes: project.notes.filter((note) => note.id !== noteId) };
    });
  }

  addMember(projectId: string, input: MemberInput): void {
    const member = parseMember({ ...input, id: this.newId() });
    this.changeProject(projectId, (project) => {
      if (member.email === this.currentUser()?.email)
        throw new Error(
          'Seu perfil já tem acesso à demonstração. Informe o email de outro colaborador.',
        );
      if (project.members.some((existing) => existing.email === member.email))
        throw new Error('Este email já está na lista de colaboradores.');
      return { ...project, members: [...project.members, member] };
    });
  }

  updateMember(projectId: string, memberId: string, role: Collaborator['role']): void {
    this.changeProject(projectId, (project) => {
      if (!project.members.some((member) => member.id === memberId))
        throw new Error('O colaborador não foi encontrado.');
      return {
        ...project,
        members: project.members.map((member) =>
          member.id === memberId ? parseMember({ ...member, role }) : member,
        ),
      };
    });
  }

  deleteMember(projectId: string, memberId: string): void {
    this.changeProject(projectId, (project) => {
      if (!project.members.some((member) => member.id === memberId))
        throw new Error('O colaborador não foi encontrado.');
      return { ...project, members: project.members.filter((member) => member.id !== memberId) };
    });
  }

  private assertDemo(): void {
    if (!this.demoMode) throw new Error(INTEGRATION_MESSAGE);
  }

  private assertEditable(): void {
    this.assertDemo();
    if (!this.currentUser()) throw new Error('Entre na demonstração para alterar os projetos.');
  }

  private validatePassword(password: string): void {
    if (typeof password !== 'string' || password.length < 8)
      throw new Error(
        'A senha deve ter pelo menos 8 caracteres. Na demonstração, use uma senha fictícia.',
      );
    if (password.length > 128) throw new Error('A senha deve ter até 128 caracteres.');
  }

  private requireProject(projectId: string): Project {
    const project = this.currentProjects().find((item) => item.id === projectId);
    if (!project) throw new Error('O projeto não foi encontrado.');
    return project;
  }

  private changeProject(projectId: string, change: (project: Project) => Project): void {
    this.assertEditable();
    const original = this.requireProject(projectId);
    const updated = parseProject({
      ...change(original),
      id: original.id,
      createdAt: original.createdAt,
      updatedAt: new Date().toISOString(),
    });
    this.commitProjects(
      this.currentProjects().map((project) => (project.id === projectId ? updated : project)),
    );
  }

  private newId(): string {
    return (
      globalThis.crypto?.randomUUID?.() ??
      `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    );
  }

  private restoreProjects(): Project[] {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(PROJECTS_KEY);
      this.lastSavedProjects = raw;
      if (!raw) return createDemoProjects();
      const saved: unknown = JSON.parse(raw);
      if (!record(saved) || saved['version'] !== 1) throw new Error('Versão desconhecida.');
      return list(saved['projects'], 250, parseProject);
    } catch {
      this.unreadableProjects = raw;
      this.setStorageError(
        'project',
        raw
          ? 'Os projetos salvos não puderam ser lidos. Exibimos exemplos; uma cópia dos dados anteriores será preservada ao salvar uma nova alteração.'
          : 'O navegador não permitiu ler os projetos salvos. As alterações só serão confirmadas quando puderem ser salvas.',
      );
      return createDemoProjects();
    }
  }

  private restoreProfile(): void {
    try {
      const raw = sessionStorage.getItem(PROFILE_KEY);
      if (!raw) return;
      this.currentUser.set(parseProfile(JSON.parse(raw)));
    } catch {
      this.setStorageError(
        'profile',
        'A sessão local não pôde ser recuperada. Entre novamente na demonstração.',
      );
    }
  }

  private saveProfile(profile: Profile): void {
    const normalized = parseProfile(profile);
    try {
      sessionStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
    } catch {
      this.setStorageError(
        'profile',
        'Não foi possível salvar o perfil nesta sessão. Verifique o espaço disponível e permita o armazenamento no navegador.',
      );
      throw new Error(this.storageError());
    }
    this.currentUser.set(normalized);
    this.setStorageError('profile', '');
  }

  private commitProjects(projects: Project[]): void {
    const validated = list(projects, 250, parseProject);
    const serialized = JSON.stringify({ version: 1, projects: validated });
    try {
      if (localStorage.getItem(PROJECTS_KEY) !== this.lastSavedProjects) {
        const message =
          'Os projetos foram alterados em outra aba. Recarregue esta página antes de salvar para evitar perder alterações.';
        this.setStorageError('project', message);
        throw new WorkspaceConflictError(message);
      }
      if (this.unreadableProjects !== null) {
        localStorage.setItem(`${PROJECTS_KEY}.recovery`, this.unreadableProjects);
      }
      localStorage.setItem(PROJECTS_KEY, serialized);
    } catch (error) {
      if (error instanceof WorkspaceConflictError) throw error;
      this.setStorageError(
        'project',
        'Não foi possível salvar as alterações. Seus dados anteriores foram mantidos. Verifique o espaço disponível e o armazenamento do navegador.',
      );
      throw new Error(this.storageError());
    }
    this.unreadableProjects = null;
    this.lastSavedProjects = serialized;
    this.currentProjects.set(validated);
    this.setStorageError('project', '');
  }

  private setStorageError(source: 'project' | 'profile', message: string): void {
    if (source === 'project') this.projectStorageError = message;
    else this.profileStorageError = message;
    this.storageError.set(
      [this.projectStorageError, this.profileStorageError].filter(Boolean).join(' '),
    );
  }
}
