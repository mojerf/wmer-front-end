import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { AuthService } from '../../core/auth/auth.service';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  const register = vi.fn();

  const create = async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([]),
        ...provideTestConfig(),
        { provide: AuthService, useValue: { register } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const type = (name: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(`[formcontrolname=${name}]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    };
    const submit = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };

    return { el, type, submit };
  };

  beforeEach(() => register.mockReset());

  it('rejects mismatching passwords, short passwords and bad phone numbers', async () => {
    const { el, type, submit } = await create();

    type('email', 'new@example.test');
    type('phoneNumber', '12345');
    type('password', 'short');
    type('passwordConfirmation', 'different');
    await submit();

    expect(register).not.toHaveBeenCalled();
    expect(el.textContent).toContain('شماره باید با ۰۹ شروع شود');
    expect(el.textContent).toContain('دست‌کم ۸ نویسه');
    expect(el.textContent).toContain('دو رمز عبور یکسان نیستند');
  });

  it('registers with the entered values and goes home', async () => {
    register.mockReturnValue(of({}));
    const { type, submit } = await create();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    type('firstName', 'علی');
    type('email', 'new@example.test');
    type('phoneNumber', '09121234567');
    type('password', 'a-Long-Passw0rd!');
    type('passwordConfirmation', 'a-Long-Passw0rd!');
    await submit();

    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'علی',
        email: 'new@example.test',
        phoneNumber: '09121234567',
        password: 'a-Long-Passw0rd!',
        passwordConfirmation: 'a-Long-Passw0rd!',
      }),
    );
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
