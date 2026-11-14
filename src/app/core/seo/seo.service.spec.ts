import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('sets canonical and indexable robots for normal pages', () => {
    TestBed.configureTestingModule({ providers: provideTestConfig() });
    const doc = TestBed.inject(DOCUMENT);

    TestBed.inject(SeoService).set({ title: 'T', description: 'D', path: '/x' });

    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://site.test/x',
    );
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('index,');
  });

  it('marks noindex pages without a canonical link', () => {
    TestBed.configureTestingModule({ providers: provideTestConfig() });
    const doc = TestBed.inject(DOCUMENT);
    const seo = TestBed.inject(SeoService);

    seo.set({ title: 'T', description: 'D', path: '/x' });
    seo.set({ title: '404', description: 'D', noindex: true });

    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });

  it('escapes "<" in JSON-LD so it cannot close the script tag', () => {
    TestBed.configureTestingModule({ providers: provideTestConfig() });
    const doc = TestBed.inject(DOCUMENT);

    TestBed.inject(SeoService).set({
      title: 'T',
      description: 'D',
      jsonLd: [{ name: '</script><b>' }],
    });

    const ld = doc.querySelector('script[data-seo="jsonld"]')!.textContent!;
    expect(ld).not.toContain('</script>');
    expect(JSON.parse(ld)).toEqual({ name: '</script><b>' });
  });
});
