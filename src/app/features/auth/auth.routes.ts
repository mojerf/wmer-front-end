import { Routes } from '@angular/router';
import { guestOnly } from '../../core/auth/auth.guards';

/** Account pages. They are rendered in the browser only (see app.routes.server.ts) and kept out of search results. */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestOnly],
    loadComponent: () => import('./login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestOnly],
    loadComponent: () => import('./register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [guestOnly],
    loadComponent: () =>
      import('./forgot-password-page.component').then((m) => m.ForgotPasswordPageComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./verify-email-page.component').then((m) => m.VerifyEmailPageComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password-page.component').then((m) => m.ResetPasswordPageComponent),
  },
];
