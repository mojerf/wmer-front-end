import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private isDark = new BehaviorSubject(false);
  isDark$ = this.isDark.asObservable();

  constructor() {
    const isDark = this.getTheme();
    this.isDark.next(isDark);
  }

  private getTheme(): boolean {
    const localStorageColor = this.getLocalStorageColor();
    if (typeof localStorageColor !== 'undefined') {
      return localStorageColor;
    }
    const systemColor = this.getSystemColor();
    if (typeof systemColor !== 'undefined') {
      return systemColor;
    }
    return false;
  }

  private getLocalStorageColor(): boolean | undefined {
    if (isPlatformBrowser(this.platformId)) {
      const localStorage = this.document.defaultView?.localStorage;
      if (localStorage) {
        const theme = localStorage.getItem('theme');
        if (theme) {
          return theme === 'dark';
        }
      }
    }
    return undefined;
  }

  private getSystemColor(): boolean | undefined {
    if (isPlatformBrowser(this.platformId)) {
      const window = this.document.defaultView;
      if (window) {
        const browserDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        return browserDark;
      }
    }
    return undefined;
  }

  setThemeDark(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      const localStorage = this.document.defaultView?.localStorage;
      localStorage?.setItem('theme', isDark ? 'dark' : 'light');
    }
    this.isDark.next(isDark);
  }
}
