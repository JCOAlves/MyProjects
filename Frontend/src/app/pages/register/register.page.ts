import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceService } from '../../core/workspace.service';
import { BrandComponent } from '../../shared/brand.component';
import { IconComponent } from '../../shared/icon.component';
import { IllustrationComponent } from '../../shared/illustration.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { focusInvalidField, validEmail } from '../login/auth-navigation';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    BrandComponent,
    IconComponent,
    IllustrationComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './register.page.html',
  styleUrl: '../login/auth.css',
})
export class RegisterPage {
  readonly workspace = inject(WorkspaceService);
  private readonly router = inject(Router);
  name = '';
  email = '';
  password = '';
  confirmation = '';
  attempted = false;
  readonly busy = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmation = signal(false);
  readonly error = signal('');

  get nameError(): string {
    if (!this.attempted) return '';
    if (this.name.trim().length < 2) return 'Informe seu nome completo.';
    return this.name.trim().length > 100 ? 'Use até 100 caracteres no nome.' : '';
  }

  get emailError(): string {
    if (!this.attempted) return '';
    return validEmail(this.email) ? '' : 'Informe um email válido, como nome@exemplo.com.';
  }

  get passwordError(): string {
    if (!this.attempted) return '';
    if (this.password.length < 8) return 'Use uma senha com pelo menos 8 caracteres.';
    return this.password.length > 128 ? 'Use até 128 caracteres na senha.' : '';
  }

  get confirmationError(): string {
    if (!this.attempted) return '';
    if (!this.confirmation) return 'Digite a senha novamente.';
    return this.confirmation !== this.password ? 'As senhas precisam ser iguais.' : '';
  }

  async submit(form: HTMLFormElement): Promise<void> {
    if (this.busy()) return;
    this.attempted = true;
    this.error.set('');
    if (this.nameError || this.emailError || this.passwordError || this.confirmationError) {
      focusInvalidField(form);
      return;
    }
    this.busy.set(true);
    try {
      await this.workspace.signUp(this.name.trim(), this.email.trim(), this.password);
      this.password = '';
      this.confirmation = '';
      await this.router.navigateByUrl('/home');
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta. Confira os dados e tente novamente.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
