import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { BlogListPageComponent } from './blog-list-page.component';
import { BlogListData } from './data-access/blog.resolvers';

const post = (id: number) => ({
  id,
  title: `نوشته ${id}`,
  slug: `post-${id}`,
  imageUrl: null,
  publishedAt: '2026-01-01T00:00:00+00:00',
  commentsCount: id,
});

const create = async (data: BlogListData) => {
  await TestBed.configureTestingModule({
    imports: [BlogListPageComponent],
    providers: [provideRouter([]), ...provideTestConfig()],
  }).compileComponents();
  const fixture = TestBed.createComponent(BlogListPageComponent);
  fixture.componentRef.setInput('data', data);
  fixture.detectChanges();
  return fixture;
};

describe('BlogListPageComponent', () => {
  it('lists posts as links to their pages and paginates', async () => {
    const fixture = await create({
      search: '',
      posts: { items: [post(1), post(2)], page: 2, lastPage: 3, total: 30 },
    });
    const el = fixture.nativeElement as HTMLElement;

    const hrefs = [...el.querySelectorAll('article a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/blog/post-1', '/blog/post-2']);
    expect(el.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/blog');
    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/blog?page=3');

    const doc = TestBed.inject(DOCUMENT);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://site.test/blog?page=2',
    );
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('index');
  });

  it('keeps search results out of the index and shows an empty state', async () => {
    const fixture = await create({
      search: 'angular',
      posts: { items: [], page: 1, lastPage: 1, total: 0 },
    });
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('نوشته‌ای پیدا نشد');
    expect(el.querySelector('nav[aria-label="صفحه‌بندی"]')).toBeNull();
    expect(
      TestBed.inject(DOCUMENT).querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, nofollow');
  });
});
