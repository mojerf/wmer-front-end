import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { ExternalNavigation } from '../../core/browser/external-navigation';
import { ApiError } from '../../core/http/api.interceptors';
import { isTrustedGatewayUrl } from './data-access/gateway-url';
import { OrdersApi } from './data-access/orders.api';
import { Order } from './data-access/orders.models';
import { OrderPageComponent } from './order-page.component';

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 7,
  status: 'pending',
  total: 328_000,
  createdAt: '2026-01-01T00:00:00+00:00',
  canPay: true,
  lines: [
    { id: 1, title: 'محصول الف', slug: 'a', imageUrl: null, price: 328_000, downloadLink: null },
  ],
  ...overrides,
});

describe('isTrustedGatewayUrl', () => {
  const api = 'http://localhost:8000/api/v1';

  it.each([
    ['https://sandbox.zarinpal.com/pg/StartPay/A1', true],
    ['http://localhost:8000/api/v1/payments/callback?Authority=X', true],
    ['http://evil.test/pay', false],
    ['javascript:alert(1)', false],
    ['data:text/html,x', false],
    ['not a url', false],
  ])('%s -> %s', (url, expected) => {
    expect(isTrustedGatewayUrl(url, api)).toBe(expected);
  });
});

describe('OrderPageComponent', () => {
  const pay = vi.fn();
  const assign = vi.fn();

  const create = async (o: Order, inputs: Record<string, string> = {}) => {
    await TestBed.configureTestingModule({
      imports: [OrderPageComponent],
      providers: [
        provideRouter([]),
        ...provideTestConfig(),
        { provide: OrdersApi, useValue: { pay } },
        { provide: ExternalNavigation, useValue: { go: assign } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderPageComponent);
    fixture.componentRef.setInput('order', o);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  const payButton = (el: HTMLElement) =>
    [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('پرداخت'));

  beforeEach(() => {
    pay.mockReset();
    assign.mockReset();
  });

  it('offers payment only for payable orders', async () => {
    expect(payButton((await create(order())).el)).toBeTruthy();
    TestBed.resetTestingModule();
    expect(payButton((await create(order({ canPay: false, status: 'completed' }))).el)).toBeUndefined();
  });

  it('sends the customer to a trusted gateway URL', async () => {
    pay.mockReturnValue(of({ url: 'https://sandbox.zarinpal.com/pg/StartPay/A1', order: order() }));
    const { fixture, el } = await create(order());

    payButton(el)!.click();
    await fixture.whenStable();

    expect(pay).toHaveBeenCalledWith(7);
    expect(assign).toHaveBeenCalledWith('https://sandbox.zarinpal.com/pg/StartPay/A1');
  });

  it('refuses to leave the site for an untrusted URL', async () => {
    pay.mockReturnValue(of({ url: 'http://evil.test/pay', order: order() }));
    const { fixture, el } = await create(order());

    payButton(el)!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(assign).not.toHaveBeenCalled();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('معتبر نیست');
  });

  it('reloads the order as paid when there was nothing to pay', async () => {
    pay.mockReturnValue(of({ url: null, order: order({ status: 'completed', canPay: false }) }));
    const { fixture, el } = await create(order());
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    payButton(el)!.click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/orders', 7], { queryParams: { payment: 'success' } });
    expect(assign).not.toHaveBeenCalled();
  });

  it('shows API errors and lets the customer retry', async () => {
    pay.mockReturnValue(throwError(() => new ApiError(502, 'x')));
    const { fixture, el } = await create(order());

    payButton(el)!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('[role=alert]')?.textContent).toContain('مشکلی در سرور');
    expect(payButton(el)?.hasAttribute('disabled')).toBe(false);
  });

  it('explains the result when the customer returns from the gateway', async () => {
    const ok = await create(order({ status: 'completed', canPay: false }), { payment: 'success' });
    expect(ok.el.querySelector('[role=status]')?.textContent).toContain('پرداخت با موفقیت');
    TestBed.resetTestingModule();

    const failed = await create(order(), { payment: 'failed' });
    expect(failed.el.querySelector('[role=alert]')?.textContent).toContain('پرداخت انجام نشد');
  });
});
