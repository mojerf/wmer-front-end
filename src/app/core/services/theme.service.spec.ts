import { DOCUMENT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const getItem = vi.fn<(key: string) => string | null>();
  const setItem = vi.fn();
  const matchMedia = vi.fn();

  const create = () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: { localStorage: { getItem, setItem }, matchMedia },
          },
        },
      ],
    });
    return TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    getItem.mockReset().mockReturnValue(null);
    setItem.mockReset();
    matchMedia.mockReset().mockReturnValue({ matches: false });
  });

  it('should be created', () => {
    expect(create()).toBeTruthy();
  });

  it('uses the stored "dark" theme', async () => {
    getItem.mockReturnValue('dark');
    expect(await firstValueFrom(create().isDark$)).toBe(true);
  });

  it('falls back to the system preference when nothing is stored', async () => {
    matchMedia.mockReturnValue({ matches: true });
    expect(await firstValueFrom(create().isDark$)).toBe(true);
  });

  it('is light with no stored value and no dark preference', async () => {
    expect(await firstValueFrom(create().isDark$)).toBe(false);
  });

  it('stores and emits dark', async () => {
    const service = create();
    service.setThemeDark(true);
    expect(setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(await firstValueFrom(service.isDark$)).toBe(true);
  });

  it('stores and emits light', async () => {
    const service = create();
    service.setThemeDark(false);
    expect(setItem).toHaveBeenCalledWith('theme', 'light');
    expect(await firstValueFrom(service.isDark$)).toBe(false);
  });
});
