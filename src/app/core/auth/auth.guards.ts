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
