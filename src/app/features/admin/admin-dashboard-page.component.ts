import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, OrderStatus } from '../../shared/models/order-status';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { AdminApi } from './data-access/admin.api';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [RouterLink, FaNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-[clamp(1.5rem,3.5vw,2rem)] font-black tracking-[-0.02em]">داشبورد</h1>

    @if (stats.error()) {
      <p role="alert" class="mt-6 rounded-[1.25rem] bg-rose/10 p-4 text-rose">بارگذاری آمار ممکن نشد.</p>
    } @else if (stats.value(); as s) {
      <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div class="rounded-[1.25rem] border border-line bg-card p-4">
          <p class="text-[0.8125rem] text-mut">درآمد (سفارش‌های تکمیل‌شده)</p>
          <p class="mt-1 text-[1.5rem] font-black">
            {{ s.revenue | faNumber }} <small class="text-[0.75rem] font-normal text-mut">تومان</small>
          </p>
        </div>
        @for (card of cards(); track card.label) {
          <a [routerLink]="card.link" class="rounded-[1.25rem] border border-line bg-card p-4 transition-colors hover:border-iris">
            <p class="text-[0.8125rem] text-mut">{{ card.label }}</p>
            <p class="mt-1 text-[1.5rem] font-black">{{ card.value | faNumber }}</p>
          </a>
        }
      </div>

      <h2 class="mt-8 text-[1.125rem] font-bold">وضعیت سفارش‌ها</h2>
      <ul class="mt-3 flex flex-wrap gap-2">
        @for (status of statuses; track status) {
          <li class="rounded-full px-3 py-1 text-[0.8125rem]" [class]="statusClass[status]">
            {{ statusLabel[status] }}: {{ s.ordersByStatus[status] | faNumber }}
          </li>
        }
      </ul>
    } @else {
      <p role="status" class="mt-6 text-mut">در حال بارگذاری…</p>
    }
  `,
})
export class AdminDashboardPageComponent {
  private readonly api = inject(AdminApi);

  protected readonly stats = rxResource({ stream: () => this.api.stats() });

  protected readonly statuses: readonly OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
  protected readonly statusLabel = ORDER_STATUS_LABELS;
  protected readonly statusClass = ORDER_STATUS_CLASSES;

  protected readonly cards = computed(() => {
    const counts = this.stats.value()?.counts;
    if (!counts) {
      return [];
    }
    return [
      { label: 'نمونه‌کارها', value: counts.works, link: '/admin/content/works' },
      { label: 'نوشته‌ها', value: counts.posts, link: '/admin/content/posts' },
      { label: 'محصولات', value: counts.products, link: '/admin/content/products' },
      { label: 'سفارش‌ها', value: counts.orders, link: '/admin/orders' },
      { label: 'پیام‌ها', value: counts.contacts, link: '/admin/contacts' },
      { label: 'کاربران', value: counts.users, link: '/admin' },
    ];
  });
}
