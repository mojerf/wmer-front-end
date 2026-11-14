import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ApiError } from '../../../core/http/api.interceptors';
import { Page, PaginatedDto, toPage } from '../../../shared/models/page';
import { OrderDto } from './orders.dto';
import { toOrder } from './orders.mapper';
import { Order } from './orders.models';

/** What the orders feature needs from the outside world. Components depend on this, never on HTTP. */
export abstract class OrdersApi {
  /** Places an order for these products. Prices are decided by the server. */
  abstract create(productIds: readonly number[]): Observable<Order>;
  abstract mine(page: number): Observable<Page<Order>>;
  abstract get(id: number): Observable<Order>;
}

@Injectable()
export class HttpOrdersApi extends OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiUrl}/orders`;

  create(productIds: readonly number[]): Observable<Order> {
    return this.http
      .post<{ order: { data?: OrderDto } & OrderDto }>(this.base, { product_ids: productIds })
      .pipe(map((res) => toOrder(res.order.data ?? res.order)));
  }

  mine(page: number): Observable<Page<Order>> {
    return this.http
      .get<PaginatedDto<OrderDto>>(`${this.base}/mine`, { params: new HttpParams().set('page', page) })
      .pipe(map((dto) => toPage(dto, toOrder)));
  }

  get(id: number): Observable<Order> {
    return this.http.get<{ data: OrderDto }>(`${this.base}/${id}`).pipe(map((res) => toOrder(res.data)));
  }
}

/** In-memory orders used while `useMockApi` is on. */
@Injectable()
export class MockOrdersApi extends OrdersApi {
  private readonly orders: Order[] = [];

  create(productIds: readonly number[]): Observable<Order> {
    const order: Order = {
      id: this.orders.length + 1,
      status: 'pending',
      total: productIds.length * 100_000,
      createdAt: new Date().toISOString(),
      lines: productIds.map((id) => ({
        id,
        title: `محصول ${id}`,
        slug: `product-${id}`,
        imageUrl: null,
        price: 100_000,
        downloadLink: null,
      })),
    };
    this.orders.unshift(order);
    return of(order);
  }

  mine(): Observable<Page<Order>> {
    return of({ items: this.orders, page: 1, lastPage: 1, total: this.orders.length });
  }

  get(id: number): Observable<Order> {
    const found = this.orders.find((o) => o.id === id);
    return found ? of(found) : throwError(() => new ApiError(404, 'Not found'));
  }
}
