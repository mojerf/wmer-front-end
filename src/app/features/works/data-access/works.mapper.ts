import { WorkDetailDto, WorkSummaryDto } from './works.dto';
import { WorkDetail, WorkSummary } from './works.models';

const httpsOnly = (url: string | null): string | null =>
  url !== null && /^https:\/\//i.test(url) ? url : null;

export const toWorkSummary = (dto: WorkSummaryDto): WorkSummary => ({
  id: dto.id,
  title: dto.title,
  slug: dto.slug,
  imageUrl: dto.image,
  tags: dto.tags.map((t) => t.trim()).filter(Boolean),
  publishedAt: dto.created_at,
});

export const toWorkDetail = (dto: WorkDetailDto): WorkDetail => ({
  ...toWorkSummary(dto),
  fullImageUrl: dto.full_image,
  timeline: dto.timeline,
  publishDate: dto.publish_date,
  role: dto.role,
  projectLink: httpsOnly(dto.project_link),
  overview: dto.overview,
  learn: dto.learn,
  description: dto.description,
  updatedAt: dto.updated_at,
});
