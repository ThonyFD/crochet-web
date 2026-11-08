// Smoke tests over the built site. Run after `npm run build`.
import { readFileSync } from 'node:fs';
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
