/** Response shapes of /api/v1/products and /api/v1/products/{slug}. */
export interface ProductSummaryDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  image_thumb?: string | null;
  price: number;
  old_price: number | null;
  has_discount: boolean;
  created_at: string;
}

export interface ProductDetailDto extends ProductSummaryDto {
  author: string | null;
  expert: string;
  description: string;
  updated_at: string;
}
