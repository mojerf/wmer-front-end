import { Provider } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../app/core/config/app-config';

export const TEST_CONFIG: AppConfig = {
  production: false,
  apiUrl: 'http://api.test/api',
  siteUrl: 'https://site.test',
  useMockApi: true,
};

/** Providers every component/service test needs. */
export const provideTestConfig = (): Provider[] => [{ provide: APP_CONFIG, useValue: TEST_CONFIG }];
