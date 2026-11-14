import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { SpotlightDirective } from '../../../shared/directives/spotlight.directive';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SectionHeadComponent } from '../../../shared/ui/section-head/section-head.component';
import { Work } from '../data-access/home.models';
import { decorAt, LIGHTHOUSE_BARS } from '../home.content';

@Component({
  selector: 'app-works-section',
  imports: [SectionHeadComponent, RevealDirective, SpotlightDirective, NgTemplateOutlet, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'wrap block pt-[5.625rem]', id: 'works' },
  template: `
    <app-section-head title="نمونه‌کارها" label="01 / WORKS" headingId="works-title" />

    <div
      class="grid auto-rows-[minmax(11.875rem,auto)] grid-cols-2 gap-[0.875rem] min-[820px]:grid-cols-6"
      aria-labelledby="works-title"
    >
      @if (featured(); as work) {
        <article appSpotlight appReveal class="card col-span-2 min-[820px]:col-span-4 min-[820px]:row-span-2">
          <a [routerLink]="['/works', work.slug]" class="absolute inset-0 z-10" [attr.aria-label]="work.title"></a>
          <ng-container *ngTemplateOutlet="thumb; context: { $implicit: work, index: 0 }" />
          <h3 class="text-[1.1875rem] font-bold">{{ work.title }}</h3>
          <div class="flex flex-wrap gap-y-2 pt-1.5">
            @for (tag of work.tags; track tag) {
              <span class="me-1.5 mt-2.5 rounded-full border border-line px-2.5 font-mono text-[0.6875rem] text-mut">{{ tag }}</span>
            }
          </div>
        </article>
      }

      <article appSpotlight [appReveal]="90" class="card col-span-2 justify-between">
        <small class="text-[0.8125rem] text-mut">امتیاز Lighthouse</small>
        <div class="text-[clamp(3.5rem,6vw,4.5rem)] leading-[1.1] font-black tracking-[-0.05em]">98</div>
        <div class="flex h-11 items-end gap-[0.3125rem]" dir="ltr" aria-hidden="true">
          @for (h of bars; track $index) {
            <i
              class="bar-i flex-1 origin-bottom rounded-[0.25rem] bg-linear-to-b from-aqua to-iris transition-[scale] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)]"
              [style.height.%]="h"
              [style.transition-delay]="$index * 60 + 300 + 'ms'"
            ></i>
          }
        </div>
      </article>

      <article appSpotlight [appReveal]="180" class="card col-span-2">
        <pre
          dir="ltr"
          class="m-0 flex-1 content-center font-mono text-[0.78rem] leading-[1.9] whitespace-pre text-mut"
          aria-label="نمونه کد"
        ><span class="text-rose">const</span> app = <span class="text-aqua">signal</span>(<span class="text-lime-400">'fast'</span>)
<span class="text-rose">const</span> safe = <span class="text-aqua">computed</span>(() =&gt;
  app() + <span class="text-lime-400">' &amp; secure'</span>)<span class="inline-block h-[0.9375rem] w-2 animate-blink bg-aqua align-[-0.1875rem]"></span></pre>
      </article>

      @for (work of others(); track work.id; let i = $index) {
        <article appSpotlight [appReveal]="i * 90" class="card col-span-2">
          <a [routerLink]="['/works', work.slug]" class="absolute inset-0 z-10" [attr.aria-label]="work.title"></a>
          <ng-container *ngTemplateOutlet="thumb; context: { $implicit: work, index: i + 1 }" />
          <h3 class="text-[1.1875rem] font-bold">{{ work.title }}</h3>
          <p class="text-[0.875rem] text-mut">{{ work.tags.join('، ') }}</p>
        </article>
      }

      <article appSpotlight [appReveal]="180" class="card col-span-2">
        <div
          class="-mx-1.5 -mt-1.5 mb-4 grid min-h-[6.875rem] flex-1 place-items-center rounded-2xl bg-bg-2 text-[3.5rem] font-black tracking-[-0.05em]"
          aria-hidden="true"
        >
          ۵+
        </div>
        <h3 class="text-[1.1875rem] font-bold">سال تجربه</h3>
        <p class="text-[0.875rem] text-mut">ساخت محصول از ایده تا اجرا.</p>
      </article>
    </div>

    <a routerLink="/works" class="btn mt-6">همه‌ی نمونه‌کارها <app-icon name="arrow" /></a>

    <ng-template #thumb let-work let-index="index">
      <div
        class="-mx-1.5 -mt-1.5 mb-4 grid min-h-[6.875rem] flex-1 place-items-center overflow-hidden rounded-2xl text-[2.75rem]"
        [class]="work.imageUrl ? 'bg-bg-2' : decor(index).gradient"
      >
        @if (work.imageUrl) {
          <img [src]="work.imageUrl" [alt]="work.title" loading="lazy" class="size-full object-cover" />
        } @else {
          <span aria-hidden="true">{{ decor(index).glyph }}</span>
        }
      </div>
    </ng-template>
  `,
})
export class WorksSectionComponent {
  readonly works = input.required<readonly Work[]>();

  protected readonly featured = computed(() => this.works()[0]);
  protected readonly others = computed(() => this.works().slice(1, 3));
  protected readonly bars = LIGHTHOUSE_BARS;
  protected readonly decor = decorAt;
}
