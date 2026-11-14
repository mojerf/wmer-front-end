/**
 * Accepts only in-app paths for post-login redirects, so `?redirect=` can never send people to another
 * site (open redirect). Anything else becomes "/".
 */
export function safeRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) {
    return '/';
  }
  // "/\evil.com", "/%2F/evil.com" style tricks are covered by the checks above and by decoding once.
  try {
    const decoded = decodeURIComponent(target);
    if (decoded.startsWith('//') || decoded.includes('\\')) {
      return '/';
    }
  } catch {
    return '/';
  }
  return target;
}
