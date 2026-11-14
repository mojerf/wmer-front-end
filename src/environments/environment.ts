import type { AppConfig } from '../app/core/config/app-config';

/** Development defaults. Production builds swap this file for environment.production.ts. */
export const environment: AppConfig = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  siteUrl: 'http://localhost:4000',
  useMockApi: true,
};
