import { describe, expect, it } from 'vitest';
import { MainPageDto } from './home.dto';
import { toHomeContent } from './home.mapper';

describe('toHomeContent', () => {
  it('maps snake_case DTOs to domain models and trims tags', () => {
    const dto: MainPageDto = {
      works: [
        {
          id: 1,
          title: 'W',
          slug: 'w',
          image: 'http://x/w.png',
          tags: [' Angular ', '', 'Laravel'],
          created_at: '2026-01-01T00:00:00+00:00',
        },
      ],
      posts: [
        { id: 2, title: 'P', slug: 'p', image: null, created_at: '2026-02-01T00:00:00+00:00', comments_count: 3 },
      ],
      products: [
        {
          id: 3,
          title: 'S',
          slug: 's',
          image: null,
          price: 500,
          old_price: 900,
          has_discount: true,
          created_at: '2026-03-01T00:00:00+00:00',
        },
      ],
    };

    expect(toHomeContent(dto)).toEqual({
      works: [
        { id: 1, title: 'W', slug: 'w', imageUrl: 'http://x/w.png', tags: ['Angular', 'Laravel'] },
      ],
      posts: [
        {
          id: 2,
          title: 'P',
          slug: 'p',
          imageUrl: null,
          publishedAt: '2026-02-01T00:00:00+00:00',
          commentsCount: 3,
        },
      ],
      products: [{ id: 3, title: 'S', slug: 's', imageUrl: null, price: 500, oldPrice: 900 }],
    });
  });

  it('drops the old price when the product is not discounted', () => {
    const dto: MainPageDto = {
      products: [
        {
          id: 1,
          title: 'S',
          slug: 's',
          image: null,
          price: 500,
          old_price: 500,
          has_discount: false,
          created_at: '2026-03-01T00:00:00+00:00',
        },
      ],
    };

    expect(toHomeContent(dto).products[0]?.oldPrice).toBeNull();
  });

  it('accepts Laravel collections wrapped in { data } and missing sections', () => {
    const dto: MainPageDto = {
      works: { data: [{ id: 1, title: 'W', slug: 'w', image: null, tags: [], created_at: '2026-01-01T00:00:00Z' }] },
    };
    const result = toHomeContent(dto);
    expect(result.works).toHaveLength(1);
    expect(result.posts).toEqual([]);
    expect(result.products).toEqual([]);
  });
});
