import { Directive, effect, ElementRef, inject } from '@angular/core';
import { PointerService } from './pointer.service';

/**
 * Lights up a card with a glow that follows the pointer. Inside the card it is full strength,
 * and it fades out over ~15rem around the card so nearby cards react too.
 */
@Directive({
  selector: '[appSpotlight]',
  host: { class: 'spot' },
})
export class SpotlightDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly pointer = inject(PointerService).pointer;

  constructor() {
    effect(() => {
      const p = this.pointer();
      const style = this.el.style;

      if (!p) {
        style.setProperty('--o', '0');
        return;
      }

      const r = this.el.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(this.el.ownerDocument.documentElement).fontSize) || 16;
      const dx = Math.max(r.left - p.x, 0, p.x - r.right);
      const dy = Math.max(r.top - p.y, 0, p.y - r.bottom);
      const distance = Math.hypot(dx, dy);
      const reach = 15 * rem;

      style.setProperty('--mx', `${p.x - r.left}px`);
      style.setProperty('--my', `${p.y - r.top}px`);
      style.setProperty('--o', distance === 0 ? '1' : String(Math.max(0, 1 - distance / reach) * 0.45));
    });
  }
}
