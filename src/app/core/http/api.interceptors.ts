import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

/** Normalized error every API call fails with, so features never deal with raw HttpErrorResponse. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Laravel validation errors keyed by field name (HTTP 422). */
    readonly fieldErrors: Readonly<Record<string, readonly string[]>> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const isApiRequest = (req: HttpRequest<unknown>, apiUrl: string): boolean =>
  req.url.startsWith(apiUrl);

/** Marks API calls as JSON and sends cookies (needed later for Sanctum's SPA authentication). */
export const apiRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl } = inject(APP_CONFIG);
  if (!isApiRequest(req, apiUrl)) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Accept: 'application/json' },
      withCredentials: true,
    }),
  );
};

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl } = inject(APP_CONFIG);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || !isApiRequest(req, apiUrl)) {
        return throwError(() => error);
      }
      const body = error.error as { message?: unknown; errors?: unknown } | null;
      const message = typeof body?.message === 'string' ? body.message : 'خطا در ارتباط با سرور';
      const fieldErrors =
        body?.errors && typeof body.errors === 'object'
          ? (body.errors as Record<string, readonly string[]>)
          : {};
      return throwError(() => new ApiError(error.status, message, fieldErrors));
    }),
  );
};
