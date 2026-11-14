import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../shared/directives/spotlight.directive';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { BlogListData } from './data-access/blog.resolvers';

@Component({
  selector: 'app-blog-list-page',
  imports: [RouterLink, RevealDirective, SpotlightDirective, RelativeTimePipe, FaNumberPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap pt-[3.5rem] pb-8">
      <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-[1.3] font-black tracking-[-0.03em]">
        <span class="text-shimmer">وبلاگ</span>
      </h1>
      <p class="mt-2 max-w-[34rem] text-mut">
        یادداشت‌هایی درباره‌ی Angular، لاراول، سئو و ساخت محصول.
      </p>

      <form class="mt-6 flex max-w-[34rem] gap-2" role="search" (submit)="search($event, field.value)">
        <input
          #field
          type="search"
          name="q"
          [value]="data().search"
          maxlength="100"
          placeholder="جست‌وجو در نوشته‌ها…"
          aria-label="جست‌وجو در نوشته‌ها"
          class="min-h-12 flex-1 rounded-full border border-line bg-card px-5 text-[0.9375rem] text-fg outline-none placeholder:text-mut focus:border-iris"
        />
        <button type="submit" class="btn btn-main cursor-pointer">جست‌وجو</button>
      </form>

      @if (data().search) {
        <p class="mt-4 text-[0.875rem] text-mut">
          {{ data().posts.total | faNumber }} نتیجه برای «{{ data().search }}» ·
          <a routerLink="/blog" class="text-aqua underline-offset-4 hover:underline">پاک کردن جست‌وجو</a>
        </p>
      }
    </section>

    <section class="wrap pb-8" aria-label="فهرست نوشته‌ها">
      @if (data().posts.items.length) {
        <div class="grid gap-[0.875rem] sm:grid-cols-2">
          @for (post of data().posts.items; track post.id; let i = $index) {
            <article appSpotlight [appReveal]="(i % 2) * 90" class="card">
              <a [routerLink]="['/blog', post.slug]" class="absolute inset-0 z-10" [attr.aria-label]="post.title"></a>
              <div
                class="-mx-1.5 -mt-1.5 mb-4 grid h-[9rem] place-items-center overflow-hidden rounded-2xl text-[2.5rem]"
                [class]="post.imageUrl ? 'bg-bg-2' : fallbackGradient"
              >
                @if (post.imageUrl) {
                  <img [src]="post.thumbUrl ?? post.imageUrl" [alt]="post.title" loading="lazy" decoding="async" class="size-full object-cover" />
                } @else {
                  <span aria-hidden="true">✦</span>
                }
              </div>
              <h2 class="text-[1.1875rem] leading-[1.7] font-bold">{{ post.title }}</h2>
              <p class="mt-auto pt-3 text-[0.8125rem] text-mut">
                <time [attr.datetime]="post.publishedAt">{{ post.publishedAt | relativeTime }}</time>
                · {{ post.commentsCount | faNumber }} نظر
              </p>
            </article>
          }
        </div>

        @if (data().posts.lastPage > 1) {
          <nav class="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
            @if (data().posts.page > 1) {
              <a class="btn" routerLink="/blog" [queryParams]="pageParams(data().posts.page - 1)" rel="prev">
                قبلی
              </a>
            }
            <span class="text-[0.875rem] text-mut">
              صفحه‌ی {{ data().posts.page | faNumber }} از {{ data().posts.lastPage | faNumber }}
            </span>
            @if (data().posts.page < data().posts.lastPage) {
              <a class="btn" routerLink="/blog" [queryParams]="pageParams(data().posts.page + 1)" rel="next">
                بعدی <app-icon name="arrow" />
              </a>
            }
          </nav>
        }
      } @else {
        <p class="rounded-[1.25rem] border border-line bg-card p-8 text-center text-mut">
          نوشته‌ای پیدا نشد.
        </p>
      }
    </section>
  `,
})
export class BlogListPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly data = input.required<BlogListData>();

  private readonly router = inject(Router);

  protected readonly fallbackGradient = 'bg-[linear-gradient(135deg,#4c1d95,#7c5cff_60%,#22d3ee)]';

  /** Page 1 has no `page` parameter so there is exactly one URL for it. */
  protected readonly pageParams = (page: number) => ({
    q: this.data().search || null,
    page: page > 1 ? page : null,
  });

  private readonly canonicalPath = computed(() => {
    const { page } = this.data().posts;
    return page > 1 ? `/blog?page=${page}` : '/blog';
  });

  constructor() {
    const seo = inject(SeoService);

    // Re-runs whenever the resolver delivers new data (search or page change).
    effect(() => this.applySeo(seo));
  }

  private applySeo(seo: SeoService): void {
    const { search, posts } = this.data();
    const suffix = posts.page > 1 ? ` — صفحه‌ی ${posts.page}` : '';

    seo.set({
      title: `وبلاگ${suffix} | ${SITE.name}`,
      description: 'یادداشت‌هایی درباره‌ی Angular، لاراول، سئو و ساخت محصول.',
      path: this.canonicalPath(),
      // Search result pages are infinite and thin: keep them out of the index.
      noindex: search !== '',
    });
  }

  protected search(event: Event, term: string): void {
    event.preventDefault();
    void this.router.navigate(['/blog'], {
      queryParams: { q: term.trim() || null, page: null },
    });
  }
}
