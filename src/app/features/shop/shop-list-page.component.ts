import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../shared/directives/spotlight.directive';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { SHOP_SORTS } from './data-access/shop.models';
import { ShopListData } from './data-access/shop.resolvers';

@Component({
  selector: 'app-shop-list-page',
  imports: [RouterLink, RevealDirective, SpotlightDirective, FaNumberPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap pt-[3.5rem] pb-8">
      <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-[1.3] font-black tracking-[-0.03em]">
        <span class="text-shimmer">فروشگاه</span>
      </h1>
      <p class="mt-2 max-w-[34rem] text-mut">قالب، دوره و محصولات دیجیتال؛ بعد از تکمیل سفارش، لینک دانلود برایتان فعال می‌شود.</p>

      <form class="mt-6 flex flex-wrap gap-2" role="search" (submit)="apply($event, field.value, sort.value)">
        <input
          #field
          type="search"
          name="q"
          [value]="data().search"
          maxlength="100"
          placeholder="جست‌وجو در محصولات…"
          aria-label="جست‌وجو در محصولات"
          class="input-field min-w-[14rem] flex-1"
        />
        <select
          #sort
          name="sort"
          aria-label="مرتب‌سازی"
          class="input-field w-auto cursor-pointer"
          (change)="apply($event, field.value, sort.value)"
        >
          @for (option of sorts; track option.value) {
            <option [value]="option.value" [selected]="option.value === data().sort">{{ option.label }}</option>
          }
        </select>
        <button type="submit" class="btn btn-main cursor-pointer">جست‌وجو</button>
      </form>

      @if (data().search) {
        <p class="mt-4 text-[0.875rem] text-mut">
          {{ data().products.total | faNumber }} نتیجه برای «{{ data().search }}» ·
          <a routerLink="/shop" class="text-aqua underline-offset-4 hover:underline">پاک کردن جست‌وجو</a>
        </p>
      }
    </section>

    <section class="wrap pb-8" aria-label="فهرست محصولات">
      @if (data().products.items.length) {
        <div class="grid gap-[0.875rem] sm:grid-cols-2 lg:grid-cols-3">
          @for (product of data().products.items; track product.id; let i = $index) {
            <article appSpotlight [appReveal]="(i % 3) * 90" class="card">
              <a [routerLink]="['/shop', product.slug]" class="absolute inset-0 z-10" [attr.aria-label]="product.title"></a>
              <div
                class="-mx-1.5 -mt-1.5 mb-4 grid h-[9rem] place-items-center overflow-hidden rounded-2xl text-[2.5rem]"
                [class]="product.imageUrl ? 'bg-bg-2' : fallbackGradient"
              >
                @if (product.imageUrl) {
                  <img [src]="product.imageUrl" [alt]="product.title" loading="lazy" class="size-full object-cover" />
                } @else {
                  <span aria-hidden="true">▤</span>
                }
              </div>
              <h2 class="text-[1.125rem] leading-[1.7] font-bold">{{ product.title }}</h2>
              <p class="mt-auto pt-3">
                <b class="text-[1.125rem]">{{ product.price | faNumber }}</b>
                <span class="ms-1 text-[0.75rem] text-mut">تومان</span>
                @if (product.oldPrice) {
                  <s class="ms-2 text-[0.8125rem] text-mut">{{ product.oldPrice | faNumber }}</s>
                  <span class="ms-2 rounded-full bg-rose/15 px-2 py-0.5 text-[0.6875rem] text-rose">تخفیف</span>
                }
              </p>
            </article>
          }
        </div>

        @if (data().products.lastPage > 1) {
          <nav class="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
            @if (data().products.page > 1) {
              <a class="btn" routerLink="/shop" [queryParams]="pageParams(data().products.page - 1)" rel="prev">قبلی</a>
            }
            <span class="text-[0.875rem] text-mut">
              صفحه‌ی {{ data().products.page | faNumber }} از {{ data().products.lastPage | faNumber }}
            </span>
            @if (data().products.page < data().products.lastPage) {
              <a class="btn" routerLink="/shop" [queryParams]="pageParams(data().products.page + 1)" rel="next">
                بعدی <app-icon name="arrow" />
              </a>
            }
          </nav>
        }
      } @else {
        <p class="rounded-[1.25rem] border border-line bg-card p-8 text-center text-mut">محصولی پیدا نشد.</p>
      }
    </section>
  `,
})
export class ShopListPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly data = input.required<ShopListData>();

  private readonly router = inject(Router);

  protected readonly sorts = SHOP_SORTS;
  protected readonly fallbackGradient = 'bg-[linear-gradient(135deg,#0e7490,#22d3ee_60%,#34d399)]';

  /** Page 1 and the default sort have no query parameter, so each view has exactly one URL. */
  protected readonly pageParams = (page: number) => ({
    q: this.data().search || null,
    sort: this.data().sort === 'latest' ? null : this.data().sort,
    page: page > 1 ? page : null,
  });

  private readonly canonicalPath = computed(() => {
    const { page } = this.data().products;
    return page > 1 ? `/shop?page=${page}` : '/shop';
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const { search, sort, products } = this.data();
      const suffix = products.page > 1 ? ` — صفحه‌ی ${products.page}` : '';

      seo.set({
        title: `فروشگاه${suffix} | ${SITE.name}`,
        description: 'قالب، دوره و محصولات دیجیتال برای توسعه‌دهندگان Angular و Laravel.',
        path: this.canonicalPath(),
        // Search and sorted views duplicate the main list: keep them out of the index.
        noindex: search !== '' || sort !== 'latest',
      });
    });
  }

  protected apply(event: Event, term: string, sort: string): void {
    event.preventDefault();
    void this.router.navigate(['/shop'], {
      queryParams: { q: term.trim() || null, sort: sort === 'latest' ? null : sort, page: null },
    });
  }
}
