import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { BlogApi, HttpBlogApi, MockBlogApi } from './data-access/blog.api';
import { blogListResolver, blogPostResolver } from './data-access/blog.resolvers';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    providers: [
      HttpBlogApi,
      MockBlogApi,
      {
        provide: BlogApi,
        useFactory: () => (inject(APP_CONFIG).useMockApi ? inject(MockBlogApi) : inject(HttpBlogApi)),
      },
    ],
    children: [
      {
        path: '',
        // Search and pagination live in the query string, so reload the data when it changes.
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { data: blogListResolver },
        loadComponent: () =>
          import('./blog-list-page.component').then((m) => m.BlogListPageComponent),
      },
      {
        path: ':slug',
        resolve: { data: blogPostResolver },
        loadComponent: () =>
          import('./blog-post-page.component').then((m) => m.BlogPostPageComponent),
      },
    ],
  },
];
