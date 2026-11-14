import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestConfig, TEST_CONFIG } from '../../../testing/test-providers';
import { ApiError } from './api.interceptors';
import { provideApi } from './provide-api';

describe('API interceptors', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideTestConfig(), provideApi(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  it('sends the JSON accept header and credentials only to the API', () => {
    http.get(`${TEST_CONFIG.apiUrl}/x`).subscribe();
    const api = controller.expectOne(`${TEST_CONFIG.apiUrl}/x`);
    expect(api.request.headers.get('Accept')).toBe('application/json');
    expect(api.request.withCredentials).toBe(true);
    api.flush({});

    http.get('https://other.test/y').subscribe();
    const other = controller.expectOne('https://other.test/y');
    expect(other.request.withCredentials).toBe(false);
    other.flush({});
  });

  it('turns API failures into ApiError with Laravel validation errors', async () => {
    const result = new Promise<unknown>((resolve) => {
      http.get(`${TEST_CONFIG.apiUrl}/x`).subscribe({ error: resolve });
    });
    controller.expectOne(`${TEST_CONFIG.apiUrl}/x`).flush(
      { message: 'نامعتبر', errors: { email: ['ایمیل نادرست است'] } },
      { status: 422, statusText: 'Unprocessable' },
    );

    const error = (await result) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.message).toBe('نامعتبر');
    expect(error.fieldErrors['email']).toEqual(['ایمیل نادرست است']);
  });
});
