import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-contact-section',
  imports: [RevealDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'wrap block pt-[5.625rem]', id: 'contact' },
  template: `
    <div
      appReveal
      class="rounded-[2.25rem] border border-line bg-card bg-[radial-gradient(37.5rem_circle_at_50%_0,color-mix(in_srgb,var(--iris)_35%,transparent),transparent_70%)] px-8 py-14 text-center"
    >
      <h2 class="text-[clamp(1.875rem,5vw,3.75rem)] font-black tracking-[-0.03em]">
        بیایید چیز <span class="text-aqua">خوبی</span> بسازیم.
      </h2>
      <p class="mx-auto mt-3.5 mb-7 max-w-[35rem] text-[clamp(1rem,2vw,1.25rem)] text-mut">
        پروژه‌ات را برایم بنویس؛ معمولاً همان روز جواب می‌دهم.
      </p>
      <button type="button" class="btn btn-main cursor-pointer">
        ارسال پیام <app-icon name="arrow" />
      </button>
    </div>
  `,
})
export class ContactSectionComponent {}
