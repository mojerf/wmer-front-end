import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TECH } from '../home.content';

/**
 * Two identical groups, each at least one viewport wide and each sliding by exactly its own
 * width, so the loop never jumps or leaves a gap.
 */
@Component({
  selector: 'app-tech-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative z-[1] block overflow-hidden border-y border-line bg-bg/60 py-2.5 leading-none [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]',
    dir: 'ltr',
    'aria-hidden': 'true',
  },
  template: `
    <div class="flex w-max">
      @for (group of groups; track group) {
        <div
          class="flex min-w-screen shrink-0 animate-marquee items-center justify-around gap-10 pe-10 font-mono text-[0.875rem] text-mut"
        >
          @for (item of items; track $index) {
            <span class="flex items-center gap-10">
              <span class="text-[0.625rem] text-iris">✦</span>{{ item }}
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class TechMarqueeComponent {
  protected readonly groups = [0, 1];
  protected readonly items = [...TECH, ...TECH];
}
