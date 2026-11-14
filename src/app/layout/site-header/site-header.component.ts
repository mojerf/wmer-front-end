import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
          class="flex cursor-pointer items-center gap-2.5 rounded-full border border-line px-3 py-1.5 text-[0.8125rem] text-mut transition-colors hover:text-fg"
        >
          <span class="max-[820px]:hidden">جستجو</span>
          <kbd class="rounded-[0.375rem] bg-line px-1.5 font-mono text-[0.6875rem]" dir="ltr">Ctrl K</kbd>
        </button>
        <app-theme-switch />
      </div>
    </header>
  `,
})
export class SiteHeaderComponent {
  protected readonly palette = inject(PaletteService);

  protected readonly links = [
    { route: '/', fragment: 'works', label: 'نمونه‌کارها' },
    { route: '/blog', fragment: undefined, label: 'وبلاگ' },
    { route: '/', fragment: 'shop', label: 'فروشگاه' },
    { route: '/', fragment: 'contact', label: 'تماس' },
  ] as const;
}
