import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { Page } from '../../../shared/models/page';
import { BlogApi } from './blog.api';
import { PostComment, PostDetail, PostSummary } from './blog.models';

export interface BlogListData {
  posts: Page<PostSummary>;
  search: string;
}

export interface BlogPostData {
  post: PostDetail;
  comments: readonly PostComment[];
}

const toPageNumber = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

/** Reads `?q=` and `?page=` from the URL and loads that page of posts. */
export const blogListResolver: ResolveFn<BlogListData> = (route) => {
  const search = (route.queryParamMap.get('q') ?? '').trim().slice(0, 100);
  const page = toPageNumber(route.queryParamMap.get('page'));

  return inject(BlogApi)
    .list({ search, page })
    .pipe(map((posts) => ({ posts, search })));
};

/** Loads a post and its comments. A 404 from the API is turned into the 404 page by app.config.ts. */
export const blogPostResolver: ResolveFn<BlogPostData> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  const api = inject(BlogApi);

  return forkJoin({ post: api.post(slug), comments: api.comments(slug) });
};
