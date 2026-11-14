/**
 * Crawler-facing documents generated on the server: sitemap.xml, the blog's RSS feed and robots.txt.
 * Kept free of Express/Angular so they are easy to test.
 */

export interface FeedItem {
  slug: string;
  title: string;
  /** ISO 8601 */
  createdAt: string;
}

interface ListResponse {
  data: { slug: string; title: string; created_at: string }[];
  meta: { current_page: number; last_page: number };
}

/** Public pages that exist regardless of content. */
export const STATIC_PATHS = ['/', '/works', '/blog', '/shop', '/about', '/contact'] as const;

/** Never let a runaway API response turn into thousands of requests. */
const MAX_PAGES = 50;

export const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

/** Slugs may contain non-ASCII letters; URLs in feeds must be percent-encoded. */
const url = (siteUrl: string, path: string): string => {
  const origin = siteUrl.replace(/\/+$/, '');
  return path === '/' ? `${origin}/` : `${origin}${path.split('/').map(encodeURIComponent).join('/')}`;
};

const day = (iso: string): string => iso.slice(0, 10);

export function buildSitemap(
  siteUrl: string,
  content: { works: readonly FeedItem[]; posts: readonly FeedItem[]; products: readonly FeedItem[] },
): string {
  const entry = (path: string, lastmod?: string): string =>
    `  <url><loc>${escapeXml(url(siteUrl, path))}</loc>${lastmod ? `<lastmod>${day(lastmod)}</lastmod>` : ''}</url>`;

  const entries = [
    ...STATIC_PATHS.map((path) => entry(path)),
    ...content.works.map((i) => entry(`/works/${i.slug}`, i.createdAt)),
    ...content.posts.map((i) => entry(`/blog/${i.slug}`, i.createdAt)),
    ...content.products.map((i) => entry(`/shop/${i.slug}`, i.createdAt)),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

export function buildRss(
  siteUrl: string,
  site: { name: string; description: string },
  posts: readonly FeedItem[],
): string {
  const items = posts
    .map((post) => {
      const link = escapeXml(url(siteUrl, `/blog/${post.slug}`));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(url(siteUrl, '/blog'))}</link>
    <description>${escapeXml(site.description)}</description>
    <language>fa</language>
    <atom:link href="${escapeXml(url(siteUrl, '/rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function buildRobots(siteUrl: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /cart',
    'Disallow: /orders',
    '',
    `Sitemap: ${url(siteUrl, '/sitemap.xml')}`,
    '',
  ].join('\n');
}

/** Reads every page of one public list endpoint. */
export async function fetchAllItems(apiUrl: string, type: 'works' | 'posts' | 'products'): Promise<FeedItem[]> {
  const items: FeedItem[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(`${apiUrl}/${type}?page=${page}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`${type}: HTTP ${response.status}`);
    }

    const body = (await response.json()) as ListResponse;
    items.push(...body.data.map((row) => ({ slug: row.slug, title: row.title, createdAt: row.created_at })));

    if (page >= body.meta.last_page) {
      break;
    }
  }

  return items;
}

/** Keeps the last good value for `ttlMs`, shares one in-flight load, and serves stale data if a refresh fails. */
export function cached<T>(load: () => Promise<T>, ttlMs: number): () => Promise<T> {
  let value: { data: T; at: number } | undefined;
  let inflight: Promise<T> | undefined;

  return async () => {
    if (value && Date.now() - value.at < ttlMs) {
      return value.data;
    }

    inflight ??= load()
      .then((data) => {
        value = { data, at: Date.now() };
        return data;
      })
      .catch((error: unknown) => {
        if (value) {
          return value.data;
        }
        throw error;
      })
      .finally(() => {
        inflight = undefined;
      });

    return inflight;
  };
}
