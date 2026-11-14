import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PointerService } from './pointer.service';
import { SpotlightDirective } from './spotlight.directive';

@Component({ imports: [SpotlightDirective], template: `<div id="card" appSpotlight></div>` })
class HostComponent {}

/** Fires every observed element as visible as soon as it is observed. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(target: Element): void {
    this.callback([{ target, isIntersecting: true } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve(): void {
          // nothing to release in the fake
        }
  disconnect(): void {
          // nothing to release in the fake
        }
}

describe('SpotlightDirective', () => {
  const pointer = signal<{ x: number; y: number } | null>(null);

  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    TestBed.configureTestingModule({ providers: [{ provide: PointerService, useValue: { pointer } }] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    pointer.set(null);
  });

  it('lights a card up fully under the pointer and not at all when the pointer leaves', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const card = fixture.nativeElement.querySelector('#card') as HTMLElement;
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 } as DOMRect);

    pointer.set({ x: 30, y: 40 });
    TestBed.tick();
    expect(card.style.getPropertyValue('--o')).toBe('1');
    expect(card.style.getPropertyValue('--mx')).toBe('30px');
    expect(card.style.getPropertyValue('--my')).toBe('40px');

    pointer.set(null);
    TestBed.tick();
    expect(card.style.getPropertyValue('--o')).toBe('0');
  });
});
