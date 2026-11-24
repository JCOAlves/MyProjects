import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkspaceService } from '../../core/workspace.service';
import { BrandComponent } from '../../shared/brand.component';
import { IconComponent } from '../../shared/icon.component';
import { IllustrationComponent } from '../../shared/illustration.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { focusInvalidField, safeReturnUrl, validEmail } from './auth-navigation';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    BrandComponent,
    IconComponent,
    IllustrationComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './login.page.html',
  styleUrl: './auth.css',
})
export class LoginPage {
  readonly workspace = inject(WorkspaceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  email = '';
  password = '';
  attempted = false;
  readonly busy = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal('');

  get emailError(): string {
    if (!this.attempted) return '';
    return validEmail(this.email) ? '' : 'Informe um email válido, como nome@exemplo.com.';
  }

  get passwordError(): string {
    if (!this.attempted) return '';
    if (this.password.length < 8) return 'Use uma senha com pelo menos 8 caracteres.';
    return this.password.length > 128 ? 'Use até 128 caracteres na senha.' : '';
  }

  async submit(form: HTMLFormElement): Promise<void> {
    if (this.busy()) return;
    this.attempted = true;
    this.error.set('');
    if (this.emailError || this.passwordError) {
      focusInvalidField(form);
      return;
    }
    this.busy.set(true);
    try {
      await this.workspace.signIn(this.email.trim(), this.password);
      this.password = '';
      await this.router.navigateByUrl(
        safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
      );
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar. Confira os dados e tente novamente.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
