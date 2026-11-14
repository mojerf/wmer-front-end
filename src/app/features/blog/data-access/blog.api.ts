import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ApiError } from '../../../core/http/api.interceptors';
import { Page, PaginatedDto, toPage } from '../../../shared/models/page';
import { CommentDto, PostDetailDto, PostSummaryDto } from './blog.dto';
import { toPostComment, toPostDetail, toPostSummary } from './blog.mapper';
import { PostComment, PostDetail, PostListQuery, PostSummary } from './blog.models';

/** What the blog feature needs from the outside world. Components depend on this, never on HTTP. */
export abstract class BlogApi {
  abstract list(query: PostListQuery): Observable<Page<PostSummary>>;
  abstract post(slug: string): Observable<PostDetail>;
  abstract comments(slug: string): Observable<readonly PostComment[]>;
  abstract addComment(slug: string, body: string, parentId: number | null): Observable<void>;
  abstract deleteComment(id: number): Observable<void>;
}

@Injectable()
export class HttpBlogApi extends BlogApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;
  private readonly base = `${this.api}/posts`;

  list(query: PostListQuery): Observable<Page<PostSummary>> {
    let params = new HttpParams().set('page', query.page);
    if (query.search) {
      params = params.set('search', query.search);
    }
    return this.http
      .get<PaginatedDto<PostSummaryDto>>(this.base, { params })
      .pipe(map((dto) => toPage(dto, toPostSummary)));
  }

  post(slug: string): Observable<PostDetail> {
    return this.http
      .get<{ data: PostDetailDto }>(`${this.base}/${encodeURIComponent(slug)}`)
      .pipe(map((res) => toPostDetail(res.data)));
  }

  comments(slug: string): Observable<readonly PostComment[]> {
    return this.http
      .get<PaginatedDto<CommentDto>>(`${this.base}/${encodeURIComponent(slug)}/comments`)
      .pipe(map((dto) => dto.data.map(toPostComment)));
  }

  addComment(slug: string, body: string, parentId: number | null): Observable<void> {
    return this.http
      .post(`${this.base}/${encodeURIComponent(slug)}/comments`, { body, parent_id: parentId })
      .pipe(map(() => undefined));
  }

  deleteComment(id: number): Observable<void> {
    return this.http
      .delete(`${this.api}/comments/${id}`)
      .pipe(map(() => undefined));
  }
}

const daysAgo = (days: number): string => new Date(Date.now() - days * 86_400_000).toISOString();

const MOCK_POSTS: readonly PostDetail[] = [
  {
    id: 1,
    title: 'چرا Angular را zoneless کردم',
    slug: 'zoneless-angular',
    imageUrl: null,
    publishedAt: daysAgo(3),
    updatedAt: daysAgo(3),
    commentsCount: 1,
    author: 'مجتبی عرفان‌راد',
    description: 'تغییر detection به zoneless کد را ساده‌تر و سریع‌تر می‌کند.\n\nدر این نوشته دلیل‌ها را می‌گویم.',
  },
  {
    id: 2,
    title: 'SSR و سئو؛ راهنمای عملی',
    slug: 'ssr-seo',
    imageUrl: null,
    publishedAt: daysAgo(8),
    updatedAt: daysAgo(8),
    commentsCount: 0,
    author: 'مجتبی عرفان‌راد',
    description: 'رندر سمت سرور باعث می‌شود گوگل محتوای صفحه را کامل ببیند.',
  },
];

/** Placeholder blog used while `useMockApi` is on. */
@Injectable()
export class MockBlogApi extends BlogApi {
  list(query: PostListQuery): Observable<Page<PostSummary>> {
    const term = query.search.trim().toLowerCase();
    const items = MOCK_POSTS.filter((p) => p.title.toLowerCase().includes(term));
    return of({ items, page: 1, lastPage: 1, total: items.length });
  }

  post(slug: string): Observable<PostDetail> {
    const found = MOCK_POSTS.find((p) => p.slug === slug);
    return found ? of(found) : throwError(() => new ApiError(404, 'Not found'));
  }

  comments(slug: string): Observable<readonly PostComment[]> {
    return of(
      slug === 'zoneless-angular'
        ? [{ id: 1, authorName: 'علی', body: 'نوشته‌ی خوبی بود.', createdAt: daysAgo(1), canDelete: false, replies: [] }]
        : [],
    );
  }

  addComment(): Observable<void> {
    return of(undefined);
  }

  deleteComment(): Observable<void> {
    return of(undefined);
  }
}
