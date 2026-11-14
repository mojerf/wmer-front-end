import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart/cart.service';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProductDetail } from './data-access/shop.models';

const excerpt = (text: string, max = 160): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
};

@Component({
  selector: 'app-product-page',
  imports: [RouterLink, FaNumberPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();

    <article class="wrap max-w-[56rem] pt-[3rem] pb-10">
      <nav aria-label="مسیر صفحه" class="mb-5 flex gap-2 text-[0.8125rem] text-mut">
        <a routerLink="/" class="hover:text-fg">خانه</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/shop" class="hover:text-fg">فروشگاه</a>
      </nav>

      <div class="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div
          class="grid aspect-[16/10] place-items-center overflow-hidden rounded-[1.5rem] text-[3.5rem]"
          [class]="p.imageUrl ? 'bg-bg-2' : fallbackGradient"
        >
          @if (p.imageUrl) {
            <img [src]="p.imageUrl" [alt]="p.title" fetchpriority="high" class="size-full object-cover" />
          } @else {
            <span aria-hidden="true">▤</span>
          }
        </div>

        <div>
          <h1 class="text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.5] font-black tracking-[-0.02em]">{{ p.title }}</h1>
          <p class="mt-2 text-mut">{{ p.expert }}</p>

          <p class="mt-5">
            <b class="text-[1.75rem]">{{ p.price | faNumber }}</b>
            <span class="ms-1 text-[0.8125rem] text-mut">تومان</span>
            @if (p.oldPrice) {
              <s class="ms-2 text-[0.9375rem] text-mut">{{ p.oldPrice | faNumber }}</s>
              <span class="ms-2 rounded-full bg-rose/15 px-2 py-0.5 text-[0.75rem] text-rose">تخفیف</span>
            }
          </p>

          <div class="mt-5 flex flex-wrap gap-3">
            @if (cart.has(p.id)) {
              <a routerLink="/cart" class="btn btn-main"><app-icon name="check" /> در سبد خرید است · مشاهده سبد</a>
            } @else {
              <button type="button" class="btn btn-main cursor-pointer" (click)="add()"><app-icon name="cart-plus" /> افزودن به سبد خرید</button>
            }
          </div>
          <p class="mt-3 text-[0.8125rem] text-mut">پس از تکمیل سفارش، لینک دانلود در صفحه‌ی «سفارش‌های من» فعال می‌شود.</p>
        </div>
      </div>

      <div class="mt-10 text-[1.0625rem] leading-[2.1] whitespace-pre-line">{{ p.description }}</div>
    </article>
  `,
})
export class ProductPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly product = input.required<ProductDetail>();

  protected readonly cart = inject(CartService);
  protected readonly fallbackGradient = 'bg-[linear-gradient(135deg,#0e7490,#22d3ee_60%,#34d399)]';

  constructor() {
    const seo = inject(SeoService);

    effect(() => {
      const p = this.product();
      const url = `${seo.siteUrl}/shop/${p.slug}`;
      const description = excerpt(p.expert || p.description);

      seo.set({
        title: `${p.title} | ${SITE.name}`,
        description,
        path: `/shop/${p.slug}`,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: p.title,
            description,
            url,
            ...(p.imageUrl ? { image: p.imageUrl } : {}),
            offers: {
              '@type': 'Offer',
              url,
              // schema.org wants ISO 4217 codes; prices here are in tomans (1 toman = 10 rials).
              priceCurrency: 'IRR',
              price: p.price * 10,
              availability: 'https://schema.org/InStock',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: `${seo.siteUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'فروشگاه', item: `${seo.siteUrl}/shop` },
              { '@type': 'ListItem', position: 3, name: p.title, item: url },
            ],
          },
        ],
      });
    });
  }

  protected add(): void {
    const p = this.product();
    this.cart.add({ id: p.id, slug: p.slug, title: p.title, price: p.price, imageUrl: p.imageUrl });
  }
}
