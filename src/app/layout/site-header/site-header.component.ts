import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { PaletteService } from '../command-palette/palette.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, ThemeSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-[0.875rem] z-30 mx-auto mt-[0.875rem] flex h-14 w-fit max-w-[calc(100%-1.5rem)] items-center gap-[clamp(0.625rem,2.4vw,1.75rem)] rounded-full border border-line bg-card/70 p-[0.4375rem] backdrop-blur-xl"
    >
      <a
        routerLink="/"
        class="flex items-center gap-2 ps-3 pe-1 font-bold tracking-tight whitespace-nowrap"
      >
        <span
          aria-hidden="true"
          class="size-[1.625rem] rounded-[0.5rem] bg-[conic-gradient(from_200deg,var(--iris),var(--aqua),var(--rose),var(--iris))]"
        ></span>
        مجتبی عرفان‌راد
      </a>

      <nav aria-label="منوی اصلی" class="hidden gap-1 text-[0.875rem] text-mut min-[820px]:flex">
        @for (link of links; track link.label) {
          <a
            [routerLink]="link.route"
            [fragment]="link.fragment"
            class="rounded-full px-3 py-1 transition-colors hover:bg-line hover:text-fg"
          >
            {{ link.label }}
          </a>
        }
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="palette.show()"
          aria-label="جستجو و پیمایش سریع"
          class="flex cursor-pointer items-center gap-2.5 rounded-full border border-line px-3 py-1.5 text-[0.8125rem] text-mut transition-colors hover:text-fg max-[520px]:hidden"
        >
          <span class="max-[820px]:hidden">جستجو</span>
          <kbd class="rounded-[0.375rem] bg-line px-1.5 font-mono text-[0.6875rem]" dir="ltr">Ctrl K</kbd>
        </button>

        <a
          routerLink="/cart"
          aria-label="سبد خرید"
          class="relative grid size-9 place-items-center rounded-full border border-line text-mut transition-colors hover:text-fg"
        >
          <svg class="size-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 1.9-1.4L20.5 8H6" />
            <circle cx="9.5" cy="20" r="1" />
            <circle cx="17.5" cy="20" r="1" />
          </svg>
          @if (cart.count() > 0) {
            <span class="absolute -top-1 -end-1 grid min-w-[1.125rem] place-items-center rounded-full bg-rose px-1 text-[0.6875rem] leading-[1.125rem] font-bold text-white">{{ cart.count() }}</span>
          }
        </a>

        @if (auth.isLoggedIn()) {
          <span class="flex items-center gap-2 rounded-full border border-line py-1 ps-1 pe-3 text-[0.8125rem]">
            <span
              class="grid size-7 place-items-center rounded-full bg-bg-2 text-[0.75rem] font-bold"
              aria-hidden="true"
              >{{ initial() }}</span
            >
            <span class="max-w-[7rem] truncate max-[820px]:hidden">{{ auth.displayName() }}</span>
            <a routerLink="/orders" class="text-mut hover:text-fg max-[820px]:hidden">سفارش‌ها</a>
            <button type="button" class="cursor-pointer text-mut hover:text-fg" (click)="logout()">خروج</button>
          </span>
        } @else {
          <a routerLink="/login" class="btn btn-main min-h-9 px-4 text-[0.8125rem]">ورود</a>
        }

        <app-theme-switch />
      </div>
    </header>
  `,
})
export class SiteHeaderComponent {
  protected readonly palette = inject(PaletteService);
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);

  protected readonly links = [
    { route: '/', fragment: 'works', label: 'نمونه‌کارها' },
    { route: '/blog', fragment: undefined, label: 'وبلاگ' },
    { route: '/shop', fragment: undefined, label: 'فروشگاه' },
    { route: '/', fragment: 'contact', label: 'تماس' },
  ] as const;

  protected initial(): string {
    return Array.from(this.auth.displayName())[0] ?? '';
  }

  protected logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/'));
  }
}
