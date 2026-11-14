export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** ISO 8601 */
  publishedAt: string;
  commentsCount: number;
}

export interface PostDetail extends PostSummary {
  author: string | null;
  /** Plain text. Never render it as HTML. */
  description: string;
  updatedAt: string;
}

export interface PostComment {
  id: number;
  authorName: string;
  body: string;
  createdAt: string;
  /** The API says the signed-in user may delete it (their own comment, or an administrator). */
  canDelete: boolean;
  replies: readonly PostComment[];
}

export interface PostListQuery {
  search: string;
  page: number;
}
