import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { BrandComponent } from './brand.component';
import { IconComponent } from './icon.component';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ModalComponent } from './modal.component';
import { WorkspaceService } from '../core/workspace.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    BrandComponent,
    IconComponent,
    ThemeToggleComponent,
    ModalComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  readonly workspace = inject(WorkspaceService);
  readonly router = inject(Router);
  readonly toasts = inject(ToastService);
  readonly showNotifications = signal(false);
  readonly path = signal(this.router.url);
  readonly firstName = computed(
    () => this.workspace.user()?.name.trim().split(' ')[0] || 'Meu perfil',
  );
  readonly initial = computed(() => this.firstName().charAt(0).toUpperCase());
  readonly pendingTasks = computed(() =>
    this.workspace
      .projects()
      .flatMap((project) =>
        project.tasks
          .filter((task) => !task.done)
          .map((task) => ({ ...task, projectId: project.id, projectTitle: project.title })),
      )
      .sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'))
      .slice(0, 5),
  );
  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.path.set(this.router.url);
        this.showNotifications.set(false);
      });
  }
  async signOut(): Promise<void> {
    // Navigate first so a page's unsaved-change guard can keep the session intact.
    const navigated = await this.router.navigate(['/']);
    if (!navigated) return;
    try {
      this.workspace.signOut();
    } catch (error) {
      this.toasts.show(
        error instanceof Error ? error.message : 'Não foi possível sair. Tente novamente.',
        'error',
      );
    }
  }
  search(): void {
    void this.router.navigate(['/projetos'], { queryParams: { buscar: '1' } });
  }
}
