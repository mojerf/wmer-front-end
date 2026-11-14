import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideTestConfig, TEST_CONFIG } from '../../../testing/test-providers';
import { provideApi } from './provide-api';

const clearCookie = () => {
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

describe('csrfInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  const url = `${TEST_CONFIG.apiUrl}/login`;

  beforeEach(() => {
    clearCookie();
    TestBed.configureTestingModule({
      providers: [...provideTestConfig(), provideApi(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    clearCookie();
  });

  it('does not touch safe requests', () => {
    http.get(`${TEST_CONFIG.apiUrl}/posts`).subscribe();

    const req = controller.expectOne(`${TEST_CONFIG.apiUrl}/posts`);
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({});
  });

  it('fetches the CSRF cookie first when it is missing, then sends the header', () => {
    http.post(url, {}).subscribe();

    const csrf = controller.expectOne(TEST_CONFIG.csrfUrl);
    expect(csrf.request.withCredentials).toBe(true);
    TestBed.inject(DOCUMENT).cookie = 'XSRF-TOKEN=abc%3D%3D; path=/';
    csrf.flush(null, { status: 204, statusText: 'No Content' });

    const post = controller.expectOne(url);
    expect(post.request.headers.get('X-XSRF-TOKEN')).toBe('abc==');
    post.flush({});
  });

  it('reuses an existing cookie without another round trip', () => {
    TestBed.inject(DOCUMENT).cookie = 'XSRF-TOKEN=token123; path=/';

    http.post(url, {}).subscribe();

    const post = controller.expectOne(url);
    expect(post.request.headers.get('X-XSRF-TOKEN')).toBe('token123');
    post.flush({});
  });

  it('refreshes the cookie and retries once when the API answers 419', () => {
    TestBed.inject(DOCUMENT).cookie = 'XSRF-TOKEN=old; path=/';
    let result: unknown;
    http.post(url, {}).subscribe((r) => (result = r));

    controller.expectOne(url).flush({ message: 'expired' }, { status: 419, statusText: 'Page Expired' });

    TestBed.inject(DOCUMENT).cookie = 'XSRF-TOKEN=fresh; path=/';
    controller.expectOne(TEST_CONFIG.csrfUrl).flush(null, { status: 204, statusText: 'No Content' });

    const retry = controller.expectOne(url);
    expect(retry.request.headers.get('X-XSRF-TOKEN')).toBe('fresh');
    retry.flush({ ok: true });
    expect(result).toEqual({ ok: true });
  });

  it('ignores requests to other origins', () => {
    http.post('https://other.test/x', {}).subscribe();

    const req = controller.expectOne('https://other.test/x');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({});
  });
});
