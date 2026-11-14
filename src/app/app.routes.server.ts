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
  // Static pages (no API data) are rendered once at build time.
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  {
    path: 'works',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  },
  {
    path: 'works/:slug',
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
  {
    path: 'shop',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  },
  {
    path: 'shop/:slug',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  },
  // Cart and orders are per-visitor too.
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'orders', renderMode: RenderMode.Client },
  { path: 'orders/:id', renderMode: RenderMode.Client },
  // Account pages are per-visitor and need cookies the server does not have: render them in the browser.
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'forgot-password', renderMode: RenderMode.Client },
  { path: 'reset-password', renderMode: RenderMode.Client },
  { path: 'verify-email', renderMode: RenderMode.Client },
  { path: '404', renderMode: RenderMode.Server, status: 404 },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
