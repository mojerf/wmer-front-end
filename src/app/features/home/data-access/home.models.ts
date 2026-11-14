/** Domain models for the home page. They are independent of the Laravel response shapes (see home.dto.ts). */
export interface Work {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  tags: readonly string[];
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** ISO 8601 publish time. */
  publishedAt: string;
  commentsCount: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Final price in tomans (already discounted when `oldPrice` is set). */
  price: number;
  /** Original price, only for discounted products. */
  oldPrice: number | null;
}

export interface HomeContent {
  works: readonly Work[];
  posts: readonly Post[];
  products: readonly Product[];
}
