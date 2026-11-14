import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { Page } from '../../shared/models/page';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, Order } from './data-access/orders.models';

@Component({
  selector: 'app-orders-list-page',
  imports: [RouterLink, FaNumberPipe, RelativeTimePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap max-w-[48rem] pt-[3.5rem] pb-10">
      <h1 class="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.02em]">سفارش‌های من</h1>

      @if (orders().items.length) {
        <ul class="mt-6 grid gap-3">
          @for (order of orders().items; track order.id) {
            <li>
              <a
                [routerLink]="['/orders', order.id]"
                class="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-line bg-card p-4 transition-colors hover:border-iris"
              >
                <span>
                  <b>سفارش {{ order.id | faNumber }}</b>
                  <span class="ms-3 text-[0.8125rem] text-mut">
                    {{ order.lines.length | faNumber }} محصول ·
                    <time [attr.datetime]="order.createdAt">{{ order.createdAt | relativeTime }}</time>
                  </span>
                </span>
                <span class="flex items-center gap-3">
                  <span class="rounded-full px-2.5 py-0.5 text-[0.75rem]" [class]="statusClass(order)">{{ statusLabel(order) }}</span>
                  <b>{{ order.total | faNumber }} <small class="text-[0.75rem] font-normal text-mut">تومان</small></b>
                </span>
              </a>
            </li>
          }
        </ul>

        @if (orders().lastPage > 1) {
          <nav class="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
            @if (orders().page > 1) {
              <a class="btn" routerLink="/orders" [queryParams]="{ page: orders().page > 2 ? orders().page - 1 : null }" rel="prev"><app-icon name="arrow-back" /> قبلی</a>
            }
            <span class="text-[0.875rem] text-mut">صفحه‌ی {{ orders().page | faNumber }} از {{ orders().lastPage | faNumber }}</span>
            @if (orders().page < orders().lastPage) {
              <a class="btn" routerLink="/orders" [queryParams]="{ page: orders().page + 1 }" rel="next">بعدی <app-icon name="arrow" /></a>
            }
          </nav>
        }
      } @else {
        <div class="mt-6 rounded-[1.5rem] border border-line bg-card p-8 text-center">
          <p class="text-mut">هنوز سفارشی ثبت نکرده‌اید.</p>
          <a routerLink="/shop" class="btn btn-main mt-4">دیدن محصولات <app-icon name="arrow" /></a>
        </div>
      }
    </section>
  `,
})
export class OrdersListPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly orders = input.required<Page<Order>>();

  protected readonly statusLabel = (order: Order): string => ORDER_STATUS_LABELS[order.status];
  protected readonly statusClass = (order: Order): string => ORDER_STATUS_CLASSES[order.status];

  constructor() {
    inject(SeoService).set({
      title: `سفارش‌های من | ${SITE.name}`,
      description: 'سفارش‌های من',
      noindex: true,
    });
  }
}
