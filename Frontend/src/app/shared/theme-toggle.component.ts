import { Component, inject } from '@angular/core';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IconComponent],
  template: `<button
    class="icon-button"
    type="button"
    (click)="theme.toggle()"
    [attr.aria-label]="theme.dark() ? 'Ativar tema claro' : 'Ativar tema escuro'"
    [attr.title]="theme.dark() ? 'Ativar tema claro' : 'Ativar tema escuro'"
    [attr.aria-pressed]="theme.dark()"
  >
    <app-icon [name]="theme.dark() ? 'moon' : 'sun'" [size]="21" />
  </button>`,
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
