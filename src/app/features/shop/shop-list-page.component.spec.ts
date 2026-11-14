import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { ShopListData } from './data-access/shop.resolvers';
import { ShopListPageComponent } from './shop-list-page.component';

const product = (id: number) => ({
  id,
  title: `محصول ${id}`,
  slug: `p-${id}`,
  imageUrl: null,
  price: 100_000 * id,
  oldPrice: id === 1 ? 300_000 : null,
  publishedAt: '2026-01-01T00:00:00+00:00',
});

const create = async (data: ShopListData) => {
  await TestBed.configureTestingModule({
    imports: [ShopListPageComponent],
    providers: [provideRouter([]), ...provideTestConfig()],
  }).compileComponents();
  const fixture = TestBed.createComponent(ShopListPageComponent);
  fixture.componentRef.setInput('data', data);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
};

const robots = () =>
  TestBed.inject(DOCUMENT).querySelector('meta[name="robots"]')?.getAttribute('content');

describe('ShopListPageComponent', () => {
  it('lists products as links, shows discounts and paginates with clean URLs', async () => {
    const el = await create({
      search: '',
      sort: 'latest',
      products: { items: [product(1), product(2)], page: 2, lastPage: 3, total: 30 },
    });

    expect([...el.querySelectorAll('article a')].map((a) => a.getAttribute('href'))).toEqual([
      '/shop/p-1',
      '/shop/p-2',
    ]);
    expect(el.querySelector('article s')?.textContent).toContain('۳۰۰٬۰۰۰');
    expect(el.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/shop');
    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/shop?page=3');
    expect(robots()).toContain('index');
  });

  it('keeps pagination links on the chosen sort and keeps sorted views out of the index', async () => {
    const el = await create({
      search: '',
      sort: 'price_asc',
      products: { items: [product(1)], page: 1, lastPage: 2, total: 13 },
    });

    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/shop?sort=price_asc&page=2');
    expect(robots()).toBe('noindex, nofollow');
  });

  it('shows an empty state for searches without results', async () => {
    const el = await create({
      search: 'nothing',
      sort: 'latest',
      products: { items: [], page: 1, lastPage: 1, total: 0 },
    });

    expect(el.textContent).toContain('محصولی پیدا نشد');
  });
});
