import { Routes } from '@angular/router';
import {authGuard} from './core/components/auth/guards/auth.guard';
import {isAlreadyLoggedInGuard} from './core/components/auth/guards/is-already-logged-in.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Login',
    loadComponent: () =>
      import('./core/components/auth/components/sign-in/sign-in.component').then(
        c => c.SignInComponent
      ),
    canActivate: [isAlreadyLoggedInGuard],
  },
  {
    path: 'sass',
    title: 'Sass',
    loadComponent: () =>
      import('./pages/sass/sass.component').then(c => c.SassComponent),
    canActivate: [authGuard],
  },

  {
    path: '',
    redirectTo: 'sass',
    pathMatch: 'full',
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        c => c.NotFoundComponent
      ),
  },
];
