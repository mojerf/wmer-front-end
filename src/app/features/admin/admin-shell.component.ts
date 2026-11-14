import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap pt-[2.5rem] pb-10">
      <nav aria-label="مدیریت" class="flex flex-wrap gap-2">
        @for (item of items; track item.link) {
          <a
            [routerLink]="item.link"
            routerLinkActive="!border-iris !text-fg"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="rounded-full border border-line bg-card px-4 py-1.5 text-[0.875rem] text-mut transition-colors hover:text-fg"
            >{{ item.label }}</a
          >
        }
      </nav>
      <div class="mt-6"><router-outlet /></div>
    </section>
  `,
})
export class AdminShellComponent {
  protected readonly items = [
    { link: '/admin', label: 'داشبورد', exact: true },
    { link: '/admin/content/works', label: 'نمونه‌کارها', exact: false },
    { link: '/admin/content/posts', label: 'نوشته‌ها', exact: false },
    { link: '/admin/content/products', label: 'محصولات', exact: false },
    { link: '/admin/orders', label: 'سفارش‌ها', exact: false },
    { link: '/admin/contacts', label: 'پیام‌ها', exact: false },
  ];

  constructor() {
    inject(SeoService).set({ title: `مدیریت | ${SITE.name}`, description: 'مدیریت', noindex: true });
  }
}
