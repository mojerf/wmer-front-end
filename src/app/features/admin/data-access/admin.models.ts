import { OrderStatus } from '../../../shared/models/order-status';

export type ContentType = 'works' | 'posts' | 'products';

export interface AdminStats {
  counts: Record<'users' | 'works' | 'posts' | 'products' | 'orders' | 'contacts', number>;
  ordersByStatus: Record<OrderStatus, number>;
  revenue: number;
}

export interface ContentRow {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface AdminOrder {
  id: number;
  buyer: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  products: readonly string[];
  allowedStatuses: readonly OrderStatus[];
}

export interface AdminContact {
  id: number;
  email: string;
  phoneNumber: string | null;
  title: string;
  text: string;
  createdAt: string;
}

export type FieldKind = 'text' | 'number' | 'url' | 'textarea' | 'image';

export interface ContentField {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Left-to-right content (slugs, links, numbers). */
  ltr?: boolean;
}

export interface ContentSchema {
  type: ContentType;
  singular: string;
  plural: string;
  fields: readonly ContentField[];
}

const slug: ContentField = { name: 'slug', label: 'نشانی (slug)', kind: 'text', required: true, ltr: true };

/** What each content type's form asks for. Mirrors the back end's Form Requests. */
export const CONTENT_SCHEMAS: Record<ContentType, ContentSchema> = {
  works: {
    type: 'works',
    singular: 'نمونه‌کار',
    plural: 'نمونه‌کارها',
    fields: [
      { name: 'title', label: 'عنوان', kind: 'text', required: true },
      slug,
      { name: 'timeline', label: 'بازه‌ی زمانی', kind: 'text', required: true },
      { name: 'publish_date', label: 'تاریخ انتشار', kind: 'text', required: true },
      { name: 'role', label: 'نقش من', kind: 'text', required: true },
      { name: 'tags', label: 'برچسب‌ها (با کاما جدا کنید)', kind: 'text', required: true },
      { name: 'project_link', label: 'لینک پروژه', kind: 'url', ltr: true },
      { name: 'overview', label: 'نمای کلی', kind: 'textarea' },
      { name: 'learn', label: 'چه آموختم', kind: 'textarea' },
      { name: 'description', label: 'توضیحات', kind: 'textarea', required: true },
      { name: 'image', label: 'تصویر شاخص', kind: 'image', required: true },
      { name: 'full_image', label: 'تصویر کامل', kind: 'image' },
    ],
  },
  posts: {
    type: 'posts',
    singular: 'نوشته',
    plural: 'نوشته‌ها',
    fields: [
      { name: 'title', label: 'عنوان', kind: 'text', required: true },
      slug,
      { name: 'description', label: 'متن', kind: 'textarea', required: true },
      { name: 'image', label: 'تصویر شاخص', kind: 'image', required: true },
    ],
  },
  products: {
    type: 'products',
    singular: 'محصول',
    plural: 'محصولات',
    fields: [
      { name: 'title', label: 'عنوان', kind: 'text', required: true },
      slug,
      { name: 'price', label: 'قیمت (تومان)', kind: 'number', required: true, ltr: true },
      { name: 'price_with_discount', label: 'قیمت با تخفیف (اختیاری)', kind: 'number', ltr: true },
      { name: 'expert', label: 'خلاصه', kind: 'text', required: true },
      { name: 'description', label: 'توضیحات', kind: 'textarea', required: true },
      { name: 'download_link', label: 'لینک دانلود (https)', kind: 'url', ltr: true },
      { name: 'image', label: 'تصویر', kind: 'image', required: true },
    ],
  },
};

export const isContentType = (value: unknown): value is ContentType =>
  typeof value === 'string' && Object.hasOwn(CONTENT_SCHEMAS, value);
