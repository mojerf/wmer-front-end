import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site.config';
import { SeoService } from '../../core/seo/seo.service';
import { FaNumberPipe } from '../../shared/pipes/fa-number.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { BlogApi } from './data-access/blog.api';
import { excerpt } from './data-access/blog.mapper';
import { PostComment } from './data-access/blog.models';
import { BlogPostData } from './data-access/blog.resolvers';
import { CommentFormComponent } from './ui/comment-form.component';
import { CommentListComponent } from './ui/comment-list.component';

const countAll = (comments: readonly PostComment[]): number =>
  comments.reduce((sum, c) => sum + 1 + countAll(c.replies), 0);

@Component({
  selector: 'app-blog-post-page',
  imports: [RouterLink, RelativeTimePipe, FaNumberPipe, CommentListComponent, CommentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let post = data().post;

    <article class="wrap max-w-[48rem] pt-[3rem] pb-10">
      <nav aria-label="مسیر صفحه" class="mb-5 flex gap-2 text-[0.8125rem] text-mut">
        <a routerLink="/" class="hover:text-fg">خانه</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/blog" class="hover:text-fg">وبلاگ</a>
      </nav>

      <h1 class="text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.45] font-black tracking-[-0.02em]">
        {{ post.title }}
      </h1>

      <p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.875rem] text-mut">
        @if (post.author) {
          <span>{{ post.author }}</span>
          <span aria-hidden="true">·</span>
        }
        <time [attr.datetime]="post.publishedAt">{{ post.publishedAt | relativeTime }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ total() | faNumber }} نظر</span>
      </p>

      @if (post.imageUrl) {
        <img
          [src]="post.imageUrl"
          [alt]="post.title"
          fetchpriority="high"
          class="mt-6 max-h-[28rem] w-full rounded-[1.5rem] object-cover"
        />
      }

      <div class="mt-8 text-[1.0625rem] leading-[2.1] whitespace-pre-line">{{ post.description }}</div>
    </article>

    <section class="wrap max-w-[48rem] pb-10" aria-labelledby="comments-title">
      <h2 id="comments-title" class="mb-4 text-[1.375rem] font-black">
        نظرها ({{ total() | faNumber }})
      </h2>

      @if (comments().length) {
        <app-comment-list [comments]="comments()" (reply)="replyTo.set($event)" (remove)="remove($event)" />
      } @else {
        <p class="rounded-[1.25rem] border border-line bg-card p-6 text-center text-mut">
          هنوز نظری ثبت نشده است.
        </p>
      }

      <div class="mt-6" id="comment-form">
        <app-comment-form
          [slug]="post.slug"
          [replyTo]="replyTo()"
          (posted)="refresh()"
          (cancelReply)="replyTo.set(null)"
        />
      </div>
    </section>
  `,
})
export class BlogPostPageComponent {
  /** Provided by the route resolver through component input binding. */
  readonly data = input.required<BlogPostData>();

  private readonly api = inject(BlogApi);

  /** Starts from the resolved comments and is replaced after a comment is posted or deleted. */
  protected readonly comments = linkedSignal(() => this.data().comments);
  protected readonly replyTo = signal<PostComment | null>(null);
  protected readonly total = computed(() => countAll(this.comments()));

  protected refresh(): void {
    this.replyTo.set(null);
    this.api.comments(this.data().post.slug).subscribe((comments) => this.comments.set(comments));
  }

  protected remove(comment: PostComment): void {
    this.api.deleteComment(comment.id).subscribe(() => this.refresh());
  }

  constructor() {
    const seo = inject(SeoService);

    effect(() => {
      const { post } = this.data();
      const url = `${seo.siteUrl}/blog/${post.slug}`;
      const description = excerpt(post.description);

      seo.set({
        title: `${post.title} | ${SITE.name}`,
        description,
        path: `/blog/${post.slug}`,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description,
            url,
            mainEntityOfPage: url,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            inLanguage: 'fa-IR',
            ...(post.imageUrl ? { image: post.imageUrl } : {}),
            author: { '@type': 'Person', name: post.author ?? SITE.name },
            publisher: { '@type': 'Person', name: SITE.name },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: `${seo.siteUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'وبلاگ', item: `${seo.siteUrl}/blog` },
              { '@type': 'ListItem', position: 3, name: post.title, item: url },
            ],
          },
        ],
      });
    });
  }
}
