import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { guestOnly, requireAuth } from './auth.guards';
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

describe('requireAuth', () => {
  const runAuth = async (user: unknown) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { restore: () => of(user) } }],
    });
    const result = TestBed.runInInjectionContext(() =>
      requireAuth({} as ActivatedRouteSnapshot, { url: '/orders?page=2' } as RouterStateSnapshot),
    );
    return isObservable(result) ? firstValueFrom(result) : result;
  };

  it('lets signed-in users through', async () => {
    expect(await runAuth({ email: 'ali@example.test' })).toBe(true);
  });

  it('sends visitors to the login page and remembers where they wanted to go', async () => {
    const result = await runAuth(null);
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/login?redirect=%2Forders%3Fpage%3D2');
  });
});
