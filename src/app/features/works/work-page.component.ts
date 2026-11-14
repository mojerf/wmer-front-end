import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorkDetail } from './data-access/works.models';

const excerpt = (text: string, max = 160): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
};

@Component({
  selector: 'app-work-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let w = work();

    <article class="wrap max-w-[56rem] pt-[3rem] pb-10">
      <nav aria-label="مسیر صفحه" class="mb-5 flex gap-2 text-[0.8125rem] text-mut">
        <a routerLink="/" class="hover:text-fg">خانه</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/works" class="hover:text-fg">نمونه‌کارها</a>
      </nav>

      <h1 class="text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.45] font-black tracking-[-0.02em]">{{ w.title }}</h1>
      @if (w.overview) {
        <p class="mt-2 max-w-[40rem] text-[1.0625rem] leading-[2] text-mut">{{ w.overview }}</p>
      }

      <ul class="mt-4 flex flex-wrap gap-2">
        @for (tag of w.tags; track tag) {
          <li>
            <a
              routerLink="/works"
              [queryParams]="{ tag }"
              class="rounded-full border border-line px-3 py-0.5 font-mono text-[0.75rem] text-mut transition-colors hover:border-iris hover:text-fg"
              >{{ tag }}</a
            >
          </li>
        }
      </ul>

      @if (w.fullImageUrl || w.imageUrl; as src) {
        <img [src]="src" [alt]="w.title" class="mt-6 max-h-[32rem] w-full rounded-[1.5rem] object-cover" />
      }

      <dl class="mt-8 grid gap-3 rounded-[1.5rem] border border-line bg-card p-5 text-[0.9375rem] sm:grid-cols-3">
        <div>
          <dt class="text-[0.8125rem] text-mut">نقش من</dt>
          <dd class="mt-0.5 font-bold">{{ w.role }}</dd>
        </div>
        <div>
          <dt class="text-[0.8125rem] text-mut">بازه‌ی انجام</dt>
          <dd class="mt-0.5 font-bold">{{ w.timeline }}</dd>
        </div>
        <div>
          <dt class="text-[0.8125rem] text-mut">انتشار</dt>
          <dd class="mt-0.5 font-bold">{{ w.publishDate }}</dd>
        </div>
      </dl>

      <div class="mt-8 text-[1.0625rem] leading-[2.1] whitespace-pre-line">{{ w.description }}</div>

      @if (w.learn) {
        <section class="mt-8 rounded-[1.5rem] border border-line bg-card p-5">
          <h2 class="font-black">چه یاد گرفتم</h2>
          <p class="mt-2 leading-[2]">{{ w.learn }}</p>
        </section>
      }

      @if (w.projectLink) {
        <a [href]="w.projectLink" target="_blank" rel="noopener noreferrer" class="btn btn-main mt-8">
          دیدن پروژه <app-icon name="arrow" />
        </a>
      }
    </article>
  `,
})
export class WorkPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly work = input.required<WorkDetail>();

  constructor() {
    const seo = inject(SeoService);

    effect(() => {
      const w = this.work();
      const url = `${seo.siteUrl}/works/${w.slug}`;
      const description = excerpt(w.overview || w.description);

      seo.set({
        title: `${w.title} | ${SITE.name}`,
        description,
        path: `/works/${w.slug}`,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: w.title,
            description,
            url,
            inLanguage: 'fa-IR',
            keywords: w.tags.join(', '),
            dateModified: w.updatedAt,
            datePublished: w.publishedAt,
            author: { '@type': 'Person', name: SITE.name },
            ...(w.fullImageUrl || w.imageUrl ? { image: w.fullImageUrl ?? w.imageUrl } : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: `${seo.siteUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'نمونه‌کارها', item: `${seo.siteUrl}/works` },
              { '@type': 'ListItem', position: 3, name: w.title, item: url },
            ],
          },
        ],
      });
    });
  }
}
