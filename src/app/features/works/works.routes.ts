import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { HttpWorksApi, MockWorksApi, WorksApi } from './data-access/works.api';
import { workResolver, worksListResolver } from './data-access/works.resolvers';

export const WORKS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      HttpWorksApi,
      MockWorksApi,
      {
        provide: WorksApi,
        useFactory: () => (inject(APP_CONFIG).useMockApi ? inject(MockWorksApi) : inject(HttpWorksApi)),
      },
    ],
    children: [
      {
        path: '',
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { data: worksListResolver },
        loadComponent: () => import('./works-list-page.component').then((m) => m.WorksListPageComponent),
      },
      {
        path: ':slug',
        resolve: { work: workResolver },
        loadComponent: () => import('./work-page.component').then((m) => m.WorkPageComponent),
      },
    ],
  },
];
