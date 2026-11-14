import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { HttpShopApi, MockShopApi, ShopApi } from './data-access/shop.api';
import { productResolver, shopListResolver } from './data-access/shop.resolvers';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    providers: [
      HttpShopApi,
      MockShopApi,
      {
        provide: ShopApi,
        useFactory: () => (inject(APP_CONFIG).useMockApi ? inject(MockShopApi) : inject(HttpShopApi)),
      },
    ],
    children: [
      {
        path: '',
        // Search, sorting and pagination live in the query string, so reload when it changes.
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { data: shopListResolver },
        loadComponent: () => import('./shop-list-page.component').then((m) => m.ShopListPageComponent),
      },
      {
        path: ':slug',
        resolve: { product: productResolver },
        loadComponent: () => import('./product-page.component').then((m) => m.ProductPageComponent),
      },
    ],
  },
];
