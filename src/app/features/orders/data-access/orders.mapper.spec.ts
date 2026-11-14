import { describe, expect, it } from 'vitest';
import { OrderDto } from './orders.dto';
import { toOrder } from './orders.mapper';

const dto = (links: (string | null)[]): OrderDto => ({
  id: 5,
  status: 'completed',
  total_price: 300,
  created_at: '2026-01-01T00:00:00+00:00',
  products: links.map((link, i) => ({
    id: i + 1,
    title: `P${i}`,
    slug: `p${i}`,
    image: null,
    price: 100,
    download_link: link,
  })),
});

describe('toOrder', () => {
  it('maps an order and its lines', () => {
    const order = toOrder(dto(['https://files.example.test/a.zip']));

    expect(order).toMatchObject({ id: 5, status: 'completed', total: 300 });
    expect(order.lines[0]).toMatchObject({ title: 'P0', price: 100, downloadLink: 'https://files.example.test/a.zip' });
  });

  it('reads whether the order can be paid', () => {
    expect(toOrder({ ...dto([]), can_pay: true }).canPay).toBe(true);
    expect(toOrder(dto([])).canPay).toBe(false);
  });

  it('only keeps https download links', () => {
    const order = toOrder(
      dto(['javascript:alert(1)', 'http://insecure.test/a.zip', 'data:text/html,x', null, 'HTTPS://ok.test/a.zip']),
    );

    expect(order.lines.map((l) => l.downloadLink)).toEqual([null, null, null, null, 'HTTPS://ok.test/a.zip']);
  });
});
