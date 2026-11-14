import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeSwitchComponent } from './theme-switch.component';

describe('ThemeSwitchComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.inject(DOCUMENT).documentElement.classList.add('dark');
  });

  it('exposes the current state and flips it on click', async () => {
    const fixture = TestBed.createComponent(ThemeSwitchComponent);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    expect(button.getAttribute('role')).toBe('switch');
    expect(button.getAttribute('aria-checked')).toBe('true');

    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(button.getAttribute('aria-checked')).toBe('false');
  });
});
