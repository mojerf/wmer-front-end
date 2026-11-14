/** Response shapes of GET /api/v1/main-page (see MainPageController and the *AllResource classes in the back end). */
export interface WorkDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  image_thumb?: string | null;
  tags: string[];
  created_at: string;
}

export interface PostDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  image_thumb?: string | null;
  /** ISO 8601 */
  created_at: string;
  comments_count: number;
}

export interface ProductDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  image_thumb?: string | null;
  /** What the customer pays (already discounted). */
  price: number;
  /** Original price, only for discounted products. */
  old_price: number | null;
  has_discount: boolean;
  created_at: string;
}

/** Laravel serializes a nested resource collection either as a plain array or as `{ data: [...] }`. */
export type Collection<T> = T[] | { data: T[] };

export interface MainPageDto {
  works?: Collection<WorkDto>;
  posts?: Collection<PostDto>;
  products?: Collection<ProductDto>;
}
