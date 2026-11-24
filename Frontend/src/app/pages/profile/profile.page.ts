import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../core/workspace.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, IconComponent, ModalComponent],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
})
export class ProfilePage {
  readonly workspace = inject(WorkspaceService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly saving = signal(false);
  readonly photoBusy = signal(false);
  readonly photoError = signal('');
  readonly saveError = signal('');
  readonly discardOpen = signal(false);
  name = this.workspace.user()?.name ?? '';
  email = this.workspace.user()?.email ?? '';
  avatar = this.workspace.user()?.avatar ?? '';
  errors: Record<string, string> = {};
  private baseline = this.snapshot();
  private uploadVersion = 0;
  private navigationResolve: ((allowed: boolean) => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.uploadVersion++;
      this.navigationResolve?.(false);
    });
  }

  get initial(): string {
    return this.name.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'P';
  }

  get dirty(): boolean {
    return this.snapshot() !== this.baseline;
  }

  private snapshot(): string {
    return JSON.stringify({ name: this.name, email: this.email, avatar: this.avatar });
  }

  async selectPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const version = ++this.uploadVersion;
    this.photoBusy.set(false);
    this.photoError.set('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.photoError.set('Escolha uma imagem PNG, JPEG ou WebP.');
      return;
    }
    if (file.size > 1024 * 1024) {
      this.photoError.set('A foto deve ter no máximo 1 MB. Escolha uma imagem menor.');
      return;
    }
    if (file.size === 0) {
      this.photoError.set('O arquivo está vazio. Escolha outra imagem.');
      return;
    }
    this.photoBusy.set(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!this.validSignature(bytes, file.type))
        throw new Error('O arquivo não corresponde a uma imagem PNG, JPEG ou WebP válida.');
      const dataUrl = await this.readDataUrl(file);
      const image = new Image();
      image.src = dataUrl;
      try {
        await image.decode();
      } catch {
        throw new Error('Não foi possível abrir esta imagem. Escolha outro arquivo.');
      }
      if (
        !image.naturalWidth ||
        !image.naturalHeight ||
        image.naturalWidth > 4096 ||
        image.naturalHeight > 4096
      ) {
        throw new Error('Escolha uma imagem com dimensões de até 4096 × 4096 pixels.');
      }
      if (version !== this.uploadVersion || this.destroyRef.destroyed) return;
      this.avatar = dataUrl;
    } catch (error) {
      if (version === this.uploadVersion && !this.destroyRef.destroyed)
        this.photoError.set(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a foto. Tente outro arquivo.',
        );
    } finally {
      if (version === this.uploadVersion && !this.destroyRef.destroyed) this.photoBusy.set(false);
    }
  }

  private validSignature(bytes: Uint8Array, mime: string): boolean {
    if (mime === 'image/png')
      return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
    if (mime === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    return (
      bytes.length > 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    );
  }

  private readDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Não foi possível ler a foto.'));
      reader.onerror = () =>
        reject(new Error('Não foi possível ler a foto. Escolha outro arquivo.'));
      reader.onabort = () => reject(new Error('O carregamento da foto foi interrompido.'));
      reader.readAsDataURL(file);
    });
  }

  removePhoto(): void {
    if (this.photoBusy() || this.saving()) return;
    this.avatar = '';
    this.photoError.set('');
  }

  save(): void {
    if (this.saving() || this.photoBusy()) return;
    this.errors = {};
    this.saveError.set('');
    if (this.name.trim().length < 2)
      this.errors['profile-name'] = 'Informe um nome com pelo menos 2 caracteres.';
    if (this.name.trim().length > 100)
      this.errors['profile-name'] = 'O nome deve ter até 100 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) || this.email.trim().length > 100)
      this.errors['profile-email'] = 'Informe um email válido com até 100 caracteres.';
    const firstError = Object.keys(this.errors)[0];
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }
    this.saving.set(true);
    try {
      this.workspace.updateProfile({
        name: this.name.trim(),
        email: this.email.trim().toLowerCase(),
        avatar: this.avatar || undefined,
      });
      this.name = this.workspace.user()!.name;
      this.email = this.workspace.user()!.email;
      this.baseline = this.snapshot();
      this.toast.show('Perfil atualizado.', 'success');
    } catch (error) {
      this.saveError.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar seu perfil. Tente novamente.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (!this.dirty && !this.photoBusy()) return true;
    this.navigationResolve?.(false);
    this.discardOpen.set(true);
    return new Promise<boolean>((resolve) => {
      this.navigationResolve = resolve;
    });
  }

  keepEditing(): void {
    this.discardOpen.set(false);
    this.navigationResolve?.(false);
    this.navigationResolve = null;
  }

  discardChanges(): void {
    this.uploadVersion++;
    this.photoBusy.set(false);
    this.name = this.workspace.user()?.name ?? '';
    this.email = this.workspace.user()?.email ?? '';
    this.avatar = this.workspace.user()?.avatar ?? '';
    this.baseline = this.snapshot();
    this.errors = {};
    this.photoError.set('');
    this.saveError.set('');
    this.discardOpen.set(false);
    this.navigationResolve?.(true);
    this.navigationResolve = null;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty || this.photoBusy()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}
