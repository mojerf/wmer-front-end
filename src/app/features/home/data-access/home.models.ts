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
  /** Human-readable publish time as provided by the API, e.g. "۳ روز پیش". */
  publishedLabel: string;
  commentsCount: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Final price in tomans (already discounted when `hasDiscount` is true). */
  price: number;
  hasDiscount: boolean;
}

export interface HomeContent {
  works: readonly Work[];
  posts: readonly Post[];
  products: readonly Product[];
}
