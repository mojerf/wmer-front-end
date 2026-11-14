/** Response shape of the order endpoints (see OrderResource in the back end). */
export interface OrderLineDto {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  download_link: string | null;
}

export interface OrderDto {
  id: number;
  products: OrderLineDto[];
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  /** The signed-in customer can pay this order now. */
  can_pay?: boolean;
}
