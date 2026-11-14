import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { Page } from '../../../shared/models/page';
import { WorksApi } from './works.api';
import { WorkDetail, WorkSummary } from './works.models';

export interface WorksListData {
  works: Page<WorkSummary>;
  search: string;
  tag: string;
}

const toPageNumber = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

/** Reads `?q=`, `?tag=` and `?page=` from the URL and loads that page of works. */
export const worksListResolver: ResolveFn<WorksListData> = (route) => {
  const search = (route.queryParamMap.get('q') ?? '').trim().slice(0, 100);
  const tag = (route.queryParamMap.get('tag') ?? '').trim().slice(0, 50);
  const page = toPageNumber(route.queryParamMap.get('page'));

  return inject(WorksApi)
    .list({ search, tag, page })
    .pipe(map((works) => ({ works, search, tag })));
};

/** Loads one work. A 404 from the API is turned into the 404 page by app.config.ts. */
export const workResolver: ResolveFn<WorkDetail> = (route) =>
  inject(WorksApi).work(route.paramMap.get('slug') ?? '');
