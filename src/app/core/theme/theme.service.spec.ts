import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let doc: Document;

  beforeEach(() => {
    localStorage.clear();
    doc = TestBed.inject(DOCUMENT);
    doc.documentElement.classList.remove('dark');
  });

  it('mirrors the class set before first paint', () => {
    doc.documentElement.classList.add('dark');
    expect(TestBed.inject(ThemeService).isDark()).toBe(true);
  });

  it('starts light when <html> has no dark class', () => {
    expect(TestBed.inject(ThemeService).isDark()).toBe(false);
  });

  it('toggles the class, the signal and the stored value', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    expect(service.isDark()).toBe(true);
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    service.toggle();
    expect(service.isDark()).toBe(false);
    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
