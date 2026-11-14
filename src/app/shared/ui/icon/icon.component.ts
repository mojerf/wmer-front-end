import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'moon'
  | 'sun'
  | 'arrow'
  | 'arrow-back'
  | 'github'
  | 'search'
  | 'cart'
  | 'cart-plus'
  | 'user'
  | 'user-plus'
  | 'login'
  | 'logout'
  | 'orders'
  | 'shield'
  | 'trash'
  | 'edit'
  | 'plus'
  | 'download'
  | 'check'
  | 'chevron-down'
  | 'menu'
  | 'close'
  | 'card'
  | 'reply'
  | 'briefcase'
  | 'article'
  | 'bag'
  | 'mail';

/**
 * The site's icon set: 24px line icons that take their colour from the surrounding text.
 * `arrow` points to where reading continues (left in RTL); `arrow-back` points the other way.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    @if (name() === 'github') {
      <svg class="size-[0.9375rem]" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
    } @else {
      <svg
        class="size-[1.125rem]"
        [class.-scale-x-100]="name() === 'arrow'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        @switch (name()) {
          @case ('moon') {
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          }
          @case ('sun') {
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          }
          @case ('arrow') {
            <path d="M5 12h14M13 6l6 6-6 6" />
          }
          @case ('arrow-back') {
            <path d="M19 12H5M11 6l-6 6 6 6" />
          }
          @case ('search') {
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          }
          @case ('cart') {
            <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 1.9-1.4L20.5 8H6" />
            <circle cx="9.5" cy="20" r="1" />
            <circle cx="17.5" cy="20" r="1" />
          }
          @case ('cart-plus') {
            <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 1.9-1.4L20.5 8H6" />
            <circle cx="9.5" cy="20" r="1" />
            <circle cx="17.5" cy="20" r="1" />
            <path d="M13 9v4M11 11h4" />
          }
          @case ('user') {
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
          }
          @case ('user-plus') {
            <circle cx="10" cy="8" r="4" />
            <path d="M2.5 21c0-4 3.4-6 7.5-6M18 9v6M15 12h6" />
          }
          @case ('login') {
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" />
          }
          @case ('logout') {
            <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H10" />
          }
          @case ('orders') {
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
            <path d="M9 8h6M9 12h6" />
          }
          @case ('shield') {
            <path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z" />
            <path d="m9 12 2 2 4-4" />
          }
          @case ('trash') {
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          }
          @case ('edit') {
            <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
            <path d="m13.5 6.5 4 4" />
          }
          @case ('plus') {
            <path d="M12 5v14M5 12h14" />
          }
          @case ('download') {
            <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
          }
          @case ('check') {
            <path d="m5 12.5 4.5 4.5L19 7" />
          }
          @case ('chevron-down') {
            <path d="m6 9 6 6 6-6" />
          }
          @case ('menu') {
            <path d="M4 7h16M4 12h16M4 17h16" />
          }
          @case ('close') {
            <path d="M6 6l12 12M18 6 6 18" />
          }
          @case ('card') {
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18M7 15h3" />
          }
          @case ('briefcase') {
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" />
          }
          @case ('article') {
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M14 3v5h5M9 13h7M9 17h7" />
          }
          @case ('bag') {
            <path d="M5 8h14l-1 12H6z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          }
          @case ('mail') {
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3.5 7 8.5 6 8.5-6" />
          }
          @case ('reply') {
            <path d="M10 8 4 13l6 5M4 13h9a7 7 0 0 1 7 7" />
          }
        }
      </svg>
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
