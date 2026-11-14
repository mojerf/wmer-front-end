import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A labelled form control with its validation message. The control itself is projected. */
@Component({
  selector: 'app-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <!-- The control is projected into the label, which the lint rule cannot see. -->
    <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
    <label class="grid gap-1.5 text-[0.875rem]">
      <span class="text-mut">{{ label() }}</span>
      <ng-content />
      @if (error()) {
        <span role="alert" class="text-[0.8125rem] text-rose">{{ error() }}</span>
      }
    </label>
  `,
})
export class FieldComponent {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
}
