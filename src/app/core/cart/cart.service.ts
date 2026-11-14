import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  /** Price shown when the item was added. The server always prices the order itself. */
  price: number;
  imageUrl: string | null;
}

const STORAGE_KEY = 'wmer.cart';
const MAX_ITEMS = 50;

const isCartItem = (value: unknown): value is CartItem => {
  const item = value as Partial<CartItem> | null;
  return (
    typeof item === 'object' &&
    item !== null &&
    Number.isInteger(item.id) &&
    typeof item.slug === 'string' &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    (item.imageUrl === null || typeof item.imageUrl === 'string')
  );
};

/** The shopping cart: digital products only, so each product can be in it once. Kept in localStorage. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage ?? null;
  private readonly state = signal<readonly CartItem[]>(this.load());

  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.state().length);
  readonly total = computed(() => this.state().reduce((sum, item) => sum + item.price, 0));

  constructor() {
    effect(() => {
      const items = this.state();
      try {
        this.storage?.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* storage can be blocked or full; the cart still works for this visit */
      }
    });
  }

  has(id: number): boolean {
    return this.state().some((item) => item.id === id);
  }

  add(item: CartItem): void {
    if (!this.has(item.id) && this.state().length < MAX_ITEMS) {
      this.state.update((items) => [...items, item]);
    }
  }

  remove(id: number): void {
    this.state.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    this.state.set([]);
  }

  private load(): readonly CartItem[] {
    try {
      const parsed: unknown = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter(isCartItem).slice(0, MAX_ITEMS) : [];
    } catch {
      return [];
    }
  }
}
