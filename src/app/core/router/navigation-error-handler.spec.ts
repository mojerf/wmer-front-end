import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withNavigationErrorHandler } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { ApiError } from '../http/api.interceptors';
import { apiNotFoundHandler } from './navigation-error-handler';

@Component({ template: '<p id="nf">not found</p>' })
class NotFoundStub {}

@Component({ template: '' })
class PageStub {}

describe('apiNotFoundHandler', () => {
  const setup = (status: number) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: '404', component: NotFoundStub },
            {
              path: 'post',
              component: PageStub,
              resolve: {
                data: () => {
                  throw new ApiError(status, 'x');
                },
              },
            },
          ],
          withNavigationErrorHandler(apiNotFoundHandler),
        ),
      ],
    });
  };

  it('shows the 404 page for an API 404', async () => {
    setup(404);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/post');

    expect(harness.routeNativeElement?.querySelector('#nf')).toBeTruthy();
    expect(TestBed.inject(Router).url).toBe('/404');
  });

  it('does not swallow other API errors', async () => {
    setup(500);
    const harness = await RouterTestingHarness.create();

    await expect(harness.navigateByUrl('/post')).rejects.toBeInstanceOf(ApiError);
  });
});
