import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import environment from '../../environments/environment';
import { WorkspaceService } from './workspace.service';

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();
  get length(): number {
    return this.entries.size;
  }
  clear(): void {
    this.entries.clear();
  }
  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.entries.delete(key);
  }
  setItem(key: string, value: string): void {
    this.entries.set(key, String(value));
  }
}

const PROJECTS_KEY = 'ppi.workspace.v1';
const PROFILE_KEY = 'ppi.demo-session.v1';
const projectInput = {
  title: 'Projeto de teste',
  description: 'Descrição',
  icon: 'folder' as const,
  color: 'blue' as const,
};

describe('WorkspaceService — state integrity of the local demonstration', () => {
  let local: MemoryStorage;
  let session: MemoryStorage;
  const originalDemoMode = environment.demoMode;

  beforeEach(() => {
    local = new MemoryStorage();
    session = new MemoryStorage();
    vi.stubGlobal('localStorage', local);
    vi.stubGlobal('sessionStorage', session);
    environment.demoMode = true;
  });

  afterEach(() => {
    environment.demoMode = originalDemoMode;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('derives the reference progress from real tasks rather than decorative percentages', () => {
    const service = new WorkspaceService();
    expect(
      service
        .projects()
        .map(
          (project) =>
            (100 * project.tasks.filter((task) => task.done).length) / project.tasks.length,
        ),
    ).toEqual([70, 40, 80]);
    expect(
      service
        .projects()
        .flatMap((project) => project.tasks)
        .filter((task) => task.done),
    ).toHaveLength(13);
    expect(service.user()).toBeNull();
    expect(() => service.createProject(projectInput)).toThrow(/Entre na demonstração/);
  });

  it('never persists supplied passwords, and clearly keeps a single demonstration workspace', async () => {
    const service = new WorkspaceService();
    const password = 'Ficticia-7249';
    await service.signUp('Pessoa de Teste', 'pessoa@example.com', password);
    const created = service.createProject(projectInput);
    expect(session.getItem(PROFILE_KEY)).not.toContain(password);
    expect(local.getItem(PROJECTS_KEY)).not.toContain(password);
    expect(local.getItem(PROFILE_KEY)).toBeNull();
    service.signOut();
    expect(session.getItem(PROFILE_KEY)).toBeNull();
    await service.signIn('outra@example.com', 'OutraFicticia');
    expect(service.projects().some((project) => project.id === created.id)).toBe(true);
  });

  it('persists nested changes and restores the exact edited workspace', async () => {
    const service = new WorkspaceService();
    await service.startDemo();
    const created = service.createProject(projectInput);
    service.addTask(created.id, {
      title: 'Revisar',
      done: false,
      deadline: '2026-11-30',
      priority: 'high',
    });
    const task = service.projects()[0].tasks[0];
    service.updateTask(created.id, task.id, { done: true });
    service.addNote(created.id, { title: 'Revisão', content: 'Conferir os diagramas.' });
    service.addMember(created.id, { name: 'Colega', email: 'colega@example.com', role: 'viewer' });
    const member = service.projects()[0].members[0];
    service.updateMember(created.id, member.id, 'editor');
    const reloaded = new WorkspaceService();
    expect(reloaded.projects()).toEqual(service.projects());
    expect(reloaded.projects()[0].tasks[0].done).toBe(true);
    expect(reloaded.projects()[0].members[0].role).toBe('editor');
  });

  it('does not mutate visible state or existing data if a project write fails', async () => {
    const service = new WorkspaceService();
    await service.startDemo();
    service.createProject(projectInput);
    const before = service.projects();
    const savedBefore = local.getItem(PROJECTS_KEY);
    vi.spyOn(local, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    expect(() => service.deleteProject(before[0].id)).toThrow(/dados anteriores foram mantidos/);
    expect(service.projects()).toBe(before);
    expect(local.getItem(PROJECTS_KEY)).toBe(savedBefore);
    expect(service.storageError()).toContain('Não foi possível salvar');
  });

  it('preserves the displayed profile on session write failure and recovers after retry', async () => {
    const service = new WorkspaceService();
    await service.startDemo();
    const before = service.user();
    const write = vi.spyOn(session, 'setItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    expect(() => service.updateProfile({ name: 'Novo nome', email: 'novo@example.com' })).toThrow(
      /Não foi possível salvar o perfil/,
    );
    expect(service.user()).toBe(before);
    write.mockRestore();
    service.updateProfile({ name: 'Novo nome', email: 'novo@example.com' });
    expect(service.user()?.name).toBe('Novo nome');
    expect(service.storageError()).toBe('');
  });

  it('keeps corrupt original data until it can be backed up before a new write', async () => {
    const corrupt = '{ malformed saved workspace';
    local.setItem(PROJECTS_KEY, corrupt);
    const service = new WorkspaceService();
    expect(service.projects()).toHaveLength(3);
    expect(service.storageError()).toContain('não puderam ser lidos');
    expect(local.getItem(PROJECTS_KEY)).toBe(corrupt);
    await service.startDemo();
    service.createProject(projectInput);
    expect(local.getItem(`${PROJECTS_KEY}.recovery`)).toBe(corrupt);
    expect(JSON.parse(local.getItem(PROJECTS_KEY)!).projects).toHaveLength(4);
    expect(service.storageError()).toBe('');
  });

  it('rejects a stale write from another tab without silently overwriting newer projects', async () => {
    const firstTab = new WorkspaceService();
    const secondTab = new WorkspaceService();
    await firstTab.startDemo();
    await secondTab.startDemo();
    firstTab.createProject({ ...projectInput, title: 'Alterado na primeira aba' });
    const savedBefore = local.getItem(PROJECTS_KEY);
    const secondBefore = secondTab.projects();
    expect(() =>
      secondTab.createProject({ ...projectInput, title: 'Alterado na segunda aba' }),
    ).toThrow(/outra aba/);
    expect(secondTab.projects()).toBe(secondBefore);
    expect(local.getItem(PROJECTS_KEY)).toBe(savedBefore);
  });

  it('restores an intentionally empty workspace without reseeding deleted projects', async () => {
    const service = new WorkspaceService();
    await service.startDemo();
    const ids = service.projects().map((project) => project.id);
    ids.forEach((projectId) => service.deleteProject(projectId));
    expect(new WorkspaceService().projects()).toEqual([]);
  });

  it('rejects invalid dates and duplicate collaborator emails before persistence', async () => {
    const service = new WorkspaceService();
    await service.startDemo();
    const project = service.projects()[0];
    expect(() =>
      service.addTask(project.id, {
        title: 'Inválida',
        done: false,
        deadline: '2026-02-30',
        priority: 'low',
      }),
    ).toThrow(/data válida/);
    service.addMember(project.id, { name: 'Colega', email: 'COLEGA@example.com', role: 'viewer' });
    expect(() =>
      service.addMember(project.id, {
        name: 'Duplicada',
        email: 'colega@example.com',
        role: 'editor',
      }),
    ).toThrow(/já está/);
    expect(service.projects()[0].members).toHaveLength(1);
  });

  it('fails closed in API mode without exposing demo state or dispatching fictional auth requests', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    environment.demoMode = false;
    const service = new WorkspaceService();
    expect(service.projects()).toEqual([]);
    expect(service.user()).toBeNull();
    await expect(service.signIn('pessoa@example.com', 'SenhaFicticia')).rejects.toThrow(
      /backend precisa implementar/,
    );
    await expect(service.signUp('Pessoa', 'pessoa@example.com', 'SenhaFicticia')).rejects.toThrow(
      /backend precisa implementar/,
    );
    await expect(service.startDemo()).rejects.toThrow(/backend precisa implementar/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
