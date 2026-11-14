import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject, Injectable } from '@angular/core';
import { PointerService } from './pointer.service';

/** How far (in rem) around a card the glow still reaches. */
const REACH_REM = 15;

/**
 * Drives every spotlight card from one place. Per pointer frame it reads all the visible cards' rectangles
 * first and writes their styles afterwards (no layout thrashing), and it skips cards that are off screen.
 */
@Injectable({ providedIn: 'root' })
export class SpotlightService {
  private readonly pointer = inject(PointerService).pointer;
  private readonly visible = new Set<HTMLElement>();
  private observer: IntersectionObserver | undefined;

  constructor() {
    effect(() => this.update(this.pointer()));
  }

  /** Starts driving a card; returns the function that stops it. */
  register(el: HTMLElement): () => void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.add(el);
      return () => this.visible.delete(el);
    }

    this.observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            this.visible.add(target);
          } else {
            this.visible.delete(target);
          }
        }
      },
      // The glow reaches past a card's edge, so cards just outside the viewport still count.
      { rootMargin: '240px' },
    );

    this.observer.observe(el);
    return () => {
      this.observer?.unobserve(el);
      this.visible.delete(el);
    };
  }

  private update(p: { x: number; y: number } | null): void {
    if (this.visible.size === 0) {
      return;
    }

    const cards = [...this.visible];

    if (!p) {
      for (const el of cards) {
        el.style.setProperty('--o', '0');
      }
      return;
    }

    const doc = cards[0]!.ownerDocument;
    const rem = parseFloat(getComputedStyle(doc.documentElement).fontSize) || 16;
    const reach = REACH_REM * rem;

    // Read phase
    const rects = cards.map((el) => el.getBoundingClientRect());

    // Write phase
    cards.forEach((el, i) => {
      const r = rects[i]!;
      const dx = Math.max(r.left - p.x, 0, p.x - r.right);
      const dy = Math.max(r.top - p.y, 0, p.y - r.bottom);
      const distance = Math.hypot(dx, dy);

      el.style.setProperty('--mx', `${p.x - r.left}px`);
      el.style.setProperty('--my', `${p.y - r.top}px`);
      el.style.setProperty('--o', distance === 0 ? '1' : String(Math.max(0, 1 - distance / reach) * 0.45));
    });
  }
}

/**
 * Lights up a card with a glow that follows the pointer. Inside the card it is full strength,
 * and it fades out over ~15rem around the card so nearby cards react too.
 */
@Directive({
  selector: '[appSpotlight]',
  host: { class: 'spot' },
})
export class SpotlightDirective {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const service = inject(SpotlightService);
    const destroyRef = inject(DestroyRef);

    // Browser only: there is no pointer (and no IntersectionObserver) during server rendering.
    afterNextRender(() => destroyRef.onDestroy(service.register(el)));
  }
}
