import { describe, expect, it } from 'vitest';
import { FaNumberPipe } from './fa-number.pipe';

describe('FaNumberPipe', () => {
  it('uses Persian digits and grouping', () => {
    expect(new FaNumberPipe().transform(490000)).toBe('۴۹۰٬۰۰۰');
  });
});
