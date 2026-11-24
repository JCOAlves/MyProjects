import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ToastsComponent } from './shared/toasts.component';

@Component({
  imports: [RouterOutlet, ToastsComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router);
  private previousPath = '';
  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split('?')[0];
        if (path === this.previousPath) return;
        this.previousPath = path;
        requestAnimationFrame(() => {
          const main = document.querySelector<HTMLElement>('main');
          main?.setAttribute('tabindex', '-1');
          main?.focus({ preventScroll: true });
        });
      });
  }
}
