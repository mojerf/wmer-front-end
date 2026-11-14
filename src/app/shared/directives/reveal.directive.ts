import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

/** Fades and slides an element in when it scrolls into view. Hidden state only exists with JS (see styles.css). */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.in]': 'shown()',
    '[style.--d]': '(delay() / 1000) + "s"',
  },
})
export class RevealDirective {
  /** Extra delay in milliseconds, for staggering siblings. */
  readonly delay = input(0, {
    alias: 'appReveal',
    transform: (value: unknown): number => {
      const ms = Number(value);
      return value === '' || !Number.isFinite(ms) ? 0 : ms;
    },
  });

  protected readonly shown = signal(false);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.shown.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.shown.set(true);
            observer.disconnect();
          }
        },
        { threshold: 0.12 },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
