import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { OrderStatus } from '../../../shared/models/order-status';
import { Page, PaginatedDto, toPage } from '../../../shared/models/page';
import { AdminContact, AdminOrder, AdminStats, ContentRow, ContentType } from './admin.models';

interface StatsDto {
  counts: AdminStats['counts'];
  orders_by_status: AdminStats['ordersByStatus'];
  revenue: number;
}

interface ContentRowDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  image_thumb?: string | null;
  created_at: string;
}

interface OrderDto {
  id: number;
  buyer_name: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  products: { title: string }[];
  allowed_statuses: OrderStatus[];
}

interface ContactDto {
  id: number;
  email: string;
  phone_number: string | null;
  title: string;
  text: string;
  created_at: string;
}

/** Everything the admin area asks of the API. Needs an administrator's session; the server enforces that. */
@Injectable()
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  stats(): Observable<AdminStats> {
    return this.http
      .get<StatsDto>(`${this.api}/admin/stats`)
      .pipe(map((dto) => ({ counts: dto.counts, ordersByStatus: dto.orders_by_status, revenue: dto.revenue })));
  }

  /** Lists reuse the public endpoints (they carry the ids the admin needs). */
  list(type: ContentType, page: number, search: string): Observable<Page<ContentRow>> {
    let params = new HttpParams().set('page', page);
    if (search) {
      params = params.set('search', search);
    }
    // `no-store`: the public lists may be cached briefly by browsers, but an admin must see their own edits at once.
    return this.http.get<PaginatedDto<ContentRowDto>>(`${this.api}/${type}`, { params, cache: 'no-store' }).pipe(
      map((dto) =>
        toPage(dto, (row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          imageUrl: row.image_thumb ?? row.image,
          createdAt: row.created_at,
        })),
      ),
    );
  }

  /** The raw fields of one item, as the edit form needs them. */
  get(type: ContentType, id: number): Observable<Record<string, unknown>> {
    return this.http
      .get<{ data: Record<string, unknown> }>(`${this.api}/admin/${type}/${id}`)
      .pipe(map((res) => res.data));
  }

  /** Creates (no id) or updates an item. Updates go through POST + `_method` because PHP only reads multipart bodies on POST. */
  save(type: ContentType, id: number | null, body: FormData): Observable<void> {
    if (id !== null) {
      body.set('_method', 'PUT');
    }
    const url = id === null ? `${this.api}/${type}` : `${this.api}/${type}/${id}`;
    return this.http.post(url, body).pipe(map(() => undefined));
  }

  remove(type: ContentType, id: number): Observable<void> {
    return this.http.delete(`${this.api}/${type}/${id}`).pipe(map(() => undefined));
  }

  orders(page: number): Observable<Page<AdminOrder>> {
    return this.http
      .get<PaginatedDto<OrderDto>>(`${this.api}/orders`, { params: new HttpParams().set('page', page) })
      .pipe(
        map((dto) =>
          toPage(dto, (o) => ({
            id: o.id,
            buyer: o.buyer_name,
            status: o.status,
            total: o.total_price,
            createdAt: o.created_at,
            products: o.products.map((p) => p.title),
            allowedStatuses: o.allowed_statuses,
          })),
        ),
      );
  }

  setOrderStatus(id: number, status: OrderStatus): Observable<void> {
    return this.http.patch(`${this.api}/orders/${id}/status`, { status }).pipe(map(() => undefined));
  }

  contacts(page: number): Observable<Page<AdminContact>> {
    return this.http
      .get<PaginatedDto<ContactDto>>(`${this.api}/contacts`, { params: new HttpParams().set('page', page) })
      .pipe(
        map((dto) =>
          toPage(dto, (c) => ({
            id: c.id,
            email: c.email,
            phoneNumber: c.phone_number,
            title: c.title,
            text: c.text,
            createdAt: c.created_at,
          })),
        ),
      );
  }

  removeContact(id: number): Observable<void> {
    return this.http.delete(`${this.api}/contacts/${id}`).pipe(map(() => undefined));
  }
}
