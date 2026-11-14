import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { WorkDetail } from './data-access/works.models';
import { WorksListData } from './data-access/works.resolvers';
import { WorkPageComponent } from './work-page.component';
import { WorksListPageComponent } from './works-list-page.component';

const work: WorkDetail = {
  id: 1,
  title: 'پنل فروش',
  slug: 'sales-dashboard',
  imageUrl: null,
  fullImageUrl: null,
  tags: ['Angular', 'Laravel'],
  publishedAt: '2026-01-01T00:00:00+00:00',
  updatedAt: '2026-01-02T00:00:00+00:00',
  timeline: 'بهار تا تابستان',
  publishDate: 'تابستان',
  role: 'توسعه‌دهنده',
  projectLink: 'https://example.com/p',
  overview: 'خلاصه',
  learn: 'درس‌ها',
  description: 'توضیح\n\n<script>alert(1)</script>',
};

const robots = () =>
  TestBed.inject(DOCUMENT).querySelector('meta[name="robots"]')?.getAttribute('content');

describe('WorkPageComponent', () => {
  it('renders the details as text, links tags to the filtered list and sets CreativeWork data', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPageComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkPageComponent);
    fixture.componentRef.setInput('work', work);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const doc = TestBed.inject(DOCUMENT);

    expect(el.querySelector('h1')?.textContent).toContain('پنل فروش');
    expect(el.textContent).toContain('توسعه‌دهنده');
    expect(el.querySelector('script')).toBeNull();
    expect(el.textContent).toContain('<script>alert(1)</script>');
    expect([...el.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toContain('/works?tag=Angular');
    expect(el.querySelector('a[target="_blank"]')?.getAttribute('href')).toBe('https://example.com/p');

    const types = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => (JSON.parse(s.textContent ?? '{}') as { '@type': string })['@type'],
    );
    expect(types).toEqual(['CreativeWork', 'BreadcrumbList']);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://site.test/works/sales-dashboard',
    );
  });
});

describe('WorksListPageComponent', () => {
  const create = async (data: WorksListData) => {
    await TestBed.configureTestingModule({
      imports: [WorksListPageComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorksListPageComponent);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('lists works as links and paginates', async () => {
    const el = await create({
      search: '',
      tag: '',
      works: { items: [work], page: 2, lastPage: 3, total: 25 },
    });

    expect(el.querySelector('article a')?.getAttribute('href')).toBe('/works/sales-dashboard');
    expect(el.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/works');
    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/works?page=3');
    expect(robots()).toContain('index');
  });

  it('keeps filtered views out of the index and keeps the filter in pagination links', async () => {
    const el = await create({
      search: '',
      tag: 'Angular',
      works: { items: [work], page: 1, lastPage: 2, total: 13 },
    });

    expect(el.textContent).toContain('با برچسب «Angular»');
    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/works?tag=Angular&page=2');
    expect(robots()).toBe('noindex, nofollow');
  });
});
