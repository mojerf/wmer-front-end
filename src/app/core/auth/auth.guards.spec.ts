import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { guestOnly } from './auth.guards';
import { AuthService } from './auth.service';

const run = async (user: unknown) => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { restore: () => of(user) } }],
  });
  const result = TestBed.runInInjectionContext(() =>
    guestOnly({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
  return isObservable(result) ? firstValueFrom(result) : result;
};

describe('guestOnly', () => {
  it('lets guests see the login pages', async () => {
    expect(await run(null)).toBe(true);
  });

  it('sends signed-in users to the home page', async () => {
    const result = await run({ email: 'ali@example.test' });
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/');
  });
});
