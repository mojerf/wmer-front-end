import { Routes } from '@angular/router';

/** Every feature is lazy-loaded; this file only maps URL areas to feature route files. */
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.routes').then((m) => m.BLOG_ROUTES),
  },
  {
    path: 'contact',
    loadChildren: () => import('./features/contact/contact.routes').then((m) => m.CONTACT_ROUTES),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about-page.component').then((m) => m.AboutPageComponent),
  },
  {
    path: 'shop',
    loadChildren: () => import('./features/shop/shop.routes').then((m) => m.SHOP_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES),
  },
  // Explicit target for failed lookups (API 404); also answered with HTTP 404 by the server.
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
