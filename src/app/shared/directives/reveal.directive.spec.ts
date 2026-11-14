import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  afterEach(() => vi.unstubAllGlobals());

  it('shows an element once the shared observer reports it visible', async () => {
    let report: IntersectionObserverCallback | undefined;
    const observed: Element[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          report ??= callback;
        }
        observe(el: Element): void {
          observed.push(el);
        }
        unobserve(): void {
          // nothing to release in the fake
        }
        disconnect(): void {
          // nothing to release in the fake
        }
      },
    );

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const bare = el.querySelector('#bare') as HTMLElement;

    expect(observed).toContain(bare);
    expect(bare.classList.contains('in')).toBe(false);

    report?.([{ target: bare, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    fixture.detectChanges();
    expect(bare.classList.contains('in')).toBe(true);
    expect(el.querySelector('#delayed')!.classList.contains('in')).toBe(false);
  });
});
