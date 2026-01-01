import {Routes} from '@angular/router';
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
    path: 'sass/enterprise-detail',
    title: 'Enterprise Detail',
    loadComponent: () =>
      import('./pages/sass/components/enterprise-detail/enterprise-detail.component').then(
        c => c.EnterpriseDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'type-wise-permission',
    title: 'Type Wise Permission',
    loadComponent: () => import('./pages/sass/components/type-wise-permission/type-wise-permission.component').then(c => c.TypeWisePermissionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'feature-module',
    title: 'Feature & Module',
    loadComponent: () => import('./pages/sass/components/feature-module/feature-module.component').then(c => c.FeatureModuleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'type-wise-permission/features/:moduleId/:enterpriseType',
    title: 'Features',
    loadComponent: () => import('./pages/sass/components/features/type-features-page.component').then(c => c.TypeFeaturesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enterprise-detail/features/:moduleId/:enterpriseType',
    title: 'Features',
    loadComponent: () => import('./pages/sass/components/features/enterprise-features-page.component').then(c => c.EnterpriseFeaturesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'role-wise-permission/features/:moduleId/:enterpriseType',
    title: 'Features',
    loadComponent: () => import('./pages/sass/components/features/role-features-page.component').then(c => c.RoleFeaturesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-wise-permission/features/:moduleId/:enterpriseType',
    title: 'Features',
    loadComponent: () => import('./pages/sass/components/features/user-features-page.component').then(c => c.UserFeaturesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'role-wise-permission',
    title: 'Role Wise Permission',
    loadComponent: () => import('./pages/sass/components/role-wise-permission/role-wise-permission.component').then(c => c.RoleWisePermissionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-wise-permission',
    title: 'User Wise Permission',
    loadComponent: () => import('./pages/sass/components/user-wise-permission/user-wise-permission.component').then(c => c.UserWisePermissionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-wise-permission/user/:userId',
    title: 'User Summary',
    loadComponent: () => import('./pages/sass/components/user-summary').then(c => c.UserSummaryComponent),
    canActivate: [authGuard]
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
  }
];
