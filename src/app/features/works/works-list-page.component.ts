import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../shared/directives/spotlight.directive';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorksListData } from './data-access/works.resolvers';

@Component({
  selector: 'app-works-list-page',
  imports: [RouterLink, RevealDirective, SpotlightDirective, FaNumberPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap pt-[3.5rem] pb-8">
      <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-[1.3] font-black tracking-[-0.03em]">
        <span class="text-shimmer">نمونه‌کارها</span>
      </h1>
      <p class="mt-2 max-w-[34rem] text-mut">پروژه‌هایی که ساخته‌ام؛ از داشبورد و فروشگاه تا PWA.</p>

      <form class="mt-6 flex max-w-[34rem] gap-2" role="search" (submit)="search($event, field.value)">
        <input
          #field
          type="search"
          name="q"
          [value]="data().search"
          maxlength="100"
          placeholder="جست‌وجو در نمونه‌کارها…"
          aria-label="جست‌وجو در نمونه‌کارها"
          class="input-field flex-1"
        />
        <button type="submit" class="btn btn-main cursor-pointer">جست‌وجو</button>
      </form>

      @if (data().search || data().tag) {
        <p class="mt-4 text-[0.875rem] text-mut">
          {{ data().works.total | faNumber }} نتیجه
          @if (data().search) { برای «{{ data().search }}» }
          @if (data().tag) { با برچسب «{{ data().tag }}» }
          · <a routerLink="/works" class="text-aqua underline-offset-4 hover:underline">پاک کردن فیلتر</a>
        </p>
      }
    </section>

    <section class="wrap pb-8" aria-label="فهرست نمونه‌کارها">
      @if (data().works.items.length) {
        <div class="grid gap-[0.875rem] sm:grid-cols-2 lg:grid-cols-3">
          @for (work of data().works.items; track work.id; let i = $index) {
            <article appSpotlight [appReveal]="(i % 3) * 90" class="card">
              <a [routerLink]="['/works', work.slug]" class="absolute inset-0 z-10" [attr.aria-label]="work.title"></a>
              <div
                class="-mx-1.5 -mt-1.5 mb-4 grid h-[9rem] place-items-center overflow-hidden rounded-2xl text-[2.5rem]"
                [class]="work.imageUrl ? 'bg-bg-2' : fallbackGradient"
              >
                @if (work.imageUrl) {
                  <img [src]="work.thumbUrl ?? work.imageUrl" [alt]="work.title" loading="lazy" decoding="async" class="size-full object-cover" />
                } @else {
                  <span aria-hidden="true">⌘</span>
                }
              </div>
              <h2 class="text-[1.125rem] leading-[1.7] font-bold">{{ work.title }}</h2>
              <p class="mt-auto flex flex-wrap gap-1.5 pt-3">
                @for (tag of work.tags; track tag) {
                  <span class="rounded-full border border-line px-2.5 font-mono text-[0.6875rem] text-mut">{{ tag }}</span>
                }
              </p>
            </article>
          }
        </div>

        @if (data().works.lastPage > 1) {
          <nav class="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
            @if (data().works.page > 1) {
              <a class="btn" routerLink="/works" [queryParams]="pageParams(data().works.page - 1)" rel="prev">قبلی</a>
            }
            <span class="text-[0.875rem] text-mut">
              صفحه‌ی {{ data().works.page | faNumber }} از {{ data().works.lastPage | faNumber }}
            </span>
            @if (data().works.page < data().works.lastPage) {
              <a class="btn" routerLink="/works" [queryParams]="pageParams(data().works.page + 1)" rel="next">
                بعدی <app-icon name="arrow" />
              </a>
            }
          </nav>
        }
      } @else {
        <p class="rounded-[1.25rem] border border-line bg-card p-8 text-center text-mut">نمونه‌کاری پیدا نشد.</p>
      }
    </section>
  `,
})
export class WorksListPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly data = input.required<WorksListData>();

  private readonly router = inject(Router);

  protected readonly fallbackGradient = 'bg-[linear-gradient(135deg,#4c1d95,#7c5cff_60%,#22d3ee)]';

  protected readonly pageParams = (page: number) => ({
    q: this.data().search || null,
    tag: this.data().tag || null,
    page: page > 1 ? page : null,
  });

  private readonly canonicalPath = computed(() => {
    const { page } = this.data().works;
    return page > 1 ? `/works?page=${page}` : '/works';
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const { search, tag, works } = this.data();
      const suffix = works.page > 1 ? ` — صفحه‌ی ${works.page}` : '';

      seo.set({
        title: `نمونه‌کارها${suffix} | ${SITE.name}`,
        description: 'پروژه‌هایی که با Angular و Laravel ساخته‌ام: داشبورد، فروشگاه، PWA و سامانه‌های مدیریت محتوا.',
        path: this.canonicalPath(),
        noindex: search !== '' || tag !== '',
      });
    });
  }

  protected search(event: Event, term: string): void {
    event.preventDefault();
    void this.router.navigate(['/works'], {
      queryParams: { q: term.trim() || null, tag: this.data().tag || null, page: null },
    });
  }
}
