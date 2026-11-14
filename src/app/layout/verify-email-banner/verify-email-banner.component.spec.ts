import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService, User } from '../../core/auth/auth.service';
import { VerifyEmailBannerComponent } from './verify-email-banner.component';

const user = (emailVerified: boolean): User => ({
  firstName: null,
  lastName: null,
  email: 'a@example.test',
  emailVerified,
  phoneNumber: null,
  role: 'user',
});

const create = (current: User | null) => {
  const resendVerification = vi.fn().mockReturnValue(of('لینک ارسال شد.'));
  TestBed.configureTestingModule({
    imports: [VerifyEmailBannerComponent],
    providers: [{ provide: AuthService, useValue: { user: signal(current), resendVerification } }],
  });
  const fixture = TestBed.createComponent(VerifyEmailBannerComponent);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, resendVerification };
};

describe('VerifyEmailBannerComponent', () => {
  it('is hidden for guests and verified users', () => {
    expect(create(null).el.querySelector('[role="status"]')).toBeNull();
    TestBed.resetTestingModule();
    expect(create(user(true)).el.querySelector('[role="status"]')).toBeNull();
  });

  it('reminds unverified users and can resend the link', () => {
    const { fixture, el, resendVerification } = create(user(false));
    expect(el.textContent).toContain('a@example.test');

    el.querySelector('button')!.click();
    fixture.detectChanges();

    expect(resendVerification).toHaveBeenCalled();
    expect(el.textContent).toContain('لینک ارسال شد.');
  });
});
