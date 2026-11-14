import { Routes } from '@angular/router';
import { requireAdmin } from '../../core/auth/auth.guards';
import { AdminApi } from './data-access/admin.api';

/** The administrator's area. Rendered in the browser only (see app.routes.server.ts) and never indexed. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [requireAdmin],
    providers: [AdminApi],
    loadComponent: () => import('./admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin-dashboard-page.component').then((m) => m.AdminDashboardPageComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin-orders-page.component').then((m) => m.AdminOrdersPageComponent),
      },
      {
        path: 'contacts',
        loadComponent: () => import('./admin-contacts-page.component').then((m) => m.AdminContactsPageComponent),
      },
      {
        path: 'content/:type',
        loadComponent: () =>
          import('./admin-content-list-page.component').then((m) => m.AdminContentListPageComponent),
      },
      {
        path: 'content/:type/new',
        loadComponent: () =>
          import('./admin-content-form-page.component').then((m) => m.AdminContentFormPageComponent),
      },
      {
        path: 'content/:type/:id',
        loadComponent: () =>
          import('./admin-content-form-page.component').then((m) => m.AdminContentFormPageComponent),
      },
    ],
  },
];
