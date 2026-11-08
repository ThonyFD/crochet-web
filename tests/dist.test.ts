// Smoke tests over the built site. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';

const page = (path: string) => parse(readFileSync(`dist/${path}`, 'utf8'));
const raw = (path: string) => readFileSync(`dist/${path}`, 'utf8');

describe('home', () => {
  const home = page('index.html');

  test('h1 reads as real text with decorative letters', () => {
    const h1 = home.querySelector('h1')!;
    expect(h1.querySelector('.sr-only')!.text).toBe('Stars & Stuff');
    expect(h1.querySelector('[aria-hidden="true"]')!.querySelectorAll('.cut').length).toBeGreaterThan(5);
  });

  test('catalog has 15 cards linking to product pages', () => {
    const cards = home.querySelectorAll('#tejidos [data-category]');
    expect(cards).toHaveLength(15);
    for (const card of cards) {
      expect(card.querySelector('a[href^="/tejidos/"]')!.getAttribute('href')).toMatch(/^\/tejidos\/[a-z0-9-]+\/$/);
    }
  });

  test('filters: todo + 6 categories', () => {
    const pills = home.querySelectorAll('#tejidos .pill');
    expect(pills.map((p) => p.text.trim())).toEqual(['todo', 'amigurumis', 'flores', 'llaveros', 'accesorios', 'hogar', 'temporada']);
  });

  test('whatsapp and instagram links', () => {
    expect(home.querySelectorAll('a[href^="https://wa.me/50765839292?text="]').length).toBeGreaterThan(0);
    expect(home.querySelector('a[href="https://www.instagram.com/starsandstuffcrochet/"]')).not.toBeNull();
  });

  test('no em dash anywhere', () => {
    expect(raw('index.html')).not.toContain('—');
  });
});

describe('product pages', () => {
  const productDirs = readdirSync('src/content/products').filter((d) => existsSync(`src/content/products/${d}/index.md`));
  const visible = productDirs.filter(
    (d) => matter(readFileSync(`src/content/products/${d}/index.md`, 'utf8')).data.visible !== false,
  );
  const waText = (path: string) =>
    decodeURIComponent(page(path).querySelector('.order a[href^="https://wa.me/"]')!.getAttribute('href')!.split('?text=')[1]);

  test('one page per visible product', () => {
    const built = readdirSync('dist/tejidos').filter((d) => existsSync(`dist/tejidos/${d}/index.html`));
    expect(built.sort()).toEqual(visible.sort());
  });

  test('peluche ovejita shows price, ficha and order message', () => {
    const html = raw('tejidos/peluche-ovejita/index.html');
    expect(html).toContain('desde $35');
    expect(html).toContain('28 × 15 × 10 cm');
    expect(html).toContain('Personalizable');
    expect(waText('tejidos/peluche-ovejita/index.html')).toContain('Peluche Ovejita (desde $35)');
  });

  test('ficha hides what the post does not say', () => {
    const ficha = page('tejidos/cosmic-kitty/index.html').querySelector('.ficha')!.text;
    expect(ficha).not.toContain('Disponible');
    expect(ficha).not.toContain('Personalizable');
  });

  test('price on request asks for the price', () => {
    const msg = waText('tejidos/ramo-de-rosas/index.html');
    expect(msg).toContain('¿me cuentas el precio?');
    expect(msg).not.toContain('($');
  });

  test('4 related products, never itself', () => {
    for (const slug of visible) {
      const links = page(`tejidos/${slug}/index.html`)
        .querySelectorAll('.related [data-category] a[href^="/tejidos/"]')
        .map((a) => a.getAttribute('href'));
      expect(links, slug).toHaveLength(4);
      expect(links, slug).not.toContain(`/tejidos/${slug}/`);
    }
  });

  test('no em dash on product pages', () => {
    for (const slug of visible) expect(raw(`tejidos/${slug}/index.html`)).not.toContain('—');
  });
});
