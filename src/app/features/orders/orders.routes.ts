import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { requireAuth } from '../../core/auth/auth.guards';
import { APP_CONFIG } from '../../core/config/app-config';
import { HttpOrdersApi, MockOrdersApi, OrdersApi } from './data-access/orders.api';
import { orderResolver, ordersListResolver } from './data-access/orders.resolvers';

/** Cart, checkout and the signed-in customer's orders. Rendered in the browser only (see app.routes.server.ts). */
export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      HttpOrdersApi,
      MockOrdersApi,
      {
        provide: OrdersApi,
        useFactory: () => (inject(APP_CONFIG).useMockApi ? inject(MockOrdersApi) : inject(HttpOrdersApi)),
      },
    ],
    children: [
      {
        path: 'cart',
        loadComponent: () => import('./cart-page.component').then((m) => m.CartPageComponent),
      },
      {
        path: 'orders',
        canActivate: [requireAuth],
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { orders: ordersListResolver },
        loadComponent: () => import('./orders-list-page.component').then((m) => m.OrdersListPageComponent),
      },
      {
        path: 'orders/:id',
        canActivate: [requireAuth],
        resolve: { order: orderResolver },
        loadComponent: () => import('./order-page.component').then((m) => m.OrderPageComponent),
      },
    ],
  },
];
