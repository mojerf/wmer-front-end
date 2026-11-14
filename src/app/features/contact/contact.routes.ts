import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { ContactApi, HttpContactApi, MockContactApi } from './data-access/contact.api';

export const CONTACT_ROUTES: Routes = [
  {
    path: '',
    providers: [
      HttpContactApi,
      MockContactApi,
      {
        provide: ContactApi,
        useFactory: () => (inject(APP_CONFIG).useMockApi ? inject(MockContactApi) : inject(HttpContactApi)),
      },
    ],
    loadComponent: () => import('./contact-page.component').then((m) => m.ContactPageComponent),
  },
];
