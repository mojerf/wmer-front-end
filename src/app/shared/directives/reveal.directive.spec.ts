import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RevealDirective } from './reveal.directive';

@Component({
  imports: [RevealDirective],
  template: `
    <div id="bare" appReveal></div>
    <div id="delayed" [appReveal]="180"></div>
  `,
})
class HostComponent {}

describe('RevealDirective', () => {
  it('treats a bare attribute as no delay (never NaN) and keeps numeric delays', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect((el.querySelector('#bare') as HTMLElement).style.getPropertyValue('--d')).toBe('0s');
    expect((el.querySelector('#delayed') as HTMLElement).style.getPropertyValue('--d')).toBe('0.18s');
    expect(el.querySelector('#bare')!.classList.contains('reveal')).toBe(true);
  });
});
