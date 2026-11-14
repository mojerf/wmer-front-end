import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';
import { ApiError } from '../http/api.interceptors';

/**
 * A resolver whose API call answers 404 (e.g. an unknown post slug) shows the 404 page without
 * changing the address bar. 403 (someone else's order) looks the same, so existence is not revealed.
 * Every other error is rethrown unchanged.
 */
export function apiNotFoundHandler(error: NavigationError): RedirectCommand {
  if (error.error instanceof ApiError && (error.error.status === 404 || error.error.status === 403)) {
    return new RedirectCommand(inject(Router).parseUrl('/404'), { skipLocationChange: true });
  }
  throw error.error;
}
