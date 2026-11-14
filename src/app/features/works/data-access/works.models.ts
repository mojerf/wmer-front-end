export interface WorkSummary {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Small WebP for cards; falls back to `imageUrl`. */
  thumbUrl?: string | null;
  tags: readonly string[];
  publishedAt: string;
}

export interface WorkDetail extends WorkSummary {
  fullImageUrl: string | null;
  timeline: string;
  publishDate: string;
  role: string;
  /** Only https links are kept. */
  projectLink: string | null;
  overview: string | null;
  learn: string | null;
  /** Plain text. Never render it as HTML. */
  description: string;
  updatedAt: string;
}

export interface WorksQuery {
  search: string;
  tag: string;
  page: number;
}
