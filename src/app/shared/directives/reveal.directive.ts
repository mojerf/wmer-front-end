import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * One IntersectionObserver serves every revealed element on the page (a list page has dozens),
 * instead of one observer per element.
 */
const callbacks = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | undefined;

function watch(el: Element, onVisible: () => void): () => void {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const callback = callbacks.get(entry.target);
          sharedObserver?.unobserve(entry.target);
          callbacks.delete(entry.target);
          callback?.();
        }
      }
    },
    { threshold: 0.12 },
  );

  callbacks.set(el, onVisible);
  sharedObserver.observe(el);

  return () => {
    callbacks.delete(el);
    sharedObserver?.unobserve(el);
  };
}

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
      destroyRef.onDestroy(watch(el, () => this.shown.set(true)));
    });
  }
}
