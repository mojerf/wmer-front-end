import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/http/api.interceptors';
import { VerifyEmailPageComponent } from './verify-email-page.component';

describe('VerifyEmailPageComponent', () => {
  const verifyEmail = vi.fn();
  const refresh = vi.fn();

  const create = async (params: Record<string, string>) => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailPageComponent],
      providers: [provideRouter([]), ...provideTestConfig(), { provide: AuthService, useValue: { verifyEmail, refresh } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(VerifyEmailPageComponent);
    for (const [name, value] of Object.entries(params)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const link = { id: '3', hash: 'h', expires: '1', signature: 's' };

  beforeEach(() => {
    verifyEmail.mockReset();
    refresh.mockReset().mockReturnValue(of(null));
  });

  it('confirms the address from the link and refreshes the session', async () => {
    verifyEmail.mockReturnValue(of('ایمیل تأیید شد.'));
    const el = await create(link);

    expect(verifyEmail).toHaveBeenCalledWith(link);
    expect(refresh).toHaveBeenCalled();
    expect(el.textContent).toContain('ایمیل تأیید شد.');
  });

  it('shows the server error for an invalid or expired link', async () => {
    verifyEmail.mockReturnValue(throwError(() => new ApiError(403, 'لینک نامعتبر است.', {})));
    const el = await create(link);

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('لینک نامعتبر است.');
    expect(refresh).not.toHaveBeenCalled();
  });
});
