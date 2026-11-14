import { ProductDetailDto, ProductSummaryDto } from './shop.dto';
import { ProductDetail, ProductSummary } from './shop.models';

export const toProductSummary = (dto: ProductSummaryDto): ProductSummary => ({
  id: dto.id,
  title: dto.title,
  slug: dto.slug,
  imageUrl: dto.image,
  thumbUrl: dto.image_thumb ?? dto.image,
  price: dto.price,
  oldPrice: dto.has_discount ? dto.old_price : null,
  publishedAt: dto.created_at,
});

export const toProductDetail = (dto: ProductDetailDto): ProductDetail => ({
  ...toProductSummary(dto),
  author: dto.author,
  expert: dto.expert,
  description: dto.description,
  updatedAt: dto.updated_at,
});
