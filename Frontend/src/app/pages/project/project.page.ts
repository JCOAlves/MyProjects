import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Collaborator, Note, Project, ProjectIcon, Task } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { WorkspaceService } from '../../core/workspace.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

type Tab = 'tasks' | 'notes' | 'sharing' | 'settings';
type Editor = 'project' | 'task' | 'note' | 'member' | null;
interface Confirmation {
  title: string;
  description: string;
  label: string;
  danger: boolean;
  action: () => void;
  success: string;
}

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, ModalComponent],
  templateUrl: './project.page.html',
  styleUrl: './project.page.css',
})
export class ProjectPage {
  readonly workspace = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly projectId = signal('');
  readonly project = computed(() =>
    this.workspace.projects().find((p) => p.id === this.projectId()),
  );
  readonly activeTab = signal<Tab>('tasks');
  readonly taskFilter = signal<'all' | 'pending' | 'done'>('pending');
  readonly visibleTasks = computed(() => {
    const filter = this.taskFilter();
    return (this.project()?.tasks ?? []).filter(
      (task) => filter === 'all' || task.done === (filter === 'done'),
    );
  });
  readonly completedCount = computed(
    () => this.project()?.tasks.filter((task) => task.done).length ?? 0,
  );
  readonly progress = computed(() => {
    const total = this.project()?.tasks.length ?? 0;
    return total ? Math.round((this.completedCount() / total) * 100) : 0;
  });
  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'tasks', label: 'Tarefas', icon: 'check-circle' },
    { id: 'notes', label: 'Anotações', icon: 'note' },
    { id: 'sharing', label: 'Compartilhamento', icon: 'users' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ];
  readonly icons: { value: ProjectIcon; label: string }[] = [
    { value: 'folder', label: 'Pasta' },
    { value: 'laptop', label: 'Computador' },
    { value: 'bulb', label: 'Ideia' },
    { value: 'chart', label: 'Gráfico' },
    { value: 'book', label: 'Livro' },
    { value: 'rocket', label: 'Foguete' },
  ];
  editor: Editor = null;
  editingId = '';
  saving = false;
  formError = '';
  errors: Record<string, string> = {};
  discardPrompt = false;
  confirmation: Confirmation | null = null;
  projectDraft: { title: string; description: string; icon: ProjectIcon; color: Project['color'] } =
    {
      title: '',
      description: '',
      icon: 'folder',
      color: 'blue',
    };
  taskDraft: Omit<Task, 'id'> = {
    title: '',
    description: '',
    priority: 'medium',
    done: false,
    deadline: '',
  };
  noteDraft = { title: '', content: '' };
  memberDraft: Omit<Collaborator, 'id'> = { name: '', email: '', role: 'viewer' };
  private baseline = '';
  private navigationResolve: ((allowed: boolean) => void) | null = null;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => this.projectId.set(params.get('id') ?? ''));
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = params.get('tab');
      this.activeTab.set(this.tabs.some((item) => item.id === tab) ? (tab as Tab) : 'tasks');
    });
  }

  setTab(tab: Tab): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'tasks' ? null : tab },
      queryParamsHandling: 'merge',
    });
  }

  tabKeydown(event: KeyboardEvent, index: number): void {
    let target = index;
    if (event.key === 'ArrowRight') target = (index + 1) % this.tabs.length;
    else if (event.key === 'ArrowLeft') target = (index - 1 + this.tabs.length) % this.tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = this.tabs.length - 1;
    else return;
    event.preventDefault();
    this.setTab(this.tabs[target].id);
    document.getElementById(`project-tab-${this.tabs[target].id}`)?.focus();
  }

  priorityLabel(priority: Task['priority']): string {
    return { high: 'Alta', medium: 'Média', low: 'Baixa' }[priority];
  }

  dateLabel(date: string): string {
    if (!date) return 'Sem prazo';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    return match ? `${match[3]}/${match[2]}` : 'Sem prazo';
  }

  initials(name: string): string {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase() || 'P'
    );
  }

  openProject(): void {
    const p = this.project();
    if (!p) return;
    this.projectDraft = {
      title: p.title,
      description: p.description,
      icon: p.icon,
      color: p.color,
    };
    this.beginEditor('project');
  }

  openTask(task?: Task): void {
    this.editingId = task?.id ?? '';
    this.taskDraft = task
      ? {
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          done: task.done,
          deadline: task.deadline,
        }
      : { title: '', description: '', priority: 'medium', done: false, deadline: '' };
    this.beginEditor('task');
  }

  openNote(note?: Note): void {
    this.editingId = note?.id ?? '';
    this.noteDraft = { title: note?.title ?? '', content: note?.content ?? '' };
    this.beginEditor('note');
  }

  openMember(member?: Collaborator): void {
    this.editingId = member?.id ?? '';
    this.memberDraft = {
      name: member?.name ?? '',
      email: member?.email ?? '',
      role: member?.role ?? 'viewer',
    };
    this.beginEditor('member');
  }

  private beginEditor(editor: Editor): void {
    this.editor = editor;
    this.errors = {};
    this.formError = '';
    this.discardPrompt = false;
    this.baseline = this.draftSnapshot();
  }

  get editorTitle(): string {
    if (this.editor === 'project') return 'Editar projeto';
    if (this.editor === 'task') return this.editingId ? 'Editar tarefa' : 'Nova tarefa';
    if (this.editor === 'note') return this.editingId ? 'Editar anotação' : 'Nova anotação';
    return this.editingId ? 'Alterar permissão' : 'Adicionar colaborador';
  }

  get editorDescription(): string {
    if (this.editor === 'member')
      return 'As permissões abaixo são apenas uma simulação neste navegador. Nenhum convite será enviado.';
    if (this.editor === 'task') return 'Defina o que precisa ser feito e acompanhe cada etapa.';
    if (this.editor === 'note') return 'Guarde ideias e informações importantes para este projeto.';
    return 'Atualize o nome, a descrição e a identidade do projeto.';
  }

  get submitLabel(): string {
    if (this.editor === 'member')
      return this.editingId ? 'Revisar alteração' : 'Revisar colaborador';
    if (this.editor === 'task' && !this.editingId) return 'Criar tarefa';
    if (this.editor === 'note' && !this.editingId) return 'Criar anotação';
    return 'Salvar alterações';
  }

  closeEditor(): void {
    if (this.saving) return;
    if (this.isDirty()) {
      this.showDiscardPrompt();
      return;
    }
    this.finishClose();
  }

  continueEditing(): void {
    this.discardPrompt = false;
    this.navigationResolve?.(false);
    this.navigationResolve = null;
  }

  discardChanges(): void {
    this.finishClose();
    this.navigationResolve?.(true);
    this.navigationResolve = null;
  }

  private finishClose(): void {
    this.editor = null;
    this.discardPrompt = false;
    this.formError = '';
    this.errors = {};
  }

  private draftSnapshot(): string {
    return JSON.stringify(
      this.editor === 'project'
        ? this.projectDraft
        : this.editor === 'task'
          ? this.taskDraft
          : this.editor === 'note'
            ? this.noteDraft
            : this.memberDraft,
    );
  }

  private isDirty(): boolean {
    return this.editor !== null && this.draftSnapshot() !== this.baseline;
  }

  private showDiscardPrompt(): void {
    this.discardPrompt = true;
    requestAnimationFrame(() => document.getElementById('continue-project-edit')?.focus());
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (!this.isDirty()) return true;
    this.showDiscardPrompt();
    return new Promise<boolean>((resolve) => {
      this.navigationResolve = resolve;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.isDirty()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  saveEditor(): void {
    if (this.saving || !this.project()) return;
    this.errors = {};
    this.formError = '';
    if (this.editor === 'project') {
      if (!this.projectDraft.title.trim())
        this.errors['project-title'] = 'Informe o nome do projeto.';
      if (this.projectDraft.title.trim().length > 120)
        this.errors['project-title'] = 'Use até 120 caracteres no nome.';
    } else if (this.editor === 'task') {
      if (!this.taskDraft.title.trim()) this.errors['task-title'] = 'Informe o nome da tarefa.';
      if (this.taskDraft.title.trim().length > 100)
        this.errors['task-title'] = 'Use até 100 caracteres no nome.';
    } else if (this.editor === 'note') {
      if (!this.noteDraft.title.trim()) this.errors['note-title'] = 'Dê um título para a anotação.';
      if (!this.noteDraft.content.trim())
        this.errors['note-content'] = 'Escreva o conteúdo da anotação.';
    } else if (this.editor === 'member') {
      if (!this.memberDraft.name.trim())
        this.errors['member-name'] = 'Informe o nome do colaborador.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.memberDraft.email.trim()))
        this.errors['member-email'] = 'Informe um email válido, como nome@exemplo.com.';
      const email = this.memberDraft.email.trim().toLowerCase();
      if (
        !this.editingId &&
        (email === this.workspace.user()?.email.toLowerCase() ||
          this.project()?.members.some((member) => member.email.toLowerCase() === email))
      ) {
        this.errors['member-email'] = 'Este email já está associado ao projeto.';
      }
    }
    const firstError = Object.keys(this.errors)[0];
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }
    const id = this.projectId();
    if (this.editor === 'member') {
      const draft = {
        ...this.memberDraft,
        name: this.memberDraft.name.trim(),
        email: this.memberDraft.email.trim().toLowerCase(),
      };
      const memberId = this.editingId;
      const role =
        draft.role === 'editor'
          ? 'Editor: pode editar tarefas e anotações'
          : 'Leitor: pode visualizar o projeto';
      this.confirmation = {
        title: memberId ? 'Confirmar alteração de permissão' : 'Confirmar colaborador local',
        description: `${draft.name} (${draft.email}) terá o perfil ${role.toLowerCase()}. Esta é uma simulação local e nenhum email será enviado.`,
        label: memberId ? 'Alterar permissão' : 'Adicionar colaborador',
        danger: false,
        action: () =>
          memberId
            ? this.workspace.updateMember(id, memberId, draft.role)
            : this.workspace.addMember(id, draft),
        success: memberId
          ? 'Permissão atualizada na demonstração.'
          : 'Colaborador adicionado à demonstração.',
      };
      return;
    }
    this.mutate(
      () => {
        if (this.editor === 'project')
          this.workspace.updateProject(id, {
            ...this.projectDraft,
            title: this.projectDraft.title.trim(),
            description: this.projectDraft.description.trim(),
          });
        if (this.editor === 'task') {
          const task = {
            ...this.taskDraft,
            title: this.taskDraft.title.trim(),
            description: this.taskDraft.description?.trim() ?? '',
          };
          if (this.editingId) this.workspace.updateTask(id, this.editingId, task);
          else this.workspace.addTask(id, task);
        }
        if (this.editor === 'note') {
          const note = {
            title: this.noteDraft.title.trim(),
            content: this.noteDraft.content.trim(),
          };
          if (this.editingId) this.workspace.updateNote(id, this.editingId, note);
          else this.workspace.addNote(id, note);
        }
      },
      this.editor === 'project'
        ? 'Projeto atualizado.'
        : this.editor === 'task'
          ? this.editingId
            ? 'Tarefa atualizada.'
            : 'Tarefa criada.'
          : this.editingId
            ? 'Anotação atualizada.'
            : 'Anotação criada.',
    );
  }

  toggleTask(task: Task, event?: Event): void {
    this.mutate(
      () => this.workspace.updateTask(this.projectId(), task.id, { done: !task.done }),
      task.done ? 'Tarefa reaberta.' : 'Tarefa concluída.',
      false,
    );
    // Restore the controlled value if a local write failed.
    if (event?.target instanceof HTMLInputElement)
      event.target.checked =
        this.project()?.tasks.find((item) => item.id === task.id)?.done ?? task.done;
  }

  requestDeleteTask(task: Task): void {
    this.confirmation = {
      title: 'Excluir tarefa?',
      description: `A tarefa “${task.title}” será removida deste projeto. Esta ação não pode ser desfeita.`,
      label: 'Excluir tarefa',
      danger: true,
      action: () => this.workspace.deleteTask(this.projectId(), task.id),
      success: 'Tarefa excluída.',
    };
    this.formError = '';
  }

  requestDeleteNote(note: Note): void {
    this.confirmation = {
      title: 'Excluir anotação?',
      description: `A anotação “${note.title}” e seu conteúdo serão removidos. Esta ação não pode ser desfeita.`,
      label: 'Excluir anotação',
      danger: true,
      action: () => this.workspace.deleteNote(this.projectId(), note.id),
      success: 'Anotação excluída.',
    };
    this.formError = '';
  }

  requestDeleteMember(member: Collaborator): void {
    this.confirmation = {
      title: 'Remover colaborador?',
      description: `${member.name} será removido da lista de colaboradores deste projeto na demonstração local.`,
      label: 'Remover colaborador',
      danger: true,
      action: () => this.workspace.deleteMember(this.projectId(), member.id),
      success: 'Colaborador removido da demonstração.',
    };
    this.formError = '';
  }

  requestDeleteProject(): void {
    const p = this.project();
    if (!p) return;
    this.confirmation = {
      title: 'Excluir projeto?',
      description: `“${p.title}”, suas ${p.tasks.length} tarefas e ${p.notes.length} anotações serão excluídos deste navegador. Esta ação não pode ser desfeita.`,
      label: 'Excluir projeto',
      danger: true,
      action: () => {
        this.workspace.deleteProject(p.id);
        void this.router.navigate(['/projetos']);
      },
      success: 'Projeto excluído.',
    };
    this.formError = '';
  }

  cancelConfirmation(): void {
    if (this.saving) return;
    this.confirmation = null;
    this.formError = '';
  }

  confirmAction(): void {
    const confirmation = this.confirmation;
    if (confirmation) this.mutate(confirmation.action, confirmation.success);
  }

  private mutate(action: () => void, message: string, close = true): void {
    if (this.saving) return;
    this.saving = true;
    this.formError = '';
    try {
      action();
      this.toast.show(message, 'success');
      if (close) {
        this.confirmation = null;
        this.finishClose();
      }
    } catch (error) {
      this.formError =
        error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.';
      if (!this.editor && !this.confirmation) this.toast.show(this.formError, 'error');
    } finally {
      this.saving = false;
    }
  }
}
