import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../core/cart/cart.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PaletteService } from '../command-palette/palette.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';

type Menu = 'nav' | 'user';

/**
 * Left to right in reading order (right to left on screen):
 *   brand · page links | search · cart · theme | account (sign in / sign up, or the user menu)
 * Below 820px the page links and the sign-in buttons move into a single menu.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, ThemeSwitchComponent, IconComponent, FaNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <header
      class="sticky top-[0.875rem] z-30 mx-auto mt-[0.875rem] flex h-14 w-fit max-w-[calc(100%-1.5rem)] items-center gap-[clamp(0.5rem,1.6vw,1.25rem)] rounded-full border border-line bg-card/70 p-[0.4375rem] backdrop-blur-xl"
    >
      <!-- Page menu (small screens) -->
      <div class="relative min-[820px]:hidden">
        <button
          type="button"
          class="icon-btn"
          aria-label="منو"
          aria-haspopup="menu"
          [attr.aria-expanded]="open() === 'nav'"
          (click)="toggle('nav')"
        >
          <app-icon [name]="open() === 'nav' ? 'close' : 'menu'" />
        </button>

        @if (open() === 'nav') {
          <div role="menu" class="menu-panel start-0 w-[min(18rem,calc(100vw-2rem))]">
            @for (link of links; track link.route) {
              <a role="menuitem" [routerLink]="link.route" class="menu-item" routerLinkActive="!bg-line" ariaCurrentWhenActive="page">
                <app-icon [name]="link.icon" />{{ link.label }}
              </a>
            }
            @if (!auth.isLoggedIn()) {
              <hr class="my-1.5 border-line" />
              <a role="menuitem" routerLink="/login" class="menu-item"><app-icon name="login" />ورود</a>
              <a role="menuitem" routerLink="/register" class="menu-item font-bold"><app-icon name="user-plus" />ثبت‌نام</a>
            }
          </div>
        }
      </div>

      <a routerLink="/" class="flex items-center gap-2 ps-1 pe-1 font-bold tracking-tight whitespace-nowrap">
        <span
          aria-hidden="true"
          class="size-[1.625rem] rounded-[0.5rem] bg-[conic-gradient(from_200deg,var(--iris),var(--aqua),var(--rose),var(--iris))]"
        ></span>
        <span class="max-[480px]:sr-only">مجتبی عرفان‌راد</span>
      </a>

      <nav aria-label="منوی اصلی" class="hidden gap-1 text-[0.875rem] text-mut min-[820px]:flex">
        @for (link of links; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="!bg-line !text-fg"
            ariaCurrentWhenActive="page"
            class="rounded-full px-3 py-1 transition-colors hover:bg-line hover:text-fg"
          >
            {{ link.label }}
          </a>
        }
      </nav>

      <div class="flex items-center gap-2">
        <!-- Search: a labelled pill when there is room, an icon otherwise -->
        <button
          type="button"
          (click)="palette.show()"
          aria-label="جستجو و پیمایش سریع"
          class="hidden cursor-pointer items-center gap-2.5 rounded-full border border-line py-1.5 ps-3 pe-2 text-[0.8125rem] text-mut transition-colors hover:text-fg min-[1100px]:flex"
        >
          <app-icon name="search" />
          <span>جستجو</span>
          <kbd class="rounded-[0.375rem] bg-line px-1.5 font-mono text-[0.6875rem]" dir="ltr">Ctrl K</kbd>
        </button>
        <button type="button" (click)="palette.show()" aria-label="جستجو و پیمایش سریع" class="icon-btn min-[1100px]:hidden">
          <app-icon name="search" />
        </button>

        <a routerLink="/cart" class="icon-btn" [attr.aria-label]="cartLabel()">
          <app-icon name="cart" />
          @if (cart.count() > 0) {
            <span class="absolute -top-1 -end-1 grid min-w-[1.125rem] place-items-center rounded-full bg-rose px-1 text-[0.6875rem] leading-[1.125rem] font-bold text-white">{{ cart.count() | faNumber }}</span>
          }
        </a>

        <app-theme-switch />

        <span class="mx-0.5 hidden h-5 w-px bg-line min-[820px]:block" aria-hidden="true"></span>

        @if (auth.isLoggedIn()) {
          <div class="relative">
            <button
              type="button"
              class="flex cursor-pointer items-center gap-2 rounded-full border border-line py-1 ps-1 pe-2.5 text-[0.8125rem] transition-colors hover:border-iris"
              aria-haspopup="menu"
              [attr.aria-expanded]="open() === 'user'"
              [attr.aria-label]="'حساب کاربری ' + auth.displayName()"
              (click)="toggle('user')"
            >
              <span class="grid size-7 place-items-center rounded-full bg-bg-2 text-[0.75rem] font-bold" aria-hidden="true">{{ initial() }}</span>
              <span class="max-w-[6.5rem] truncate max-[1100px]:hidden">{{ auth.displayName() }}</span>
              <app-icon name="chevron-down" />
            </button>

            @if (open() === 'user') {
              <div role="menu" class="menu-panel end-0 w-[16rem]">
                <div class="px-3 py-2">
                  <p class="truncate font-bold">{{ auth.displayName() }}</p>
                  <p class="truncate text-[0.75rem] text-mut" dir="ltr">{{ auth.user()?.email }}</p>
                </div>
                <hr class="my-1.5 border-line" />
                <a role="menuitem" routerLink="/orders" class="menu-item"><app-icon name="orders" />سفارش‌های من</a>
                @if (auth.user()?.role === 'admin') {
                  <a role="menuitem" routerLink="/admin" class="menu-item text-aqua"><app-icon name="shield" />پنل مدیریت</a>
                }
                <hr class="my-1.5 border-line" />
                <button role="menuitem" type="button" class="menu-item w-full cursor-pointer hover:!text-rose" (click)="logout()">
                  <app-icon name="logout" />خروج
                </button>
              </div>
            }
          </div>
        } @else {
          <a routerLink="/login" class="hidden min-h-9 items-center gap-2 rounded-full px-3 text-[0.8125rem] text-mut transition-colors hover:bg-line hover:text-fg min-[820px]:inline-flex">
            <app-icon name="login" />ورود
          </a>
          <a routerLink="/register" class="btn btn-main hidden min-h-9 gap-2 px-4 text-[0.8125rem] min-[820px]:inline-flex">
            <app-icon name="user-plus" />ثبت‌نام
          </a>
        }
      </div>
    </header>
  `,
})
export class SiteHeaderComponent {
  protected readonly palette = inject(PaletteService);
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly open = signal<Menu | null>(null);

  protected readonly links = [
    { route: '/works', icon: 'briefcase', label: 'نمونه‌کارها' },
    { route: '/blog', icon: 'article', label: 'وبلاگ' },
    { route: '/shop', icon: 'bag', label: 'فروشگاه' },
    { route: '/about', icon: 'user', label: 'درباره' },
    { route: '/contact', icon: 'mail', label: 'تماس' },
  ] as const;

  constructor() {
    // Any navigation closes an open menu.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.close());
  }

  protected cartLabel(): string {
    const count = this.cart.count();
    return count > 0 ? `سبد خرید (${count} مورد)` : 'سبد خرید';
  }

  protected initial(): string {
    return Array.from(this.auth.displayName())[0] ?? '';
  }

  protected toggle(menu: Menu): void {
    this.open.update((current) => (current === menu ? null : menu));
  }

  protected close(): void {
    this.open.set(null);
  }

  protected onDocumentClick(event: Event): void {
    if (this.open() && !this.host.contains(event.target as Node)) {
      this.close();
    }
  }

  protected logout(): void {
    this.close();
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/'));
  }
}
