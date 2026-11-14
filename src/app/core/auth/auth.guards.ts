import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/** Login/registration pages are pointless for someone already signed in: send them home. */
export const guestOnly: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService)
    .restore()
    .pipe(map((user) => (user ? router.parseUrl('/') : true)));
};

/** Pages that need an account: visitors are sent to sign in and brought back afterwards. */
export const requireAuth: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthService)
    .restore()
    .pipe(
      map((user) =>
        user ? true : router.createUrlTree(['/login'], { queryParams: { redirect: state.url } }),
      ),
    );
};

/** The admin area: signed-in administrators only (the API enforces it too; this just spares everyone else a dead page). */
export const requireAdmin: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthService)
    .restore()
    .pipe(
      map((user) => {
        if (!user) {
          return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
        }
        return user.role === 'admin' ? true : router.parseUrl('/');
      }),
    );
};
