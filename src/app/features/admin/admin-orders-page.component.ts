import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { errorMessage } from '../../core/http/api-errors';
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, OrderStatus } from '../../shared/models/order-status';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { AdminApi } from './data-access/admin.api';
import { AdminOrder } from './data-access/admin.models';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-admin-orders-page',
  imports: [FaNumberPipe, RelativeTimePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-[clamp(1.5rem,3.5vw,2rem)] font-black tracking-[-0.02em]">سفارش‌ها</h1>

    @if (notice()) {
      <p role="status" class="mt-4 rounded-[1rem] bg-card px-4 py-3 text-[0.875rem]">{{ notice() }}</p>
    }

    @if (orders.error()) {
      <p role="alert" class="mt-6 rounded-[1.25rem] bg-rose/10 p-4 text-rose">بارگذاری سفارش‌ها ممکن نشد.</p>
    } @else if (orders.value(); as page) {
      <ul class="mt-4 grid gap-2">
        @for (order of page.items; track order.id) {
          <li class="grid gap-2 rounded-[1.25rem] border border-line bg-card p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <b>سفارش {{ order.id | faNumber }} · {{ order.buyer }}</b>
              <span class="rounded-full px-2.5 py-0.5 text-[0.75rem]" [class]="statusClass[order.status]">{{ statusLabel[order.status] }}</span>
            </div>
            <p class="text-[0.8125rem] text-mut">
              {{ order.products.join('، ') }} · {{ order.total | faNumber }} تومان · {{ order.createdAt | relativeTime }}
            </p>
            @if (order.allowedStatuses.length) {
              <div class="flex flex-wrap gap-2">
                @for (next of order.allowedStatuses; track next) {
                  <button type="button" class="btn cursor-pointer" (click)="setStatus(order, next)">{{ statusLabel[next] }}</button>
                }
              </div>
            }
          </li>
        } @empty {
          <li class="rounded-[1.25rem] border border-line bg-card p-6 text-center text-mut">سفارشی وجود ندارد.</li>
        }
      </ul>

      @if (page.lastPage > 1) {
        <nav class="mt-6 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
          <button type="button" class="btn cursor-pointer" [disabled]="page.page <= 1" (click)="pageNumber.set(page.page - 1)"><app-icon name="arrow-back" /> قبلی</button>
          <span class="text-[0.875rem] text-mut">صفحه‌ی {{ page.page | faNumber }} از {{ page.lastPage | faNumber }}</span>
          <button type="button" class="btn cursor-pointer" [disabled]="page.page >= page.lastPage" (click)="pageNumber.set(page.page + 1)">بعدی</button>
        </nav>
      }
    } @else {
      <p role="status" class="mt-6 text-mut">در حال بارگذاری…</p>
    }
  `,
})
export class AdminOrdersPageComponent {
  private readonly api = inject(AdminApi);

  protected readonly statusLabel = ORDER_STATUS_LABELS;
  protected readonly statusClass = ORDER_STATUS_CLASSES;
  protected readonly notice = signal<string | null>(null);
  protected readonly pageNumber = signal(1);
  private readonly refreshKey = signal(0);

  protected readonly orders = rxResource({
    params: () => ({ page: this.pageNumber(), key: this.refreshKey() }),
    stream: ({ params }) => this.api.orders(params.page),
  });

  protected setStatus(order: AdminOrder, status: OrderStatus): void {
    this.api.setOrderStatus(order.id, status).subscribe({
      next: () => {
        this.notice.set(`وضعیت سفارش ${order.id} به «${ORDER_STATUS_LABELS[status]}» تغییر کرد.`);
        this.refreshKey.update((n) => n + 1);
      },
      error: (error: unknown) => this.notice.set(errorMessage(error)),
    });
  }
}
