import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-theme-switch',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="theme.isDark()"
      aria-label="حالت تاریک"
      (click)="toggle($event)"
      class="relative grid h-9 w-[4.75rem] cursor-pointer grid-cols-2 rounded-full border border-line bg-bg-2 p-[0.1875rem]"
    >
      <span
        aria-hidden="true"
        class="absolute inset-y-[0.1875rem] start-1/2 w-[calc(50%-0.1875rem)] rounded-full bg-fg transition-[inset-inline-start] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] dark:start-[0.1875rem]"
      ></span>
      <span class="relative grid place-items-center text-mut transition-colors duration-300 dark:text-bg">
        <app-icon name="moon" />
      </span>
      <span class="relative grid place-items-center text-bg transition-colors duration-300 dark:text-mut">
        <app-icon name="sun" />
      </span>
    </button>
  `,
})
export class ThemeSwitchComponent {
  protected readonly theme = inject(ThemeService);

  protected toggle(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.theme.toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }
}
