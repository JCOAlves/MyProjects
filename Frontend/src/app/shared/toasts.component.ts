import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [IconComponent],
  template: `<div class="toast-region" aria-live="polite" aria-relevant="additions">
    @for (toast of toasts.messages(); track toast.id) {
      <div class="toast" [class.toast-error]="toast.tone === 'error'" role="status">
        <app-icon
          [name]="
            toast.tone === 'success' ? 'check-circle' : toast.tone === 'error' ? 'alert' : 'info'
          "
          [size]="22"
        /><span>{{ toast.message }}</span
        ><button
          class="icon-button"
          type="button"
          aria-label="Fechar aviso"
          (click)="toasts.dismiss(toast.id)"
        >
          <app-icon name="x" [size]="17" />
        </button>
      </div>
    }
  </div>`,
})
export class ToastsComponent {
  readonly toasts = inject(ToastService);
}
