import { createHash } from 'node:crypto';

/**
 * Content-Security-Policy for the server-rendered pages.
 *
 * Scripts are the part that matters: only files from this origin and the few inline scripts Angular itself
 * writes into each page (event-replay bootstrap, critical-CSS loader) may run. The inline scripts are allowed by
 * their SHA-256 hash, computed from the HTML that is actually being sent, so there is no 'unsafe-inline' for scripts.
 */

/** Inline scripts that run (JSON blocks such as ld+json and ng-state are data, not code). */
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
const EXECUTABLE_TYPE = /\stype\s*=\s*["']?(?:text\/javascript|module|application\/javascript)["']?/i;
const ANY_TYPE = /\stype\s*=/i;

export function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>();

  for (const [, attributes = '', body = ''] of html.matchAll(INLINE_SCRIPT)) {
    if (ANY_TYPE.test(attributes) && !EXECUTABLE_TYPE.test(attributes)) {
      continue;
    }
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }

  return [...hashes];
}

export interface CspOptions {
  /** Hashes of the inline scripts in this page. */
  scriptHashes: readonly string[];
  /** Origin of the Laravel API (XHR from the browser, and where uploaded images are served from). */
  apiOrigin: string;
  /** Add `upgrade-insecure-requests` (only meaningful behind HTTPS). */
  upgradeInsecure: boolean;
}

export function buildCsp({ scriptHashes, apiOrigin, upgradeInsecure }: CspOptions): string {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    // Angular and the critical-CSS inliner write <style> blocks; style attributes are never used.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: ${apiOrigin}`,
    `font-src 'self'`,
    `connect-src 'self' ${apiOrigin}`,
    `manifest-src 'self'`,
    `worker-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];

  if (upgradeInsecure) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}
