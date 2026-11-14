import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';
import { apiErrorInterceptor, apiRequestInterceptor } from './api.interceptors';
import { csrfInterceptor } from './csrf.interceptor';

/** HttpClient on fetch (works with SSR) plus the shared API interceptors. */
export function provideApi(): EnvironmentProviders {
  return provideHttpClient(withFetch(), withInterceptors([apiRequestInterceptor, csrfInterceptor, apiErrorInterceptor]));
}
