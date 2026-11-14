import { ApiError } from './api.interceptors';

/** The first validation message Laravel returned for a form field (HTTP 422), if any. */
export function fieldError(error: unknown, field: string): string | null {
  return error instanceof ApiError ? (error.fieldErrors[field]?.[0] ?? null) : null;
}

/** A user-facing sentence for a failed API call (used when no field-specific message applies). */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.';
  }
  switch (error.status) {
    case 0:
      return 'اتصال به سرور برقرار نشد.';
    case 401:
    case 403:
      return error.message;
    case 419:
      return 'نشست شما منقضی شده است؛ صفحه را دوباره بارگذاری کنید.';
    case 429:
      return 'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.';
    default:
      return error.status >= 500 ? 'مشکلی در سرور رخ داد؛ کمی بعد دوباره تلاش کنید.' : error.message;
  }
}
