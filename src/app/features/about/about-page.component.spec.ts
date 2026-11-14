import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { AboutPageComponent } from './about-page.component';

describe('AboutPageComponent', () => {
  it('renders the skills, links to contact and sets canonical + AboutPage data', async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPageComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();

    const fixture = TestBed.createComponent(AboutPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const doc = TestBed.inject(DOCUMENT);

    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.textContent).toContain('Angular');
    expect(el.querySelector('a[href="/contact"]')).toBeTruthy();
    expect(el.querySelector('a[target="_blank"]')?.getAttribute('rel')).toContain('noopener');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://site.test/about');
    expect(doc.querySelector('script[type="application/ld+json"]')?.textContent).toContain('AboutPage');
  });
});
