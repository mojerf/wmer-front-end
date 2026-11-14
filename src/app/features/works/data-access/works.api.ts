import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ApiError } from '../../../core/http/api.interceptors';
import { Page, PaginatedDto, toPage } from '../../../shared/models/page';
import { WorkDetailDto, WorkSummaryDto } from './works.dto';
import { toWorkDetail, toWorkSummary } from './works.mapper';
import { WorkDetail, WorksQuery, WorkSummary } from './works.models';

/** What the works feature needs from the outside world. Components depend on this, never on HTTP. */
export abstract class WorksApi {
  abstract list(query: WorksQuery): Observable<Page<WorkSummary>>;
  abstract work(slug: string): Observable<WorkDetail>;
}

@Injectable()
export class HttpWorksApi extends WorksApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiUrl}/works`;

  list(query: WorksQuery): Observable<Page<WorkSummary>> {
    let params = new HttpParams().set('page', query.page);
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.tag) {
      params = params.set('tag', query.tag);
    }
    return this.http
      .get<PaginatedDto<WorkSummaryDto>>(this.base, { params })
      .pipe(map((dto) => toPage(dto, toWorkSummary)));
  }

  work(slug: string): Observable<WorkDetail> {
    return this.http
      .get<{ data: WorkDetailDto }>(`${this.base}/${encodeURIComponent(slug)}`)
      .pipe(map((res) => toWorkDetail(res.data)));
  }
}

const MOCK: readonly WorkDetail[] = [
  {
    id: 1,
    title: 'پنل مدیریت فروش',
    slug: 'sales-dashboard',
    imageUrl: null,
    fullImageUrl: null,
    tags: ['Angular', 'Laravel'],
    publishedAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    timeline: 'اردیبهشت تا مرداد ۱۴۰۴',
    publishDate: 'مرداد ۱۴۰۴',
    role: 'توسعه‌دهنده‌ی Full-stack',
    projectLink: 'https://example.com',
    overview: 'داشبورد زنده برای تیم فروش.',
    learn: 'مرز لایه‌ها را تمیز نگه داشتن.',
    description: 'این پروژه از صفر طراحی و پیاده‌سازی شد.',
  },
];

/** Placeholder portfolio used while `useMockApi` is on. */
@Injectable()
export class MockWorksApi extends WorksApi {
  list(query: WorksQuery): Observable<Page<WorkSummary>> {
    const items = MOCK.filter(
      (w) =>
        w.title.includes(query.search) && (!query.tag || w.tags.includes(query.tag)),
    );
    return of({ items, page: 1, lastPage: 1, total: items.length });
  }

  work(slug: string): Observable<WorkDetail> {
    const found = MOCK.find((w) => w.slug === slug);
    return found ? of(found) : throwError(() => new ApiError(404, 'Not found'));
  }
}
