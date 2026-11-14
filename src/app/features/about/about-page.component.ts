import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';

interface SkillGroup {
  title: string;
  items: readonly string[];
}

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="wrap max-w-[48rem] pt-[3.5rem] pb-10">
      <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-[1.3] font-black tracking-[-0.03em]">
        درباره‌ی <span class="text-shimmer">من</span>
      </h1>

      <div class="mt-6 grid gap-4 text-[1.0625rem] leading-[2.1]">
        <p>
          سلام، من مجتبی عرفان‌راد هستم؛ طراح و برنامه‌نویس وب. وب‌اپلیکیشن‌هایی می‌سازم که سریع، امن و قابل‌نگهداری باشند،
          از رابط کاربری تا API و استقرار.
        </p>
        <p>
          این سایت هم نمونه‌ای از همین رویکرد است: Angular با رندر سمت سرور، Laravel برای API، تست‌های خودکار و معماری تمیز؛
          و کل کد آن روی GitHub باز است.
        </p>
      </div>

      <h2 class="mt-10 text-[1.375rem] font-black">مهارت‌ها</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        @for (group of skills; track group.title) {
          <section class="rounded-[1.25rem] border border-line bg-card p-5">
            <h3 class="font-bold">{{ group.title }}</h3>
            <ul class="mt-3 flex flex-wrap gap-2">
              @for (item of group.items; track item) {
                <li class="rounded-full border border-line px-3 py-0.5 font-mono text-[0.75rem] text-mut" dir="ltr">{{ item }}</li>
              }
            </ul>
          </section>
        }
      </div>

      <div class="mt-10 flex flex-wrap gap-3">
        <a routerLink="/contact" class="btn btn-main">گفت‌وگو درباره‌ی پروژه <app-icon name="arrow" /></a>
        <a [href]="github" target="_blank" rel="noopener noreferrer" class="btn"><app-icon name="github" /> GitHub</a>
      </div>
    </article>
  `,
})
export class AboutPageComponent {
  protected readonly github = SITE.github.profile;

  protected readonly skills: readonly SkillGroup[] = [
    { title: 'فرانت‌اند', items: ['Angular', 'TypeScript', 'Signals', 'SSR', 'Tailwind CSS', 'RxJS'] },
    { title: 'بک‌اند', items: ['Laravel', 'PHP', 'Sanctum', 'MySQL', 'REST API', 'Pest'] },
    { title: 'کیفیت', items: ['Unit tests', 'Vitest', 'ESLint', 'PHPStan', 'CI'] },
    { title: 'محصول', items: ['SEO', 'Accessibility', 'Performance', 'RTL / Persian UX'] },
  ];

  constructor() {
    const seo = inject(SeoService);
    seo.set({
      title: `درباره‌ی من | ${SITE.name}`,
      description: `${SITE.name}؛ ${SITE.jobTitle}. مهارت‌ها و رویکرد من در ساخت وب‌اپلیکیشن‌های سریع و امن.`,
      path: '/about',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `درباره‌ی ${SITE.name}`,
          url: `${seo.siteUrl}/about`,
          inLanguage: 'fa-IR',
        },
      ],
    });
  }
}
