import { describe, expect, test } from 'vitest';
import { formatPrice } from '../../src/lib/pricing';

describe('formatPrice', () => {
  test('fixed prices drop trailing zeros', () => {
    expect(formatPrice({ price: 15, priceMode: 'fijo' })).toBe('$15');
    expect(formatPrice({ price: 35.0, priceMode: 'fijo' })).toBe('$35');
    expect(formatPrice({ price: 5.5, priceMode: 'fijo' })).toBe('$5.50');
  });

  test('"desde" prefix', () => {
    expect(formatPrice({ price: 25, priceMode: 'desde' })).toBe('desde $25');
  });

  test('consultar ignores any price', () => {
    expect(formatPrice({ priceMode: 'consultar' })).toBe('consultar');
    expect(formatPrice({ price: 20, priceMode: 'consultar' })).toBe('consultar');
  });

  test('missing price does not break', () => {
    expect(formatPrice({ priceMode: 'fijo' })).toBe('consultar');
  });
});
