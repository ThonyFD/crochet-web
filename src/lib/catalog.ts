import type { CategoryLike, FichaRow, ProductLike } from './types';

const byOrderThenName = (a: ProductLike, b: ProductLike) =>
  a.order - b.order || a.name.localeCompare(b.name, 'es');

export function visibleSorted<T extends ProductLike>(all: T[]): T[] {
  return all.filter((p) => p.visible).sort(byOrderThenName);
}

export function featuredProducts<T extends ProductLike>(all: T[], n = 3): T[] {
  const visible = visibleSorted(all);
  const featured = visible.filter((p) => p.featured);
  const rest = visible.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, n);
}

export function relatedProducts<T extends ProductLike>(current: T, all: T[], n = 4): T[] {
  const others = visibleSorted(all).filter((p) => p.id !== current.id);
  const same = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...same, ...rest].slice(0, n);
}

export function usedCategories<C extends CategoryLike>(cats: C[], products: ProductLike[]): C[] {
  const used = new Set(products.filter((p) => p.visible).map((p) => p.category));
  return cats.filter((c) => used.has(c.id)).sort((a, b) => a.order - b.order);
}

const filled = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export function fichaRows(p: ProductLike): FichaRow[] {
  const rows: [string, string | undefined][] = [
    ['Medidas', filled(p.measures)],
    ['Colores', filled(p.colors)],
    ['Personalizable', p.customizable === undefined ? undefined : p.customizable ? 'sí ✓' : 'no'],
    ['Envíos', filled(p.shipping)],
    ['Disponible', filled(p.availability)],
  ];
  return rows.filter((r): r is [string, string] => r[1] !== undefined).map(([label, value]) => ({ label, value }));
}
