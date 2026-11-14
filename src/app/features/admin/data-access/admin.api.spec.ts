import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideTestConfig, TEST_CONFIG } from '../../../../testing/test-providers';
import { AdminApi } from './admin.api';

describe('AdminApi', () => {
  let api: AdminApi;
  let controller: HttpTestingController;
  const base = TEST_CONFIG.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideTestConfig(), provideHttpClient(), provideHttpClientTesting(), AdminApi],
    });
    api = TestBed.inject(AdminApi);
    controller = TestBed.inject(HttpTestingController);
  });

  it('maps the statistics', async () => {
    const done = firstValueFrom(api.stats());
    controller.expectOne(`${base}/admin/stats`).flush({
      counts: { users: 1, works: 2, posts: 3, products: 4, orders: 5, contacts: 6 },
      orders_by_status: { pending: 1, processing: 0, completed: 2, cancelled: 0 },
      revenue: 900,
    });

    expect(await done).toMatchObject({ revenue: 900, ordersByStatus: { completed: 2 } });
  });

  it('lists content through the public endpoint, with page and search', async () => {
    const done = firstValueFrom(api.list('posts', 2, 'angular'));
    const req = controller.expectOne((r) => r.url === `${base}/posts`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('search')).toBe('angular');
    req.flush({
      data: [{ id: 7, title: 'T', slug: 't', image: 'full.jpg', image_thumb: 'thumb.webp', created_at: '2026-01-01' }],
      meta: { current_page: 2, last_page: 3, per_page: 12, total: 30 },
    });

    const page = await done;
    expect(page.items[0]).toMatchObject({ id: 7, imageUrl: 'thumb.webp' });
    expect(page.lastPage).toBe(3);
  });

  it('creates with POST and updates with POST + _method=PUT', () => {
    api.save('works', null, new FormData()).subscribe();
    const created = controller.expectOne(`${base}/works`);
    expect(created.request.method).toBe('POST');
    expect((created.request.body as FormData).has('_method')).toBe(false);
    created.flush({});

    api.save('works', 4, new FormData()).subscribe();
    const updated = controller.expectOne(`${base}/works/4`);
    expect(updated.request.method).toBe('POST');
    expect((updated.request.body as FormData).get('_method')).toBe('PUT');
    updated.flush({});
  });

  it('changes an order status and deletes a contact', () => {
    api.setOrderStatus(3, 'completed').subscribe();
    const status = controller.expectOne(`${base}/orders/3/status`);
    expect(status.request.method).toBe('PATCH');
    expect(status.request.body).toEqual({ status: 'completed' });
    status.flush({});

    api.removeContact(9).subscribe();
    const del = controller.expectOne(`${base}/contacts/9`);
    expect(del.request.method).toBe('DELETE');
    del.flush({});
  });
});
