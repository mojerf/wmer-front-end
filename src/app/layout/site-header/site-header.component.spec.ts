import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { AuthService, User } from '../../core/auth/auth.service';
import { SiteHeaderComponent } from './site-header.component';

const user = (role: 'admin' | 'user'): User => ({
  firstName: 'علی',
  lastName: 'رضایی',
  email: 'ali@example.test',
  emailVerified: true,
  phoneNumber: null,
  role,
});

describe('SiteHeaderComponent', () => {
  const current = signal<User | null>(null);
  const logout = vi.fn();

  const create = () => {
    TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [
        provideRouter([]),
        ...provideTestConfig(),
        {
          provide: AuthService,
          useValue: { user: current, isLoggedIn: () => current() !== null, displayName: () => 'علی رضایی', logout },
        },
      ],
    });
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => current.set(null));

  it('offers both signing in and signing up to guests', () => {
    const { el } = create();
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));

    expect(hrefs).toContain('/login');
    expect(hrefs).toContain('/register');
  });

  it('shows a user menu with orders and sign-out, and admin only for administrators', () => {
    current.set(user('user'));
    const { fixture, el } = create();
    expect(el.querySelector('[role="menu"]')).toBeNull();

    el.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"][aria-label^="حساب"]')!.click();
    fixture.detectChanges();

    const menu = el.querySelector('[role="menu"]')!;
    expect(menu.textContent).toContain('سفارش‌های من');
    expect(menu.textContent).toContain('خروج');
    expect(menu.querySelector('a[href="/admin"]')).toBeNull();
  });

  it('links administrators to the admin panel', () => {
    current.set(user('admin'));
    const { fixture, el } = create();

    el.querySelector<HTMLButtonElement>('button[aria-label^="حساب"]')!.click();
    fixture.detectChanges();

    expect(el.querySelector('[role="menu"] a[href="/admin"]')).not.toBeNull();
  });

  it('closes the menu on Escape and when clicking elsewhere', () => {
    current.set(user('user'));
    const { fixture, el } = create();
    const open = () => {
      el.querySelector<HTMLButtonElement>('button[aria-label^="حساب"]')!.click();
      fixture.detectChanges();
    };

    open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(el.querySelector('[role="menu"]')).toBeNull();

    open();
    document.body.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="menu"]')).toBeNull();
  });

  it('signs out from the menu', () => {
    current.set(user('user'));
    logout.mockReturnValue({ subscribe: vi.fn() });
    const { fixture, el } = create();

    el.querySelector<HTMLButtonElement>('button[aria-label^="حساب"]')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[role="menu"] button[role="menuitem"]')!.click();

    expect(logout).toHaveBeenCalled();
  });
});
