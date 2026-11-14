import type { AppConfig } from '../app/core/config/app-config';

export const environment: AppConfig = {
  production: true,
  // TODO: replace with the real production origins before deploying.
  apiUrl: 'https://api.example.com/api',
  siteUrl: 'https://www.example.com',
  useMockApi: true,
};
