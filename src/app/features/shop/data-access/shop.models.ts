export type ShopSort = 'latest' | 'oldest' | 'price_asc' | 'price_desc';

export const SHOP_SORTS: readonly { value: ShopSort; label: string }[] = [
  { value: 'latest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
];

export interface ProductSummary {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Small WebP for cards; falls back to `imageUrl`. */
  thumbUrl?: string | null;
  /** What the customer pays, in tomans. */
  price: number;
  /** Original price, only for discounted products. */
  oldPrice: number | null;
  publishedAt: string;
}

export interface ProductDetail extends ProductSummary {
  author: string | null;
  /** Short plain-text summary. */
  expert: string;
  /** Plain text. Never render it as HTML. */
  description: string;
  updatedAt: string;
}

export interface ShopQuery {
  search: string;
  sort: ShopSort;
  page: number;
}
