import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private isDark = new BehaviorSubject(true);
  isDark$ = this.isDark.asObservable();

  constructor() {
    const isDark = this.getTheme();
    this.isDark.next(isDark);
  }

  private getTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const localStorage = this.document.defaultView?.localStorage;
      if (localStorage) {
        const theme = localStorage.getItem('theme');
        if (theme) {
          return theme === 'dark';
        }
      }
      const window = this.document.defaultView;
      if (window) {
        const browserDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        return browserDark;
      }
    }
    return true;
  }

  setTheme(isDark: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    this.isDark.next(isDark);
  }
}
