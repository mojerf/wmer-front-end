import { describe, expect, it } from 'vitest';
import { CommentDto, PostDetailDto, PostSummaryDto } from './blog.dto';
import { excerpt, toPostComment, toPostDetail, toPostSummary } from './blog.mapper';

describe('blog mappers', () => {
  it('maps a post summary', () => {
    const dto: PostSummaryDto = {
      id: 1,
      title: 'T',
      slug: 't',
      image: null,
      created_at: '2026-01-01T00:00:00+00:00',
      comments_count: 4,
    };
    expect(toPostSummary(dto)).toEqual({
      id: 1,
      title: 'T',
      slug: 't',
      imageUrl: null,
      publishedAt: '2026-01-01T00:00:00+00:00',
      commentsCount: 4,
    });
  });

  it('maps a post detail with author and update time', () => {
    const dto: PostDetailDto = {
      id: 2,
      title: 'D',
      slug: 'd',
      image: 'http://x/i.png',
      author: 'مجتبی',
      description: 'متن',
      comments_count: 0,
      created_at: '2026-01-01T00:00:00+00:00',
      updated_at: '2026-01-02T00:00:00+00:00',
    };
    const post = toPostDetail(dto);
    expect(post.author).toBe('مجتبی');
    expect(post.updatedAt).toBe('2026-01-02T00:00:00+00:00');
    expect(post.imageUrl).toBe('http://x/i.png');
  });

  it('maps nested replies and tolerates a missing replies key', () => {
    const dto: CommentDto = {
      id: 1,
      author_name: 'علی',
      parent_id: null,
      body: 'سلام',
      created_at: '2026-01-01T00:00:00+00:00',
      can_delete: false,
      replies: [
        {
          id: 2,
          author_name: 'رضا',
          parent_id: 1,
          body: 'جواب',
          created_at: '2026-01-02T00:00:00+00:00',
          can_delete: false,
        },
      ],
    };
    const comment = toPostComment(dto);
    expect(comment.replies).toHaveLength(1);
    expect(comment.replies[0]?.replies).toEqual([]);
  });

  it('builds a one-line excerpt', () => {
    expect(excerpt('a\n\n  b   c')).toBe('a b c');
    expect(excerpt('x'.repeat(300), 50)).toHaveLength(50);
    expect(excerpt('x'.repeat(300), 50).endsWith('…')).toBe(true);
  });
});
