import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestConfig, TEST_CONFIG } from '../../../testing/test-providers';
import { AuthService } from './auth.service';

const userDto = {
  first_name: 'علی',
  last_name: 'رضایی',
  email: 'ali@example.test',
  phone_number: null,
  role: 'user' as const,
};

describe('AuthService', () => {
  let auth: AuthService;
  let controller: HttpTestingController;
  const api = TEST_CONFIG.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideTestConfig(), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
  });

  it('starts signed out', () => {
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.displayName()).toBe('');
  });

  it('restores the session from /me, once', async () => {
    const done = firstValueFrom(auth.restore());
    controller.expectOne(`${api}/me`).flush({ data: userDto });
    await done;

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.displayName()).toBe('علی رضایی');

    await firstValueFrom(auth.restore()); // cached: no second request
    controller.verify();
  });

  it('treats a 401 from /me as "nobody is signed in"', async () => {
    const done = firstValueFrom(auth.restore());
    controller.expectOne(`${api}/me`).flush({ message: 'x' }, { status: 401, statusText: 'Unauthorized' });

    expect(await done).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('logs in and exposes the user and role', async () => {
    const done = firstValueFrom(auth.login('ali@example.test', 'secret'));
    const req = controller.expectOne(`${api}/login`);
    expect(req.request.body).toEqual({ email: 'ali@example.test', password: 'secret' });
    req.flush({ message: 'ok', user: { ...userDto, role: 'admin' } });
    await done;

    expect(auth.user()?.email).toBe('ali@example.test');
    expect(auth.isAdmin()).toBe(true);
  });

  it('sends snake_case fields and null for empty optional fields when registering', async () => {
    const done = firstValueFrom(
      auth.register({
        firstName: '',
        lastName: '',
        email: 'new@example.test',
        phoneNumber: '',
        password: 'a-Long-Passw0rd!',
        passwordConfirmation: 'a-Long-Passw0rd!',
      }),
    );
    const req = controller.expectOne(`${api}/register`);
    expect(req.request.body).toEqual({
      first_name: null,
      last_name: null,
      email: 'new@example.test',
      phone_number: null,
      password: 'a-Long-Passw0rd!',
      password_confirmation: 'a-Long-Passw0rd!',
    });
    req.flush({ message: 'ok', user: { ...userDto, first_name: null, last_name: null } });
    await done;

    // no name: falls back to the e-mail's local part
    expect(auth.displayName()).toBe('ali');
  });

  it('signs out locally even when the server call fails', async () => {
    const login = firstValueFrom(auth.login('ali@example.test', 'secret'));
    controller.expectOne(`${api}/login`).flush({ message: 'ok', user: userDto });
    await login;

    const out = firstValueFrom(auth.logout());
    controller.expectOne(`${api}/logout`).flush({ message: 'x' }, { status: 500, statusText: 'Server Error' });
    await out;

    expect(auth.isLoggedIn()).toBe(false);
  });
});
