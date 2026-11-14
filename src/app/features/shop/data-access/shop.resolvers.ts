import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { Page } from '../../../shared/models/page';
import { ShopApi } from './shop.api';
import { ProductDetail, ProductSummary, SHOP_SORTS, ShopSort } from './shop.models';

export interface ShopListData {
  products: Page<ProductSummary>;
  search: string;
  sort: ShopSort;
}

const toPageNumber = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const toSort = (value: string | null): ShopSort =>
  SHOP_SORTS.find((s) => s.value === value)?.value ?? 'latest';

/** Reads `?q=`, `?sort=` and `?page=` from the URL and loads that page of products. */
export const shopListResolver: ResolveFn<ShopListData> = (route) => {
  const search = (route.queryParamMap.get('q') ?? '').trim().slice(0, 100);
  const sort = toSort(route.queryParamMap.get('sort'));
  const page = toPageNumber(route.queryParamMap.get('page'));

  return inject(ShopApi)
    .list({ search, sort, page })
    .pipe(map((products) => ({ products, search, sort })));
};

/** Loads one product. A 404 from the API is turned into the 404 page by app.config.ts. */
export const productResolver: ResolveFn<ProductDetail> = (route) =>
  inject(ShopApi).product(route.paramMap.get('slug') ?? '');
