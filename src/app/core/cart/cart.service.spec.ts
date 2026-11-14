import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CartItem, CartService } from './cart.service';

const item = (id: number, price = 1000): CartItem => ({
  id,
  slug: `p-${id}`,
  title: `محصول ${id}`,
  price,
  imageUrl: null,
});

describe('CartService', () => {
  beforeEach(() => localStorage.clear());

  it('adds each product once and totals the prices', () => {
    const cart = TestBed.inject(CartService);

    cart.add(item(1, 500));
    cart.add(item(1, 500));
    cart.add(item(2, 700));

    expect(cart.count()).toBe(2);
    expect(cart.total()).toBe(1200);
    expect(cart.has(2)).toBe(true);
  });

  it('removes items and clears the cart', () => {
    const cart = TestBed.inject(CartService);
    cart.add(item(1));
    cart.add(item(2));

    cart.remove(1);
    expect(cart.items().map((i) => i.id)).toEqual([2]);

    cart.clear();
    expect(cart.count()).toBe(0);
  });

  it('persists to localStorage', () => {
    const cart = TestBed.inject(CartService);
    cart.add(item(3));
    TestBed.tick();

    expect(JSON.parse(localStorage.getItem('wmer.cart') ?? '[]')).toHaveLength(1);
  });

  it('restores a saved cart and drops malformed entries', () => {
    localStorage.setItem(
      'wmer.cart',
      JSON.stringify([item(1), { id: 'x' }, null, { ...item(2), price: 'free' }, item(3)]),
    );

    const cart = TestBed.inject(CartService);

    expect(cart.items().map((i) => i.id)).toEqual([1, 3]);
  });

  it('survives corrupted storage', () => {
    localStorage.setItem('wmer.cart', '{not json');

    expect(TestBed.inject(CartService).count()).toBe(0);
  });
});
