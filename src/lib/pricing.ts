import type { ProductLike } from './types';

function money(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export function formatPrice(p: Pick<ProductLike, 'price' | 'priceMode'>): string {
  if (p.priceMode === 'consultar' || p.price === undefined || p.price === null) return 'consultar';
  return p.priceMode === 'desde' ? `desde ${money(p.price)}` : money(p.price);
}
