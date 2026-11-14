import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Rendering strategy per route:
 * - Home shows content from the API, so it is rendered on request and cached briefly by CDNs/proxies.
 * - Anything unmatched is rendered as a real HTTP 404.
 * Future static pages (about, privacy) can use RenderMode.Prerender; the admin area RenderMode.Client.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  },
  {
    path: 'blog',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  },
  { path: '404', renderMode: RenderMode.Server, status: 404 },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
