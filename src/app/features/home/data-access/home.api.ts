import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { MainPageDto } from './home.dto';
import { toHomeContent } from './home.mapper';
import { HomeContent } from './home.models';

/** What the home feature needs from the outside world. Components depend on this, never on HTTP. */
export abstract class HomeApi {
  abstract load(): Observable<HomeContent>;
}

@Injectable()
export class HttpHomeApi extends HomeApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  load(): Observable<HomeContent> {
    return this.http
      .get<MainPageDto>(`${this.config.apiUrl}/main-page`)
      .pipe(map(toHomeContent));
  }
}

/** Placeholder content used while `useMockApi` is on. Shaped exactly like the mapped API data. */
@Injectable()
export class MockHomeApi extends HomeApi {
  load(): Observable<HomeContent> {
    return of({
      works: [
        { id: 1, title: 'پنل مدیریت فروش', slug: 'sales-dashboard', imageUrl: null, tags: ['Angular', 'Laravel', 'Sanctum'] },
        { id: 2, title: 'اپ رزرو آنلاین', slug: 'booking-app', imageUrl: null, tags: ['PWA', 'Tailwind'] },
        { id: 3, title: 'فروشگاه محصولات دیجیتال', slug: 'digital-shop', imageUrl: null, tags: ['Laravel', 'MySQL'] },
      ],
      posts: [
        { id: 1, title: 'چرا Angular را zoneless کردم', slug: 'zoneless-angular', imageUrl: null, publishedLabel: '۳ روز پیش', commentsCount: 0 },
        { id: 2, title: 'SSR و سئو؛ راهنمای عملی', slug: 'ssr-seo', imageUrl: null, publishedLabel: '۱ هفته پیش', commentsCount: 0 },
        { id: 3, title: 'ساخت API امن با لاراول و Sanctum', slug: 'secure-laravel-api', imageUrl: null, publishedLabel: '۲ هفته پیش', commentsCount: 0 },
      ],
      products: [
        { id: 1, title: 'قالب داشبورد Angular', slug: 'angular-dashboard-template', imageUrl: null, price: 490_000, hasDiscount: true },
        { id: 2, title: 'دوره‌ی لاراول از صفر', slug: 'laravel-course', imageUrl: null, price: 1_200_000, hasDiscount: false },
      ],
    });
  }
}
