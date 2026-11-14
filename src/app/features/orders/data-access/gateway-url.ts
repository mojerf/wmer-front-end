/**
 * The payment URL comes from the API, but the browser is about to leave the site for it, so it is
 * checked first: only https gateways, or the API's own origin (the local fake gateway), are allowed.
 */
export function isTrustedGatewayUrl(url: string, apiUrl: string): boolean {
  try {
    const target = new URL(url);
    return target.protocol === 'https:' || target.origin === new URL(apiUrl).origin;
  } catch {
    return false;
  }
}
