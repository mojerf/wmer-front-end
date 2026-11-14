import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap grid min-h-[70vh] place-content-center justify-items-center gap-4 text-center">
      <p class="font-mono text-[clamp(4rem,14vw,9rem)] leading-none font-black tracking-[-0.05em] text-shimmer" dir="ltr">404</p>
      <h1 class="text-[clamp(1.5rem,4vw,2.25rem)] font-black">این صفحه پیدا نشد</h1>
      <p class="max-w-[28rem] text-mut">ممکن است آدرس اشتباه باشد یا صفحه جابه‌جا شده باشد.</p>
      <a class="btn btn-main mt-2" routerLink="/">بازگشت به خانه <app-icon name="arrow" /></a>
    </section>
  `,
})
export class NotFoundPageComponent {
  constructor() {
    inject(SeoService).set({
      title: 'صفحه پیدا نشد | مجتبی عرفان‌راد',
      description: 'صفحه‌ی مورد نظر پیدا نشد.',
      noindex: true,
    });
  }
}
