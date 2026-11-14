import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildCsp, inlineScriptHashes } from './csp';

const hash = (code: string): string => `'sha256-${createHash('sha256').update(code).digest('base64')}'`;

describe('inlineScriptHashes', () => {
  const html = `
    <script src="main.js" type="module"></script>
    <script type="application/ld+json">{"a":1}</script>
    <script id="ng-state" type="application/json">{"b":2}</script>
    <script type="text/javascript" id="contract">window.a=1;</script>
    <script>window.b=2;</script>
    <script>window.b=2;</script>`;

  it('hashes only the inline scripts that execute, once each', () => {
    expect(inlineScriptHashes(html)).toEqual([hash('window.a=1;'), hash('window.b=2;')]);
  });

  it('ignores scripts with a src, JSON blocks and pages without scripts', () => {
    expect(inlineScriptHashes('<p>hi</p>')).toEqual([]);
  });
});

describe('buildCsp', () => {
  const csp = buildCsp({ scriptHashes: ["'sha256-abc'"], apiOrigin: 'https://api.test', upgradeInsecure: true });

  it('allows scripts from this origin and the listed hashes only', () => {
    expect(csp).toContain(`script-src 'self' 'sha256-abc'`);
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).not.toMatch(/script-src[^;]*unsafe-eval/);
  });

  it('allows the API for requests and images, forbids framing, plugins and foreign bases', () => {
    expect(csp).toContain('connect-src \'self\' https://api.test');
    expect(csp).toContain('img-src \'self\' data: https://api.test');
    expect(csp).toContain(`frame-ancestors 'none'`);
    expect(csp).toContain(`object-src 'none'`);
    expect(csp).toContain(`base-uri 'self'`);
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('only upgrades insecure requests when asked to', () => {
    expect(buildCsp({ scriptHashes: [], apiOrigin: 'http://localhost:8000', upgradeInsecure: false })).not.toContain(
      'upgrade-insecure-requests',
    );
  });
});
