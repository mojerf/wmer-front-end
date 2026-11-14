import { OrderDto } from './orders.dto';
import { Order } from './orders.models';

/** Only https links are ever turned into download links (a poisoned value could not become `javascript:`). */
const safeDownload = (url: string | null): string | null =>
  url !== null && /^https:\/\//i.test(url) ? url : null;

export const toOrder = (dto: OrderDto): Order => ({
  id: dto.id,
  status: dto.status,
  total: dto.total_price,
  createdAt: dto.created_at,
  canPay: dto.can_pay ?? false,
  lines: dto.products.map((line) => ({
    id: line.id,
    title: line.title,
    slug: line.slug,
    imageUrl: line.image,
    price: line.price,
    downloadLink: safeDownload(line.download_link),
  })),
});
