import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { SITE } from '../../core/config/site.config';
import { errorMessage } from '../../core/http/api-errors';
import { SeoService } from '../../core/seo/seo.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { OrdersApi } from './data-access/orders.api';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, FaNumberPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap max-w-[48rem] pt-[3.5rem] pb-10">
      <h1 class="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.02em]">سبد خرید</h1>

      @if (cart.items().length) {
        <ul class="mt-6 grid gap-3">
          @for (item of cart.items(); track item.id) {
            <li class="flex items-center gap-4 rounded-[1.25rem] border border-line bg-card p-4">
              <div class="size-16 shrink-0 overflow-hidden rounded-[0.875rem] bg-[linear-gradient(135deg,#0e7490,#22d3ee_60%,#34d399)]">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.title" loading="lazy" class="size-full object-cover" />
                }
              </div>
              <div class="min-w-0 flex-1">
                <a [routerLink]="['/shop', item.slug]" class="font-bold hover:text-aqua">{{ item.title }}</a>
                <p class="mt-0.5 text-[0.875rem] text-mut">{{ item.price | faNumber }} تومان</p>
              </div>
              <button type="button" class="cursor-pointer text-[0.8125rem] text-mut hover:text-rose" (click)="cart.remove(item.id)">حذف</button>
            </li>
          }
        </ul>

        <div class="mt-6 rounded-[1.5rem] border border-line bg-card p-5">
          <p class="flex items-center justify-between text-[1.125rem]">
            <span>جمع کل</span>
            <b>{{ cart.total() | faNumber }} <small class="text-[0.75rem] font-normal text-mut">تومان</small></b>
          </p>
          <p class="mt-2 text-[0.8125rem] leading-[1.9] text-mut">
            مبلغ نهایی را سرور از قیمت فعلی محصولات حساب می‌کند. پرداخت آنلاین هنوز فعال نیست؛ سفارش ثبت می‌شود و پس از بررسی
            تکمیل می‌شود، و بعد از آن لینک دانلود را در «سفارش‌های من» می‌بینید.
          </p>

          @if (error()) {
            <p role="alert" class="mt-3 rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ error() }}</p>
          }

          <div class="mt-4 flex flex-wrap gap-3">
            @if (auth.isLoggedIn()) {
              <button type="button" class="btn btn-main cursor-pointer" [disabled]="submitting()" (click)="checkout()">
                {{ submitting() ? 'در حال ثبت…' : 'ثبت سفارش' }}
              </button>
            } @else {
              <a routerLink="/login" [queryParams]="{ redirect: '/cart' }" class="btn btn-main">برای ثبت سفارش وارد شوید</a>
            }
            <a routerLink="/shop" class="btn">ادامه‌ی خرید</a>
          </div>
        </div>
      } @else {
        <div class="mt-6 rounded-[1.5rem] border border-line bg-card p-8 text-center">
          <p class="text-mut">سبد خرید شما خالی است.</p>
          <a routerLink="/shop" class="btn btn-main mt-4">دیدن محصولات <app-icon name="arrow" /></a>
        </div>
      }
    </section>
  `,
})
export class CartPageComponent {
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(OrdersApi);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    inject(SeoService).set({
      title: `سبد خرید | ${SITE.name}`,
      description: 'سبد خرید',
      noindex: true,
    });
  }

  protected checkout(): void {
    if (this.submitting() || !this.cart.count()) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.api.create(this.cart.items().map((item) => item.id)).subscribe({
      next: (order) => {
        this.cart.clear();
        void this.router.navigate(['/orders', order.id], { queryParams: { placed: 1 } });
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.error.set(errorMessage(error));
      },
    });
  }
}
