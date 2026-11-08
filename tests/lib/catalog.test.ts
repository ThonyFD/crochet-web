import { describe, expect, test } from 'vitest';
import { featuredProducts, fichaRows, relatedProducts, usedCategories, visibleSorted } from '../../src/lib/catalog';
import type { ProductLike } from '../../src/lib/types';

const p = (over: Partial<ProductLike> & Pick<ProductLike, 'id'>): ProductLike => ({
  name: over.id,
  category: 'amigurumis',
  priceMode: 'fijo',
  price: 10,
  featured: false,
  visible: true,
  order: 100,
  ...over,
});

const all = [
  p({ id: 'b', name: 'Bolso', category: 'accesorios', order: 3 }),
  p({ id: 'a', name: 'Ardilla', order: 1 }),
  p({ id: 'oculto', order: 0, visible: false, featured: true }),
  p({ id: 'c', name: 'Corona', category: 'temporada', order: 2, featured: true }),
  p({ id: 'd', name: 'Dino', order: 3 }),
  p({ id: 'oculto2', category: 'accesorios', order: 4, visible: false }),
];

describe('visibleSorted', () => {
  test('drops hidden, sorts by order then name', () => {
    expect(visibleSorted(all).map((x) => x.id)).toEqual(['a', 'c', 'b', 'd']);
  });
});

describe('featuredProducts', () => {
  test('featured first, then fill by order, never hidden', () => {
    expect(featuredProducts(all).map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });

  test('no featured falls back to first visible', () => {
    const none = all.map((x) => ({ ...x, featured: false }));
    expect(featuredProducts(none).map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('relatedProducts', () => {
  test('same category first, excludes self and hidden, max 4', () => {
    const current = all.find((x) => x.id === 'a')!;
    const rel = relatedProducts(current, all);
    expect(rel.map((x) => x.id)).toEqual(['d', 'c', 'b']);
    expect(rel.length).toBeLessThanOrEqual(4);
  });

  test('caps at n', () => {
    const many = Array.from({ length: 8 }, (_, i) => p({ id: `x${i}`, order: i }));
    expect(relatedProducts(many[0], many)).toHaveLength(4);
  });
});

describe('usedCategories', () => {
  test('only categories with visible products, by order', () => {
    const cats = [
      { id: 'temporada', label: 'temporada', order: 6 },
      { id: 'amigurumis', label: 'amigurumis', order: 1 },
      { id: 'accesorios', label: 'accesorios', order: 4 },
      { id: 'flores', label: 'flores', order: 2 },
    ];
    const visibleOnlyHiddenAcc = all.filter((x) => x.id !== 'b');
    expect(usedCategories(cats, visibleOnlyHiddenAcc).map((c) => c.id)).toEqual(['amigurumis', 'temporada']);
  });
});

describe('fichaRows', () => {
  test('all fields in fixed order', () => {
    const full = p({
      id: 'x',
      measures: '28 × 15 × 10 cm',
      colors: 'por pedido',
      customizable: true,
      shipping: 'todo Panamá',
      availability: 'entrega inmediata',
    });
    expect(fichaRows(full)).toEqual([
      { label: 'Medidas', value: '28 × 15 × 10 cm' },
      { label: 'Colores', value: 'por pedido' },
      { label: 'Personalizable', value: 'sí ✓' },
      { label: 'Envíos', value: 'todo Panamá' },
      { label: 'Disponible', value: 'entrega inmediata' },
    ]);
  });

  test('customizable false shows no', () => {
    expect(fichaRows(p({ id: 'x', customizable: false }))).toEqual([{ label: 'Personalizable', value: 'no' }]);
  });

  test('empty and undefined are omitted', () => {
    expect(fichaRows(p({ id: 'x', measures: '', colors: '  ' }))).toEqual([]);
  });
});
