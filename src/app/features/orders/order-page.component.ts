import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ExternalNavigation } from '../../core/browser/external-navigation';
import { APP_CONFIG } from '../../core/config/app-config';
import { SITE } from '../../core/config/site.config';
import { errorMessage } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { OrdersApi } from './data-access/orders.api';
import { isTrustedGatewayUrl } from './data-access/gateway-url';
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, Order } from './data-access/orders.models';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-order-page',
  imports: [RouterLink, FaNumberPipe, RelativeTimePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let o = order();

    <section class="wrap max-w-[48rem] pt-[3.5rem] pb-10">
      <nav aria-label="مسیر صفحه" class="mb-5 flex gap-2 text-[0.8125rem] text-mut">
        <a routerLink="/orders" class="hover:text-fg">سفارش‌های من</a>
        <span aria-hidden="true">›</span>
        <span>سفارش {{ o.id | faNumber }}</span>
      </nav>

      @if (payment() === 'success') {
        <p role="status" class="mb-5 rounded-[1.25rem] bg-emerald-500/10 p-4 text-[0.9375rem] leading-[1.9] text-emerald-700 dark:text-emerald-300">
          پرداخت با موفقیت انجام شد. لینک‌های دانلود پایین همین صفحه فعال شده‌اند.
        </p>
      } @else if (payment() === 'failed') {
        <p role="alert" class="mb-5 rounded-[1.25rem] bg-rose/10 p-4 text-[0.9375rem] leading-[1.9] text-rose">
          پرداخت انجام نشد یا لغو شد. اگر مبلغی کسر شده، تا چند ساعت به حسابتان برمی‌گردد؛ می‌توانید دوباره تلاش کنید.
        </p>
      } @else if (placed()) {
        <p role="status" class="mb-5 rounded-[1.25rem] bg-emerald-500/10 p-4 text-[0.9375rem] leading-[1.9] text-emerald-700 dark:text-emerald-300">
          سفارش شما ثبت شد. برای فعال شدن لینک‌های دانلود، پرداخت را انجام دهید.
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
                <img [src]="line.imageUrl" [alt]="line.title" loading="lazy" width="56" height="56" class="size-full object-cover" />
              }
            </div>
            <div class="min-w-0 flex-1">
              <a [routerLink]="['/shop', line.slug]" class="font-bold hover:text-aqua">{{ line.title }}</a>
              <p class="mt-0.5 text-[0.875rem] text-mut">{{ line.price | faNumber }} تومان</p>
            </div>
            @if (line.downloadLink) {
              <a class="btn btn-main min-h-9 px-4 text-[0.8125rem]" [href]="line.downloadLink" target="_blank" rel="noopener noreferrer"><app-icon name="download" />دانلود</a>
            } @else if (o.status !== 'cancelled') {
              <span class="text-[0.8125rem] text-mut">لینک پس از پرداخت فعال می‌شود</span>
            }
          </li>
        }
      </ul>

      <p class="mt-6 flex items-center justify-between rounded-[1.25rem] border border-line bg-card p-4 text-[1.125rem]">
        <span>جمع کل</span>
        <b>{{ o.total | faNumber }} <small class="text-[0.75rem] font-normal text-mut">تومان</small></b>
      </p>

      @if (o.canPay) {
        <div class="mt-4">
          <button type="button" class="btn btn-main cursor-pointer" [disabled]="paying()" (click)="pay()">
            <app-icon name="card" />
            {{ paying() ? 'در حال انتقال به درگاه…' : 'پرداخت ' + (o.total | faNumber) + ' تومان' }}
          </button>
          @if (error()) {
            <p role="alert" class="mt-3 rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ error() }}</p>
          }
        </div>
      }
    </section>
  `,
})
export class OrderPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly order = input.required<Order>();
  /** `?placed=1` right after checkout. */
  readonly placed = input<string | undefined>(undefined);
  /** `?payment=success|failed` when the customer comes back from the gateway. */
  readonly payment = input<string | undefined>(undefined);

  private readonly api = inject(OrdersApi);
  private readonly router = inject(Router);
  private readonly external = inject(ExternalNavigation);
  private readonly apiUrl = inject(APP_CONFIG).apiUrl;

  protected readonly paying = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly statusLabel = () => ORDER_STATUS_LABELS[this.order().status];
  protected readonly statusClass = () => ORDER_STATUS_CLASSES[this.order().status];

  constructor() {
    inject(SeoService).set({
      title: `سفارش | ${SITE.name}`,
      description: 'جزئیات سفارش',
      noindex: true,
    });
  }

  protected pay(): void {
    if (this.paying()) {
      return;
    }

    this.paying.set(true);
    this.error.set(null);

    this.api.pay(this.order().id).subscribe({
      next: ({ url }) => {
        if (url === null) {
          // Nothing to pay (free order): it is already complete.
          void this.router.navigate(['/orders', this.order().id], { queryParams: { payment: 'success' } });
          this.paying.set(false);
        } else if (isTrustedGatewayUrl(url, this.apiUrl)) {
          this.external.go(url);
        } else {
          this.paying.set(false);
          this.error.set('آدرس درگاه پرداخت معتبر نیست.');
        }
      },
      error: (error: unknown) => {
        this.paying.set(false);
        this.error.set(errorMessage(error));
      },
    });
  }
}
