import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface PointerPosition {
  x: number;
  y: number;
}

/** One shared, rAF-throttled pointer listener for every spotlight card. */
@Injectable({ providedIn: 'root' })
export class PointerService {
  private readonly position = signal<PointerPosition | null>(null);
  readonly pointer = this.position.asReadonly();

  constructor() {
    const doc = inject(DOCUMENT);
    if (!isPlatformBrowser(inject(PLATFORM_ID)) || !doc.defaultView) {
      return;
    }

    const win = doc.defaultView;
    let frame = 0;
    let next: PointerPosition | null = null;

    const flush = () => {
      frame = 0;
      this.position.set(next);
    };
    const schedule = () => {
      if (!frame) {
        frame = win.requestAnimationFrame(flush);
      }
    };

    doc.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType === 'touch') {
          return;
        }
        next = { x: event.clientX, y: event.clientY };
        schedule();
      },
      { passive: true },
    );
    doc.addEventListener('pointerleave', () => {
      next = null;
      schedule();
    });
  }
}
