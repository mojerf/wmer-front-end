import { Collection, MainPageDto } from './home.dto';
import { HomeContent } from './home.models';

const items = <T>(collection: Collection<T> | undefined): T[] =>
  Array.isArray(collection) ? collection : (collection?.data ?? []);

export function toHomeContent(dto: MainPageDto): HomeContent {
  return {
    works: items(dto.works).map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      imageUrl: w.image,
      thumbUrl: w.image_thumb ?? w.image,
      tags: w.tags.map((t) => t.trim()).filter(Boolean),
    })),
    posts: items(dto.posts).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      imageUrl: p.image,
      thumbUrl: p.image_thumb ?? p.image,
      publishedAt: p.created_at,
      commentsCount: p.comments_count,
    })),
    products: items(dto.products).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      imageUrl: p.image,
      thumbUrl: p.image_thumb ?? p.image,
      price: p.price,
      oldPrice: p.has_discount ? p.old_price : null,
    })),
  };
}
