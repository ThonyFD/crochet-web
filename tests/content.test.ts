import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';
import { parse } from 'yaml';
import { describe, expect, test } from 'vitest';

const PRODUCTS = 'src/content/products';
const CATEGORIES = 'src/content/categories';

const slugs = () => readdirSync(PRODUCTS).filter((d) => existsSync(join(PRODUCTS, d, 'index.md')));
const fm = (slug: string) => matter(readFileSync(join(PRODUCTS, slug, 'index.md'), 'utf8')).data;

describe('initial catalog', () => {
  test('15 products, without the san valentin orders post', () => {
    expect(slugs()).toHaveLength(15);
    expect(slugs()).not.toContain('pedidos-san-valentin');
  });

  test('every product is valid and its photos exist', () => {
    const cats = readdirSync(CATEGORIES).map((f) => f.replace(/\.yml$/, ''));
    for (const slug of slugs()) {
      const d = fm(slug);
      expect(d.name, slug).toBeTruthy();
      expect(['fijo', 'desde', 'consultar'], slug).toContain(d.priceMode);
      expect(cats, slug).toContain(d.category);
      expect(d.photos.length, slug).toBeGreaterThan(0);
      for (const photo of d.photos) expect(existsSync(join(PRODUCTS, slug, photo)), `${slug} ${photo}`).toBe(true);
    }
  });

  test('featured products match the mockup', () => {
    const featured = slugs().filter((s) => fm(s).featured === true).sort();
    expect(featured).toEqual(['cosmic-kitty', 'ovejita', 'ramo-rosas-san-valentin']);
  });

  test('price on request products have no price', () => {
    for (const slug of ['ramo-de-rosas', 'amigurumi-y-mono']) {
      expect(fm(slug).priceMode).toBe('consultar');
      expect(fm(slug).price).toBeUndefined();
    }
  });

  test('ficha only states what the post says', () => {
    expect(fm('serpientita-de-colores').availability).toBe('entrega inmediata');
    expect(fm('ovejita').availability).toBe('entrega inmediata');
    expect(fm('cosmic-kitty').availability).toBeUndefined();
    expect(fm('cosmic-kitty').customizable).toBeUndefined();
  });

  test('site settings', () => {
    const site = parse(readFileSync('src/content/settings/site.yml', 'utf8'));
    expect(site.whatsapp).toBe('50765839292');
    expect(site.instagram).toBe('https://www.instagram.com/starsandstuffcrochet/');
    expect(existsSync(join(dirname('src/content/settings/site.yml'), site.aboutPhoto))).toBe(true);
  });
});
