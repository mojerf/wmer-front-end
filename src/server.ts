import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';
import { join } from 'node:path';
import { SITE } from './app/core/config/site.config';
import { buildCsp, inlineScriptHashes } from './csp';
import { buildRobots, buildRss, buildSitemap, cached, fetchAllItems } from './seo-feeds';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.disable('x-powered-by');

/**
 * Only trust X-Forwarded-* headers when the server really sits behind your own reverse proxy
 * (set TRUST_PROXY=true there). Trusting them on a directly exposed server lets clients spoof the host.
 */
const angularApp = new AngularNodeAppEngine({
  /** Hosts this server answers for (comma separated env var). Requests with any other Host header get a 400. */
  allowedHosts: (process.env['ALLOWED_HOSTS'] ?? 'localhost').split(',').map((h) => h.trim()),
  trustProxyHeaders:
    process.env['TRUST_PROXY'] === 'true' ? ['x-forwarded-host', 'x-forwarded-proto'] : false,
});

/** gzip/deflate for text responses (HTML, JS, CSS, JSON, XML). Images are already compressed and skipped. */
app.use(compression());

/** Baseline security headers (the Content-Security-Policy is added per page below, because it depends on the page). */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  next();
});

/**
 * Crawler documents, generated from the API (never from stale static files).
 * SITE_URL is this site's public origin; API_URL is the Laravel API as seen from this server.
 */
const siteUrl = process.env['SITE_URL'] ?? 'http://localhost:4000';
const apiUrl = process.env['API_URL'] ?? 'http://localhost:8000/api/v1';
const FEED_TTL_MS = 10 * 60 * 1000;

const loadContent = cached(async () => {
  const [works, posts, products] = await Promise.all([
    fetchAllItems(apiUrl, 'works'),
    fetchAllItems(apiUrl, 'posts'),
    fetchAllItems(apiUrl, 'products'),
  ]);
  return { works, posts, products };
}, FEED_TTL_MS);

const sendXml = (res: express.Response, type: string, body: string): void => {
  res.type(type).setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600');
  res.send(body);
};

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildRobots(siteUrl));
});

app.get('/sitemap.xml', (_req, res, next) => {
  loadContent()
    .then((content) => sendXml(res, 'application/xml', buildSitemap(siteUrl, content)))
    .catch(next);
});

app.get('/rss.xml', (_req, res, next) => {
  loadContent()
    .then(({ posts }) =>
      sendXml(res, 'application/rss+xml', buildRss(siteUrl, { name: SITE.name, description: SITE.description }, posts.slice(0, 30))),
    )
    .catch(next);
});

/** Serve static files from /browser */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    // Files that are not content-hashed (including the un-hashed development bundles) must always be
    // revalidated, or updates never reach users.
    setHeaders: (res, path) => {
      if (/(ngsw-worker\.js|ngsw\.json|safety-worker\.js|worker-basic\.min\.js|manifest\.webmanifest|theme-init\.js|robots\.txt|sitemap\.xml|[\\/](main|polyfills|styles)\.(js|css))$/.test(path)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

/** Handle all other requests by rendering the Angular application. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) {
        return next();
      }
      if (!(response.headers.get('content-type') ?? '').includes('text/html')) {
        return writeResponseToNodeResponse(response, res);
      }

      // Pages get a Content-Security-Policy that allows exactly the inline scripts they contain (see csp.ts).
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.set(
        'Content-Security-Policy',
        buildCsp({
          scriptHashes: inlineScriptHashes(html),
          apiOrigin: new URL(apiUrl).origin,
          upgradeInsecure: siteUrl.startsWith('https://'),
        }),
      );
      return writeResponseToNodeResponse(
        new Response(html, { status: response.status, statusText: response.statusText, headers }),
        res,
      );
    })
    .catch(next);
});

/** Start the server if this module is the main entry point. */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/** Request handler used by the Angular CLI (dev-server and during build). */
export const reqHandler = createNodeRequestHandler(app);
