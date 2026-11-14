import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { HomeApi, HttpHomeApi, MockHomeApi } from './data-access/home.api';
import { homeContentResolver } from './data-access/home.resolver';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    providers: [
      HttpHomeApi,
      MockHomeApi,
      {
        provide: HomeApi,
        useFactory: () =>
          inject(APP_CONFIG).useMockApi ? inject(MockHomeApi) : inject(HttpHomeApi),
      },
    ],
    resolve: { content: homeContentResolver },
    loadComponent: () => import('./home-page.component').then((m) => m.HomePageComponent),
  },
];
