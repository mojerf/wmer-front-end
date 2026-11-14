import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

export interface ThemeOrigin {
  x: number;
  y: number;
}

/**
 * Light/dark theme. The initial class on <html> is set before first paint by
 * public/theme-init.js, so this service only mirrors and changes it.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly dark = signal(true);
  readonly isDark = this.dark.asReadonly();

  constructor() {
    if (this.isBrowser) {
      this.dark.set(this.doc.documentElement.classList.contains('dark'));
    }
  }

  toggle(origin?: ThemeOrigin): void {
    const next = !this.dark();
    const apply = () => this.apply(next);

    const root = this.doc.documentElement;
    const start = (
      this.doc as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition?.bind(this.doc);

    if (!this.isBrowser || !start || !origin) {
      apply();
      return;
    }

    root.style.setProperty('--vt-x', `${origin.x}px`);
    root.style.setProperty('--vt-y', `${origin.y}px`);
    start(apply);
  }

  private apply(isDark: boolean): void {
    this.doc.documentElement.classList.toggle('dark', isDark);
    this.dark.set(isDark);

    try {
      this.doc.defaultView?.localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      /* storage can be blocked; the theme still applies for this visit */
    }

    this.doc
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0b0b10' : '#f6f5f1');
  }
}
