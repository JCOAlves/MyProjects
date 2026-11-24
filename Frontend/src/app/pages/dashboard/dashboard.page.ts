import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project, ProjectIcon, ProjectInput } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { WorkspaceService } from '../../core/workspace.service';
import { IconComponent } from '../../shared/icon.component';
import { IllustrationComponent } from '../../shared/illustration.component';
import { ModalComponent } from '../../shared/modal.component';

type ProjectFilter = 'all' | 'in-progress' | 'completed';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, IllustrationComponent, ModalComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  readonly workspace = inject(WorkspaceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly allProjects = signal(false);
  readonly query = signal('');
  readonly filter = signal<ProjectFilter>('all');
  readonly pageSize = signal(9);
  readonly creating = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly discardPrompt = signal(false);
  readonly firstName = computed(
    () => this.workspace.user()?.name.trim().split(/\s+/)[0] || 'Visitante',
  );
  readonly totalProjects = computed(() => this.workspace.projects().length);
  readonly completedTasks = computed(() =>
    this.workspace
      .projects()
      .reduce((sum, project) => sum + project.tasks.filter((task) => task.done).length, 0),
  );
  readonly ongoingProjects = computed(
    () => this.workspace.projects().filter((project) => !this.isComplete(project)).length,
  );
  readonly filteredProjects = computed(() => {
    const query = this.normalize(this.query().trim());
    const filter = this.filter();
    return [...this.workspace.projects()]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .filter(
        (project) =>
          !this.allProjects() ||
          ((!query || this.normalize(`${project.title} ${project.description}`).includes(query)) &&
            (filter === 'all' || this.isComplete(project) === (filter === 'completed'))),
      );
  });
  readonly visibleProjects = computed(() =>
    this.filteredProjects().slice(0, this.allProjects() ? this.pageSize() : 6),
  );
  readonly icons: { value: ProjectIcon; label: string }[] = [
    { value: 'folder', label: 'Pasta' },
    { value: 'laptop', label: 'Computador' },
    { value: 'bulb', label: 'Ideia' },
    { value: 'chart', label: 'Gráfico' },
    { value: 'book', label: 'Livro' },
    { value: 'rocket', label: 'Foguete' },
  ];
  readonly filters: { value: ProjectFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'in-progress', label: 'Em andamento' },
    { value: 'completed', label: 'Concluídos' },
  ];
  draft: ProjectInput = this.emptyDraft();
  attempted = false;
  private navigationResolve: ((allowed: boolean) => void) | null = null;

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.allProjects.set(Boolean(data['allProjects'])));
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const filter = params.get('filter');
      this.query.set(params.get('q') || '');
      if (params.get('buscar') === '1') {
        requestAnimationFrame(() => document.getElementById('project-search')?.focus());
      }
      this.filter.set(filter === 'in-progress' || filter === 'completed' ? filter : 'all');
      this.pageSize.set(9);
    });
  }

  get titleError(): string {
    if (!this.attempted) return '';
    if (!this.draft.title.trim()) return 'Informe o nome do projeto.';
    return this.draft.title.trim().length > 120 ? 'Use até 120 caracteres no nome.' : '';
  }

  private emptyDraft(): ProjectInput {
    return { title: '', description: '', icon: 'folder', color: 'blue' };
  }
  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }
  private isComplete(project: Project): boolean {
    return project.tasks.length > 0 && project.tasks.every((task) => task.done);
  }
  progress(project: Project): number {
    return project.tasks.length
      ? Math.round((project.tasks.filter((task) => task.done).length / project.tasks.length) * 100)
      : 0;
  }

  updatedLabel(value: string): string {
    const days = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 86400000));
    if (days === 0) return 'Atualizado hoje';
    if (days === 1) return 'Atualizado ontem';
    if (days < 7) return `Atualizado há ${days} dias`;
    if (days < 14) return 'Atualizado há 1 semana';
    if (days < 30) return `Atualizado há ${Math.floor(days / 7)} semanas`;
    return `Atualizado em ${new Intl.DateTimeFormat('pt-BR').format(new Date(value))}`;
  }

  fullDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(
      new Date(value),
    );
  }

  search(value: string): void {
    this.query.set(value);
    this.pageSize.set(9);
    this.syncQuery();
  }

  clearSearch(input: HTMLInputElement): void {
    this.search('');
    input.focus();
  }

  setFilter(value: ProjectFilter): void {
    this.filter.set(value);
    this.pageSize.set(9);
    this.syncQuery();
  }

  private syncQuery(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.query() || null,
        filter: this.filter() === 'all' ? null : this.filter(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  resetFilters(): void {
    this.query.set('');
    this.filter.set('all');
    this.pageSize.set(9);
    this.syncQuery();
  }
  showMore(): void {
    this.pageSize.update((size) => size + 9);
  }

  openCreate(): void {
    this.draft = this.emptyDraft();
    this.attempted = false;
    this.formError.set('');
    this.discardPrompt.set(false);
    this.creating.set(true);
  }

  private isDirty(): boolean {
    return this.creating() && JSON.stringify(this.draft) !== JSON.stringify(this.emptyDraft());
  }

  closeCreate(): void {
    if (this.saving()) return;
    if (this.isDirty()) {
      this.discardPrompt.set(true);
      return;
    }
    this.creating.set(false);
  }

  continueEditing(): void {
    this.discardPrompt.set(false);
    this.navigationResolve?.(false);
    this.navigationResolve = null;
  }

  discardChanges(): void {
    this.discardPrompt.set(false);
    this.creating.set(false);
    this.navigationResolve?.(true);
    this.navigationResolve = null;
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (!this.isDirty()) return true;
    this.discardPrompt.set(true);
    this.navigationResolve?.(false);
    return new Promise((resolve) => {
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

  @HostListener('document:click', ['$event'])
  closeOutsideMenus(event: MouseEvent): void {
    for (const menu of document.querySelectorAll<HTMLDetailsElement>(
      'details.project-menu[open]',
    )) {
      if (!menu.contains(event.target as Node)) menu.open = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeMenus(): void {
    for (const menu of document.querySelectorAll<HTMLDetailsElement>(
      'details.project-menu[open]',
    )) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  }

  create(): void {
    if (this.saving() || this.discardPrompt()) return;
    this.attempted = true;
    this.formError.set('');
    if (this.titleError) {
      requestAnimationFrame(() => document.getElementById('new-project-title')?.focus());
      return;
    }
    if (this.draft.description.length > 5000) {
      this.formError.set('Use até 5.000 caracteres na descrição.');
      return;
    }
    this.saving.set(true);
    try {
      const project = this.workspace.createProject(this.draft);
      this.creating.set(false);
      this.discardPrompt.set(false);
      this.resetFilters();
      this.toast.show('Projeto criado com sucesso.');
      requestAnimationFrame(() => document.getElementById(`project-${project.id}`)?.focus());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o projeto. Tente novamente.';
      this.formError.set(message);
      this.toast.show(message, 'error');
    } finally {
      this.saving.set(false);
    }
  }
}
