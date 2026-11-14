import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { CartService } from '../../core/cart/cart.service';
import { ProductDetail } from './data-access/shop.models';
import { ProductPageComponent } from './product-page.component';

const product: ProductDetail = {
  id: 9,
  title: 'قالب نمونه',
  slug: 'sample-template',
  imageUrl: null,
  price: 490_000,
  oldPrice: 650_000,
  publishedAt: '2026-01-01T00:00:00+00:00',
  updatedAt: '2026-01-02T00:00:00+00:00',
  author: 'مجتبی',
  expert: 'خلاصه',
  description: 'توضیح\n\n<script>alert(1)</script>',
};

describe('ProductPageComponent', () => {
  beforeEach(() => localStorage.clear());

  const create = async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPageComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductPageComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return fixture;
  };

  it('shows prices, adds to the cart and then links to it', async () => {
    const fixture = await create();
    const el = fixture.nativeElement as HTMLElement;
    const cart = TestBed.inject(CartService);

    expect(el.textContent).toContain('۴۹۰٬۰۰۰');
    expect(el.querySelector('s')?.textContent).toContain('۶۵۰٬۰۰۰');

    [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('افزودن'))!.click();
    fixture.detectChanges();

    expect(cart.has(9)).toBe(true);
    expect(el.querySelector('a[href="/cart"]')).toBeTruthy();
  });

  it('renders the description as text and sets Product structured data in rials', async () => {
    const el = (await create()).nativeElement as HTMLElement;
    const doc = TestBed.inject(DOCUMENT);

    expect(el.querySelector('script')).toBeNull();
    expect(el.textContent).toContain('<script>alert(1)</script>');

    const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>,
    );
    expect(ld.map((x) => x['@type'])).toEqual(['Product', 'BreadcrumbList']);
    expect(ld[0]?.['offers']).toMatchObject({ priceCurrency: 'IRR', price: 4_900_000 });
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://site.test/shop/sample-template',
    );
  });
});
