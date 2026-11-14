/** Response shapes of /api/v1/posts, /api/v1/posts/{slug} and /api/v1/posts/{slug}/comments. */
export interface PostSummaryDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  created_at: string;
  comments_count: number;
}

export interface PostDetailDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  author: string | null;
  description: string;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentDto {
  id: number;
  author_name: string;
  parent_id: number | null;
  body: string;
  created_at: string;
  can_delete: boolean;
  replies?: CommentDto[];
}
