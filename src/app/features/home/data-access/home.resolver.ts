import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HomeApi } from './home.api';
import { HomeContent } from './home.models';

/** Loads the page data before the route activates, so SSR renders the real content and the first paint is complete. */
export const homeContentResolver: ResolveFn<HomeContent> = () => inject(HomeApi).load();
