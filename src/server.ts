import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

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

/** Baseline security headers (a strict CSP is added in a later step). */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  next();
});

/** Serve static files from /browser */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    // Files that are not content-hashed must always be revalidated, or updates never reach users.
    setHeaders: (res, path) => {
      if (/(ngsw-worker\.js|ngsw\.json|safety-worker\.js|worker-basic\.min\.js|manifest\.webmanifest|theme-init\.js|robots\.txt|sitemap\.xml)$/.test(path)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

/** Handle all other requests by rendering the Angular application. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
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
