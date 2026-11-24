import { Routes } from '@angular/router';
import { sessionGuard, unsavedGuard } from './core/guards';
import { ShellComponent } from './shared/shell.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'PPI — organize seus projetos',
    loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'cadastro',
    title: 'Criar uma conta — PPI',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'login',
    title: 'Login — PPI',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: ShellComponent,
    canActivateChild: [sessionGuard],
    children: [
      {
        path: 'home',
        title: 'Início — PPI',
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'projetos',
        title: 'Meus projetos — PPI',
        data: { allProjects: true },
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'projeto/:id',
        title: 'Projeto — PPI',
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./pages/project/project.page').then((m) => m.ProjectPage),
      },
      {
        path: 'perfil',
        title: 'Editar perfil — PPI',
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: 'configuracoes', redirectTo: 'perfil', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    title: 'Página não encontrada — PPI',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
