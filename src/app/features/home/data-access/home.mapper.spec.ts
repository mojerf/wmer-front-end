import { describe, expect, it } from 'vitest';
import { MainPageDto } from './home.dto';
import { toHomeContent } from './home.mapper';

describe('toHomeContent', () => {
  it('maps snake_case DTOs to domain models and trims tags', () => {
    const dto: MainPageDto = {
      works: [
        { id: 1, title: 'W', slug: 'w', image: 'http://x/w.png', tags: [' Angular ', '', 'Laravel'] },
      ],
      posts: [{ id: 2, title: 'P', slug: 'p', image: null, created_at: '۲ روز پیش', comments_count: 3 }],
      products: [{ id: 3, title: 'S', slug: 's', image: null, price: 500, has_discount: true }],
    };

    expect(toHomeContent(dto)).toEqual({
      works: [
        { id: 1, title: 'W', slug: 'w', imageUrl: 'http://x/w.png', tags: ['Angular', 'Laravel'] },
      ],
      posts: [
        { id: 2, title: 'P', slug: 'p', imageUrl: null, publishedLabel: '۲ روز پیش', commentsCount: 3 },
      ],
      products: [{ id: 3, title: 'S', slug: 's', imageUrl: null, price: 500, hasDiscount: true }],
    });
  });

  it('accepts Laravel collections wrapped in { data } and missing sections', () => {
    const dto: MainPageDto = {
      works: { data: [{ id: 1, title: 'W', slug: 'w', image: null, tags: [] }] },
    };
    const result = toHomeContent(dto);
    expect(result.works).toHaveLength(1);
    expect(result.posts).toEqual([]);
    expect(result.products).toEqual([]);
  });
});
