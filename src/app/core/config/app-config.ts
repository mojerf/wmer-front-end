import { InjectionToken } from '@angular/core';

/** Runtime configuration, provided once in app.config.ts from the build-time environment file. */
export interface AppConfig {
  production: boolean;
  /** Absolute URL of the Laravel API (must be absolute so server-side rendering can reach it). */
  apiUrl: string;
  /** Sanctum's CSRF cookie endpoint (not under /api/v1); called before the first state-changing request. */
  csrfUrl: string;
  /** Public origin of this site, used for canonical links, Open Graph and JSON-LD. */
  siteUrl: string;
  /** Serve placeholder content instead of calling the API (until the back end is connected). */
  useMockApi: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
