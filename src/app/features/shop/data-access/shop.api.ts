import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ApiError } from '../../../core/http/api.interceptors';
import { Page, PaginatedDto, toPage } from '../../../shared/models/page';
import { ProductDetailDto, ProductSummaryDto } from './shop.dto';
import { toProductDetail, toProductSummary } from './shop.mapper';
import { ProductDetail, ProductSummary, ShopQuery } from './shop.models';

/** What the shop feature needs from the outside world. Components depend on this, never on HTTP. */
export abstract class ShopApi {
  abstract list(query: ShopQuery): Observable<Page<ProductSummary>>;
  abstract product(slug: string): Observable<ProductDetail>;
}

@Injectable()
export class HttpShopApi extends ShopApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiUrl}/products`;

  list(query: ShopQuery): Observable<Page<ProductSummary>> {
    let params = new HttpParams().set('page', query.page).set('sort', query.sort);
    if (query.search) {
      params = params.set('search', query.search);
    }
    return this.http
      .get<PaginatedDto<ProductSummaryDto>>(this.base, { params })
      .pipe(map((dto) => toPage(dto, toProductSummary)));
  }

  product(slug: string): Observable<ProductDetail> {
    return this.http
      .get<{ data: ProductDetailDto }>(`${this.base}/${encodeURIComponent(slug)}`)
      .pipe(map((res) => toProductDetail(res.data)));
  }
}

const MOCK: readonly ProductDetail[] = [
  {
    id: 1,
    title: 'قالب داشبورد Angular',
    slug: 'angular-dashboard-template',
    imageUrl: null,
    price: 490_000,
    oldPrice: 650_000,
    publishedAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    author: 'مجتبی عرفان‌راد',
    expert: 'قالب آماده با Signals و Tailwind',
    description: 'یک قالب کامل برای شروع سریع پروژه‌های مدیریتی.',
  },
  {
    id: 2,
    title: 'دوره‌ی لاراول از صفر',
    slug: 'laravel-course',
    imageUrl: null,
    price: 1_200_000,
    oldPrice: null,
    publishedAt: new Date(Date.now() - 20 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86_400_000).toISOString(),
    author: 'مجتبی عرفان‌راد',
    expert: 'از نصب تا استقرار روی سرور',
    description: 'دوره‌ی کاملی که همه‌ی مراحل ساخت یک API را پوشش می‌دهد.',
  },
];

/** Placeholder catalogue used while `useMockApi` is on. */
@Injectable()
export class MockShopApi extends ShopApi {
  list(query: ShopQuery): Observable<Page<ProductSummary>> {
    const term = query.search.trim().toLowerCase();
    const items = MOCK.filter((p) => p.title.toLowerCase().includes(term));
    return of({ items, page: 1, lastPage: 1, total: items.length });
  }

  product(slug: string): Observable<ProductDetail> {
    const found = MOCK.find((p) => p.slug === slug);
    return found ? of(found) : throwError(() => new ApiError(404, 'Not found'));
  }
}
