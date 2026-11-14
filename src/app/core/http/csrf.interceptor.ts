import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const COOKIE = 'XSRF-TOKEN';

function readCookie(doc: Document, name: string): string | null {
  const match = doc.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/**
 * Sanctum's SPA protection: state-changing API calls must send the XSRF-TOKEN cookie back as the
 * X-XSRF-TOKEN header. Angular's built-in XSRF support skips cross-origin URLs (the API lives on
 * another origin), so it is done here. The cookie is requested first when it is missing, and once
 * more when the API answers 419 (token expired).
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl, csrfUrl } = inject(APP_CONFIG);
  const doc = inject(DOCUMENT);

  const needsToken =
    isPlatformBrowser(inject(PLATFORM_ID)) &&
    !SAFE_METHODS.has(req.method) &&
    req.url.startsWith(apiUrl);

  if (!needsToken) {
    return next(req);
  }

  const http = inject(HttpClient);
  const fetchCookie = () => http.get(csrfUrl, { withCredentials: true });
  const send = (request: HttpRequest<unknown>) =>
    next(request.clone({ setHeaders: { 'X-XSRF-TOKEN': readCookie(doc, COOKIE) ?? '' } }));

  const first = readCookie(doc, COOKIE) ? send(req) : fetchCookie().pipe(switchMap(() => send(req)));

  return first.pipe(
    catchError((error: unknown) => {
      if ((error as { status?: number })?.status === 419) {
        return fetchCookie().pipe(switchMap(() => send(req)));
      }
      return throwError(() => error);
    }),
  );
};
