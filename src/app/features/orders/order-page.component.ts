import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, Order } from './data-access/orders.models';

@Component({
  selector: 'app-order-page',
  imports: [RouterLink, FaNumberPipe, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let o = order();

    <section class="wrap max-w-[48rem] pt-[3.5rem] pb-10">
      <nav aria-label="مسیر صفحه" class="mb-5 flex gap-2 text-[0.8125rem] text-mut">
        <a routerLink="/orders" class="hover:text-fg">سفارش‌های من</a>
        <span aria-hidden="true">›</span>
        <span>سفارش {{ o.id | faNumber }}</span>
      </nav>

      @if (placed()) {
        <p role="status" class="mb-5 rounded-[1.25rem] bg-emerald-500/10 p-4 text-[0.9375rem] leading-[1.9] text-emerald-700 dark:text-emerald-300">
          سفارش شما ثبت شد. پس از بررسی و تکمیل، لینک دانلود در همین صفحه فعال می‌شود.
        </p>
      }

      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-[clamp(1.5rem,3.5vw,2.25rem)] font-black tracking-[-0.02em]">سفارش {{ o.id | faNumber }}</h1>
        <span class="rounded-full px-3 py-1 text-[0.8125rem]" [class]="statusClass()">{{ statusLabel() }}</span>
      </div>
      <p class="mt-1 text-[0.875rem] text-mut">
        ثبت‌شده <time [attr.datetime]="o.createdAt">{{ o.createdAt | relativeTime }}</time>
      </p>

      <ul class="mt-6 grid gap-3">
        @for (line of o.lines; track line.id) {
          <li class="flex flex-wrap items-center gap-4 rounded-[1.25rem] border border-line bg-card p-4">
            <div class="size-14 shrink-0 overflow-hidden rounded-[0.875rem] bg-[linear-gradient(135deg,#0e7490,#22d3ee_60%,#34d399)]">
              @if (line.imageUrl) {
                <img [src]="line.imageUrl" [alt]="line.title" loading="lazy" class="size-full object-cover" />
              }
            </div>
            <div class="min-w-0 flex-1">
              <a [routerLink]="['/shop', line.slug]" class="font-bold hover:text-aqua">{{ line.title }}</a>
              <p class="mt-0.5 text-[0.875rem] text-mut">{{ line.price | faNumber }} تومان</p>
            </div>
            @if (line.downloadLink) {
              <a class="btn btn-main min-h-9 px-4 text-[0.8125rem]" [href]="line.downloadLink" target="_blank" rel="noopener noreferrer">دانلود</a>
            } @else if (o.status !== 'cancelled') {
              <span class="text-[0.8125rem] text-mut">لینک پس از تکمیل سفارش فعال می‌شود</span>
            }
          </li>
        }
      </ul>

      <p class="mt-6 flex items-center justify-between rounded-[1.25rem] border border-line bg-card p-4 text-[1.125rem]">
        <span>جمع کل</span>
        <b>{{ o.total | faNumber }} <small class="text-[0.75rem] font-normal text-mut">تومان</small></b>
      </p>
    </section>
  `,
})
export class OrderPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly order = input.required<Order>();
  /** `?placed=1` right after checkout. */
  readonly placed = input<string | undefined>(undefined);

  protected readonly statusLabel = () => ORDER_STATUS_LABELS[this.order().status];
  protected readonly statusClass = () => ORDER_STATUS_CLASSES[this.order().status];

  constructor() {
    inject(SeoService).set({
      title: `سفارش | ${SITE.name}`,
      description: 'جزئیات سفارش',
      noindex: true,
    });
  }
}
