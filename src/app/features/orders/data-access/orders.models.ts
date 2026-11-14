export { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS } from '../../../shared/models/order-status';
import type { OrderStatus } from '../../../shared/models/order-status';

export type { OrderStatus };

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
