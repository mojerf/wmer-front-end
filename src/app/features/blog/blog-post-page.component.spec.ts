import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { provideTestConfig } from '../../../testing/test-providers';
import { BlogPostPageComponent } from './blog-post-page.component';
import { BlogPostData } from './data-access/blog.resolvers';

const data: BlogPostData = {
  post: {
    id: 1,
    title: 'عنوان نوشته',
    slug: 'my-post',
    imageUrl: null,
    publishedAt: '2026-01-01T00:00:00+00:00',
    updatedAt: '2026-01-02T00:00:00+00:00',
    commentsCount: 2,
    author: 'مجتبی',
    description: 'پاراگراف اول\n\n<img src=x onerror=alert(1)><script>alert(2)</script>',
  },
  comments: [
    {
      id: 1,
      authorName: 'علی',
      body: '<b>bold?</b> سلام',
      createdAt: '2026-01-03T00:00:00+00:00',
      replies: [
        { id: 2, authorName: 'رضا', body: 'جواب', createdAt: '2026-01-04T00:00:00+00:00', replies: [] },
      ],
    },
  ],
};

describe('BlogPostPageComponent', () => {
  const create = async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPageComponent],
      providers: [provideRouter([]), ...provideTestConfig()],
    }).compileComponents();
    const fixture = TestBed.createComponent(BlogPostPageComponent);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
    return fixture;
  };

  it('renders the post and nested comments', async () => {
    const el = (await create()).nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('عنوان نوشته');
    expect(el.textContent).toContain('علی');
    expect(el.textContent).toContain('جواب');
    expect(el.querySelectorAll('app-comment-list').length).toBe(2);
  });

  it('never renders user text as HTML', async () => {
    const el = (await create()).nativeElement as HTMLElement;

    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    expect([...el.querySelectorAll('b')].map((b) => b.textContent)).not.toContain('bold?');
    expect(el.textContent).toContain('<script>alert(2)</script>');
    expect(el.textContent).toContain('<b>bold?</b>');
  });

  it('sets post SEO with BlogPosting and BreadcrumbList structured data', async () => {
    await create();
    const doc = TestBed.inject(DOCUMENT);

    expect(doc.title).toContain('عنوان نوشته');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://site.test/blog/my-post',
    );

    const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>,
    );
    expect(ld.map((x) => x['@type'])).toEqual(['BlogPosting', 'BreadcrumbList']);
    expect(ld[0]).toMatchObject({
      datePublished: data.post.publishedAt,
      dateModified: data.post.updatedAt,
    });
  });
});
