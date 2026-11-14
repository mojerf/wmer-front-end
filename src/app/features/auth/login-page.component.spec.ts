import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/http/api.interceptors';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  const login = vi.fn();

  const create = async (redirect?: string) => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        ...provideTestConfig(),
        { provide: AuthService, useValue: { login } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginPageComponent);
    if (redirect) {
      fixture.componentRef.setInput('redirect', redirect);
    }
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const type = (selector: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };

    return { el, type, submit };
  };

  beforeEach(() => login.mockReset());

  it('validates before calling the API', async () => {
    const { el, submit } = await create();

    await submit();

    expect(login).not.toHaveBeenCalled();
    expect(el.textContent).toContain('ایمیل را وارد کنید.');
    expect(el.textContent).toContain('رمز عبور را وارد کنید.');
  });

  it('signs in and goes to the (safe) redirect target', async () => {
    login.mockReturnValue(of({}));
    const { type, submit } = await create('/blog/my-post');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    type('input[type=email]', 'ali@example.test');
    type('input[type=password]', 'secret');
    await submit();

    expect(login).toHaveBeenCalledWith('ali@example.test', 'secret');
    expect(navigate).toHaveBeenCalledWith('/blog/my-post');
  });

  it('never redirects to another site', async () => {
    login.mockReturnValue(of({}));
    const { type, submit } = await create('https://evil.test/phish');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    type('input[type=email]', 'ali@example.test');
    type('input[type=password]', 'secret');
    await submit();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('shows the API validation message next to the field', async () => {
    login.mockReturnValue(throwError(() => new ApiError(422, 'x', { email: ['اطلاعات وارد شده اشتباه است!'] })));
    const { el, type, submit } = await create();

    type('input[type=email]', 'ali@example.test');
    type('input[type=password]', 'wrong');
    await submit();

    expect(el.querySelector('[role=alert]')?.textContent).toContain('اطلاعات وارد شده اشتباه است!');
    expect(el.querySelector('input[type=email]')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows a rate-limit message in the banner', async () => {
    login.mockReturnValue(throwError(() => new ApiError(429, 'Too Many Attempts.')));
    const { el, type, submit } = await create();

    type('input[type=email]', 'ali@example.test');
    type('input[type=password]', 'wrong');
    await submit();

    expect(el.textContent).toContain('تعداد درخواست‌ها زیاد است');
  });
});
