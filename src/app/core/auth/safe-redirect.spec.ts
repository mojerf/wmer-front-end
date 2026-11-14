import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it('keeps in-app paths, including query strings and fragments', () => {
    expect(safeRedirect('/blog/my-post')).toBe('/blog/my-post');
    expect(safeRedirect('/blog?page=2#comments')).toBe('/blog?page=2#comments');
  });

  it.each([
    undefined,
    null,
    '',
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/%2F/evil.test',
    '/%5Cevil.test',
    'javascript:alert(1)',
    'blog',
    '/%E0%A4%A',
  ])('falls back to "/" for %s', (value) => {
    expect(safeRedirect(value as string | null | undefined)).toBe('/');
  });
});
