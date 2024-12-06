import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { DOCUMENT } from '@angular/common';
import {
  PLATFORM_ID,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';

describe('ThemeService', () => {
  let documentMock: Partial<Document>;
  let service: ThemeService;

  beforeEach(() => {
    documentMock = jasmine.createSpyObj<Document>(['defaultView']);

    const windowMock: Partial<Window & typeof globalThis> = {
      localStorage: jasmine.createSpyObj<Storage>(['getItem', 'setItem']),
      matchMedia: jasmine
        .createSpy('matchMedia')
        .and.callFake((query: string) => {
          return { matches: query === '(prefers-color-scheme: dark)' };
        }),
    };

    documentMock = {
      defaultView: windowMock as Window & typeof globalThis,
    };

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: documentMock },
        provideExperimentalZonelessChangeDetection(),
      ],
    });
  });

  it('should be created', () => {
    service = TestBed.inject(ThemeService);
    expect(service).toBeTruthy();
  });

  it('should return true if "dark" is stored in localStorage', (done) => {
    (
      documentMock.defaultView!.localStorage!.getItem as jasmine.Spy
    ).and.returnValue('dark');

    service = TestBed.inject(ThemeService);

    service.isDark$.subscribe((isDark) => {
      expect(isDark).toBeTrue();
      done();
    });
  });

  it('should return true if localStorage is empty but preferred theme is dark', (done) => {
    (
      documentMock.defaultView!.localStorage!.getItem as jasmine.Spy
    ).and.returnValue(null);

    (documentMock.defaultView!.matchMedia as jasmine.Spy).and.returnValue({
      matches: true,
    } as MediaQueryList);

    service = TestBed.inject(ThemeService);

    service.isDark$.subscribe((isDark) => {
      expect(isDark).toBeTrue();
      done();
    });
  });

  it('should return false if there is no localStorage value and no preferred theme', (done) => {
    (
      documentMock.defaultView!.localStorage!.getItem as jasmine.Spy
    ).and.returnValue(null);

    (documentMock.defaultView!.matchMedia as jasmine.Spy).and.returnValue({
      matches: false,
    } as MediaQueryList);

    service = TestBed.inject(ThemeService);

    service.isDark$.subscribe((isDark) => {
      expect(isDark).toBeFalse();
      done();
    });
  });

  it('should set the theme dark correctly', (done) => {
    service = TestBed.inject(ThemeService);

    service.setThemeDark(true);

    expect(documentMock.defaultView!.localStorage.setItem).toHaveBeenCalledWith(
      'theme',
      'dark'
    );

    service.isDark$.subscribe((isDark) => {
      expect(isDark).toBeTrue();
      done();
    });
  });

  it('should set the theme light correctly', (done) => {
    service = TestBed.inject(ThemeService);

    service.setThemeDark(false);

    expect(documentMock.defaultView!.localStorage.setItem).toHaveBeenCalledWith(
      'theme',
      'light'
    );

    service.isDark$.subscribe((isDark) => {
      expect(isDark).toBeFalse();
      done();
    });
  });
});
