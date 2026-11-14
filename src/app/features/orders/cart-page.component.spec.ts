import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { ApiError } from '../../core/http/api.interceptors';
import { CartPageComponent } from './cart-page.component';
import { OrdersApi } from './data-access/orders.api';

describe('CartPageComponent', () => {
  const create = vi.fn();
  const loggedIn = signal(true);

  const setup = async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        provideRouter([]),
        ...provideTestConfig(),
        { provide: OrdersApi, useValue: { create } },
        { provide: AuthService, useValue: { isLoggedIn: loggedIn } },
      ],
    }).compileComponents();

    const cart = TestBed.inject(CartService);
    cart.add({ id: 1, slug: 'a', title: 'محصول الف', price: 1000, imageUrl: null });
    cart.add({ id: 2, slug: 'b', title: 'محصول ب', price: 2500, imageUrl: null });

    const fixture = TestBed.createComponent(CartPageComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, cart };
  };

  beforeEach(() => {
    create.mockReset();
    loggedIn.set(true);
  });

  it('shows the items and the total', async () => {
    const { el } = await setup();

    expect(el.textContent).toContain('محصول الف');
    expect(el.textContent).toContain('۳٬۵۰۰');
  });

  it('places the order with product ids only, clears the cart and opens the order', async () => {
    create.mockReturnValue(of({ id: 42 }));
    const { fixture, el, cart } = await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const button = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('ثبت سفارش'))!;
    button.click();
    await fixture.whenStable();

    expect(create).toHaveBeenCalledWith([1, 2]);
    expect(cart.count()).toBe(0);
    expect(navigate).toHaveBeenCalledWith(['/orders', 42], { queryParams: { placed: 1 } });
  });

  it('keeps the cart and shows the error when the order fails', async () => {
    create.mockReturnValue(throwError(() => new ApiError(422, 'نامعتبر')));
    const { fixture, el, cart } = await setup();

    [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('ثبت سفارش'))!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cart.count()).toBe(2);
    expect(el.querySelector('[role=alert]')?.textContent).toContain('نامعتبر');
  });

  it('asks guests to sign in and comes back to the cart afterwards', async () => {
    loggedIn.set(false);
    const { el } = await setup();

    expect(el.querySelector('a[href="/login?redirect=%2Fcart"]')).toBeTruthy();
    expect([...el.querySelectorAll('button')].some((b) => b.textContent?.includes('ثبت سفارش'))).toBe(false);
  });

  it('removes an item', async () => {
    const { fixture, el, cart } = await setup();

    el.querySelector<HTMLButtonElement>('button[aria-label^="حذف"]')!.click();
    fixture.detectChanges();

    expect(cart.count()).toBe(1);
  });
});
