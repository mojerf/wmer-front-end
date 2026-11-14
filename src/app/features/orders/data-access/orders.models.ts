export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'در انتظار بررسی',
  processing: 'در حال پردازش',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

/** Tailwind classes for the status badge. */
export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  processing: 'bg-aqua/15 text-aqua',
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  cancelled: 'bg-rose/15 text-rose',
};

export interface OrderLine {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  /** Price at the time of the order, in tomans. */
  price: number;
  /** Only present once the order is completed. */
  downloadLink: string | null;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  /** The customer can pay this order now (it is pending). */
  canPay: boolean;
  lines: readonly OrderLine[];
}
