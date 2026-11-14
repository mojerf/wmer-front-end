import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mb-7 flex items-end justify-between' },
  template: `
    <h2 [id]="headingId()" class="text-[clamp(1.75rem,4vw,2.875rem)] font-black tracking-[-0.03em]">
      {{ title() }}
    </h2>
    <span class="font-mono text-[0.8125rem] text-mut" dir="ltr" aria-hidden="true">{{ label() }}</span>
  `,
})
export class SectionHeadComponent {
  readonly title = input.required<string>();
  readonly label = input.required<string>();
  readonly headingId = input.required<string>();
}
