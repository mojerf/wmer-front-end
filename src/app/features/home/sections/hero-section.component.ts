import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

interface Word {
  text: string;
  accent: boolean;
}

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative isolate -mt-[4.375rem] block overflow-clip pt-[4.375rem]' },
  template: `
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(#000_60%,transparent)]"
    >
      <div class="absolute -top-40 -right-40 size-[45rem] animate-float rounded-full bg-[radial-gradient(closest-side,var(--color-iris),transparent)] opacity-(--glow) will-change-transform"></div>
      <div class="absolute top-0 -left-40 size-[36rem] animate-float rounded-full bg-[radial-gradient(closest-side,var(--color-aqua),transparent)] opacity-(--glow) will-change-transform [animation-delay:-5s]"></div>
      <div class="absolute -bottom-24 right-[28%] size-[28rem] animate-float rounded-full bg-[radial-gradient(closest-side,var(--color-rose),transparent)] opacity-(--glow) will-change-transform [animation-delay:-9s]"></div>
    </div>

    <div
      class="wrap grid items-center gap-10 py-[clamp(3rem,9vw,6.875rem)] min-[1100px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
    >
      <div>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-line bg-card/60 px-3.5 py-[0.3125rem] text-[0.8125rem] text-mut"
        >
          <b class="size-2 animate-ping-soft rounded-full bg-emerald-400 shadow-[0_0_0_0_rgb(52_211_153/0.5)]"></b>
          آماده‌ی همکاری روی پروژه‌های جدید
        </span>

        <h1
          class="my-[1.375rem] text-[clamp(2.125rem,5.6vw,4.5rem)] leading-[1.3] font-black tracking-[-0.03em] text-balance"
        >
          @for (word of words; track $index) {
            <span
              class="word"
              [class.text-shimmer]="word.accent"
              [style.--wd]="$index * 70 + 100 + 'ms'"
              >{{ word.text }}</span
            >
            {{ ' ' }}
          }
        </h1>

        <p class="max-w-[35rem] text-[clamp(1rem,2vw,1.25rem)] text-mut">
          من مجتبی‌ام؛ طراح و برنامه‌نویس وب. از رابط کاربری تا بک‌اند، همه‌چیز را با آخرین
          تکنولوژی‌ها می‌سازم.
        </p>

        <div class="mt-[1.875rem] flex flex-wrap gap-3">
          <a class="btn btn-main" routerLink="/" fragment="works">
            دیدن کارها <app-icon name="arrow" />
          </a>
          <a class="btn" routerLink="/" fragment="contact">گفت‌وگو</a>
        </div>
      </div>

      <div
        dir="ltr"
        aria-hidden="true"
        class="hidden -rotate-2 animate-bob overflow-hidden rounded-[1.375rem] border border-line bg-card/70 font-mono text-[0.8125rem] text-mut backdrop-blur-md min-[1100px]:block"
      >
        <div class="flex gap-[0.4375rem] border-b border-line px-3.5 py-3">
          <i class="size-2.5 rounded-full bg-[#ff5f57]"></i>
          <i class="size-2.5 rounded-full bg-[#febc2e]"></i>
          <i class="size-2.5 rounded-full bg-[#28c840]"></i>
        </div>
        <pre class="px-[1.125rem] py-4 leading-[2] whitespace-pre-wrap"><span class="text-aqua">~/wmer</span> $ ng build
<span class="text-emerald-400">✔</span> Prerendered 6 routes
<span class="text-emerald-400">✔</span> Lighthouse 98 / 100
<span class="text-aqua">~/wmer</span> $ php artisan test
<span class="text-emerald-400">✔</span> 42 passed
<span class="text-aqua">~/wmer</span> $ <span class="inline-block h-[0.9375rem] w-2 animate-blink bg-aqua align-[-0.1875rem]"></span></pre>
      </div>
    </div>
  `,
})
export class HeroSectionComponent {
  protected readonly words: readonly Word[] = [
    { text: 'وب‌اپلیکیشن‌هایی', accent: false },
    { text: 'که', accent: false },
    { text: 'سریع، امن', accent: true },
    { text: 'و', accent: false },
    { text: 'دیدنی‌اند.', accent: false },
  ];
}
