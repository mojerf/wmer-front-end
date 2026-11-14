import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Page } from '../../../shared/models/page';
import { OrdersApi } from './orders.api';
import { Order } from './orders.models';

/** The signed-in customer's orders; `?page=` selects the page. */
export const ordersListResolver: ResolveFn<Page<Order>> = (route) => {
  const page = Number(route.queryParamMap.get('page'));
  return inject(OrdersApi).mine(Number.isInteger(page) && page > 0 ? page : 1);
};

/** One order. Unknown ids and other people's orders both end on the 404 page (see app.config.ts). */
export const orderResolver: ResolveFn<Order> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(OrdersApi).get(Number.isInteger(id) && id > 0 ? id : 0);
};
