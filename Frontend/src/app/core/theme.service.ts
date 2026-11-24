import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(document.documentElement.dataset['theme'] === 'dark');
  toggle(): void {
    this.dark.update((value) => !value);
    document.documentElement.dataset['theme'] = this.dark() ? 'dark' : 'light';
    try {
      localStorage.setItem('ppi-theme', this.dark() ? 'dark' : 'light');
    } catch {
      /* Theme remains available without persistence. */
    }
  }
}
