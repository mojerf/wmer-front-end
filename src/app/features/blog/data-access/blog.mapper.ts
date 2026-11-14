import { CommentDto, PostDetailDto, PostSummaryDto } from './blog.dto';
import { PostComment, PostDetail, PostSummary } from './blog.models';

export const toPostSummary = (dto: PostSummaryDto): PostSummary => ({
  id: dto.id,
  title: dto.title,
  slug: dto.slug,
  imageUrl: dto.image,
  thumbUrl: dto.image_thumb ?? dto.image,
  publishedAt: dto.created_at,
  commentsCount: dto.comments_count,
});

export const toPostDetail = (dto: PostDetailDto): PostDetail => ({
  id: dto.id,
  title: dto.title,
  slug: dto.slug,
  imageUrl: dto.image,
  publishedAt: dto.created_at,
  commentsCount: dto.comments_count,
  author: dto.author,
  description: dto.description,
  updatedAt: dto.updated_at,
});

export const toPostComment = (dto: CommentDto): PostComment => ({
  id: dto.id,
  authorName: dto.author_name,
  body: dto.body,
  createdAt: dto.created_at,
  canDelete: dto.can_delete,
  replies: (dto.replies ?? []).map(toPostComment),
});

/** A short plain-text excerpt for meta descriptions and structured data. */
export function excerpt(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
