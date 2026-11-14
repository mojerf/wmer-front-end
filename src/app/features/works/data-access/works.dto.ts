/** Response shapes of /api/v1/works and /api/v1/works/{slug}. */
export interface WorkSummaryDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  tags: string[];
  created_at: string;
}

export interface WorkDetailDto extends WorkSummaryDto {
  full_image: string | null;
  timeline: string;
  publish_date: string;
  role: string;
  project_link: string | null;
  overview: string | null;
  learn: string | null;
  description: string;
  updated_at: string;
}
