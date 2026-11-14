import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig, TEST_CONFIG } from '../../../testing/test-providers';
import { SITE } from '../../core/config/site.config';
import { HomeContent } from './data-access/home.models';
import { HomePageComponent } from './home-page.component';

const content: HomeContent = {
  works: [
    { id: 1, title: 'کار یک', slug: 'one', imageUrl: null, tags: ['A', 'B'] },
    { id: 2, title: 'کار دو', slug: 'two', imageUrl: null, tags: [] },
  ],
  posts: [
    { id: 1, title: 'پست یک', slug: 'p1', imageUrl: null, publishedAt: '2026-01-01T00:00:00Z', commentsCount: 0 },
  ],
  products: [
    { id: 1, title: 'محصول یک', slug: 'x', imageUrl: null, price: 1000, oldPrice: 2000 },
  ],
};

describe('HomePageComponent', () => {
  it('renders every section from the resolved content and sets SEO tags', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const doc = TestBed.inject(DOCUMENT);

    for (const id of ['works', 'blog', 'shop', 'contact']) {
      expect(el.querySelector(`#${id}`), id).toBeTruthy();
    }
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.textContent).toContain('کار یک');
    expect(el.textContent).toContain('پست یک');
    expect(el.textContent).toContain('محصول یک');

    expect(doc.title).toBe(SITE.title);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${TEST_CONFIG.siteUrl}/`,
    );
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('index');

    const types = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => (JSON.parse(s.textContent ?? '{}') as { '@type': string })['@type'],
    );
    expect(types).toEqual(['Person', 'WebSite']);
  });
});
