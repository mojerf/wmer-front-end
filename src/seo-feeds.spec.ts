import { describe, expect, it, vi } from 'vitest';
import { buildRobots, buildRss, buildSitemap, cached, escapeXml, FeedItem } from './seo-feeds';

const item = (slug: string, title = 'T'): FeedItem => ({ slug, title, createdAt: '2026-03-04T10:00:00+00:00' });

describe('seo feeds', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml(`a & b <c> "d" 'e'`)).toBe('a &amp; b &lt;c&gt; &quot;d&quot; &apos;e&apos;');
  });

  it('lists static pages and every content page with percent-encoded slugs', () => {
    const xml = buildSitemap('https://site.test/', {
      works: [item('my-work')],
      posts: [item('پست-فارسی')],
      products: [item('kit')],
    });

    expect(xml).toContain('<loc>https://site.test/</loc>');
    expect(xml).toContain('<loc>https://site.test/works/my-work</loc><lastmod>2026-03-04</lastmod>');
    expect(xml).toContain(`<loc>https://site.test/blog/${encodeURIComponent('پست-فارسی')}</loc>`);
    expect(xml).toContain('<loc>https://site.test/shop/kit</loc>');
    expect(xml).not.toContain('/admin');
  });

  it('builds a valid RSS feed with escaped titles', () => {
    const xml = buildRss('https://site.test', { name: 'Site', description: 'About' }, [item('a', 'Tom & Jerry')]);

    expect(xml).toContain('<title>Tom &amp; Jerry</title>');
    expect(xml).toContain('<link>https://site.test/blog/a</link>');
    expect(xml).toContain('<pubDate>Wed, 04 Mar 2026 10:00:00 GMT</pubDate>');
    expect(xml).toContain('href="https://site.test/rss.xml"');
  });

  it('keeps private areas out of robots.txt and points to the sitemap', () => {
    const robots = buildRobots('https://site.test');

    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Sitemap: https://site.test/sitemap.xml');
  });
});

describe('cached', () => {
  it('shares one load, reuses it within the ttl and serves stale data when a refresh fails', async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValueOnce('first').mockRejectedValueOnce(new Error('down'));
    const get = cached(load, 1000);

    expect(await Promise.all([get(), get()])).toEqual(['first', 'first']);
    expect(load).toHaveBeenCalledTimes(1);

    await get();
    expect(load).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(await get()).toBe('first'); // refresh failed: stale value
    expect(load).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
