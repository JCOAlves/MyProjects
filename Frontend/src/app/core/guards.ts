import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { WorkspaceService } from './workspace.service';

export const sessionGuard: CanActivateFn = (_route, state) => {
  const workspace = inject(WorkspaceService);
  return workspace.user() && workspace.demoMode
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
export interface UnsavedPage {
  canDeactivate(): boolean | Promise<boolean>;
}
export const unsavedGuard: CanDeactivateFn<UnsavedPage> = (component) => component.canDeactivate();
