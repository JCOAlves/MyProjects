import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceService } from '../../core/workspace.service';
import { BrandComponent } from '../../shared/brand.component';
import { IconComponent } from '../../shared/icon.component';
import { IllustrationComponent } from '../../shared/illustration.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, BrandComponent, IconComponent, IllustrationComponent, ThemeToggleComponent],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class LandingPage {
  readonly workspace = inject(WorkspaceService);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal('');

  async explore(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.workspace.startDemo();
      await this.router.navigateByUrl('/home');
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir a demonstração. Tente novamente.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
