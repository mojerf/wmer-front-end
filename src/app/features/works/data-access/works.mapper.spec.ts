import { describe, expect, it } from 'vitest';
import { WorkDetailDto } from './works.dto';
import { toWorkDetail, toWorkSummary } from './works.mapper';

const dto = (overrides: Partial<WorkDetailDto> = {}): WorkDetailDto => ({
  id: 1,
  title: 'پروژه',
  slug: 'project',
  image: null,
  tags: [' Angular ', '', 'Laravel'],
  created_at: '2026-01-01T00:00:00+00:00',
  full_image: 'http://x/full.png',
  timeline: 'بهار',
  publish_date: 'تابستان',
  role: 'توسعه‌دهنده',
  project_link: 'https://example.com/p',
  overview: null,
  learn: null,
  description: 'متن',
  updated_at: '2026-01-02T00:00:00+00:00',
  ...overrides,
});

describe('works mappers', () => {
  it('maps a summary and cleans the tags', () => {
    expect(toWorkSummary(dto())).toEqual({
      id: 1,
      title: 'پروژه',
      slug: 'project',
      imageUrl: null,
      tags: ['Angular', 'Laravel'],
      publishedAt: '2026-01-01T00:00:00+00:00',
    });
  });

  it('maps a detail and keeps https project links', () => {
    const work = toWorkDetail(dto());

    expect(work).toMatchObject({
      fullImageUrl: 'http://x/full.png',
      publishDate: 'تابستان',
      role: 'توسعه‌دهنده',
      projectLink: 'https://example.com/p',
      updatedAt: '2026-01-02T00:00:00+00:00',
    });
  });

  it.each(['javascript:alert(1)', 'http://insecure.test', 'data:text/html,x', null])(
    'drops the unsafe project link %s',
    (link) => {
      expect(toWorkDetail(dto({ project_link: link })).projectLink).toBeNull();
    },
  );
});
