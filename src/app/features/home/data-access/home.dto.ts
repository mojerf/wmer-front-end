/** Response shapes of GET /api/main-page (see MainPageController and the *AllResource classes in the back end). */
export interface WorkDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  tags: string[];
}

export interface PostDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  created_at: string;
  comments_count: number;
}

export interface ProductDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  has_discount: boolean;
}

/** Laravel serializes a nested resource collection either as a plain array or as `{ data: [...] }`. */
export type Collection<T> = T[] | { data: T[] };

export interface MainPageDto {
  works?: Collection<WorkDto>;
  posts?: Collection<PostDto>;
  products?: Collection<ProductDto>;
}
