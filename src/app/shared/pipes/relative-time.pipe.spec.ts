import { describe, expect, it } from 'vitest';
import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  const now = Date.parse('2026-11-14T12:00:00Z');
  const pipe = new RelativeTimePipe();
  const ago = (days: number) => new Date(now - days * 86_400_000).toISOString();

  it('says "today" for anything under a day, even slightly in the future', () => {
    expect(pipe.transform(ago(0), now)).toBe('امروز');
    expect(pipe.transform(new Date(now + 5_000).toISOString(), now)).toBe('امروز');
  });

  it('uses days, weeks, months and years', () => {
    expect(pipe.transform(ago(3), now)).toContain('۳');
    expect(pipe.transform(ago(14), now)).toContain('هفته');
    expect(pipe.transform(ago(90), now)).toContain('ماه');
    expect(pipe.transform(ago(800), now)).toContain('سال');
  });

  it('returns an empty string for invalid dates', () => {
    expect(pipe.transform('not a date', now)).toBe('');
  });
});
