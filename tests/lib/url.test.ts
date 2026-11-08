import { expect, test } from 'vitest';
import { normalizeUrl } from '../../src/lib/url';

test('adds https when the owner types a bare domain', () => {
  expect(normalizeUrl('instagram.com/starsandstuffcrochet')).toBe('https://instagram.com/starsandstuffcrochet');
  expect(normalizeUrl('  www.instagram.com/x/ ')).toBe('https://www.instagram.com/x/');
});

test('keeps full urls', () => {
  expect(normalizeUrl('https://www.instagram.com/starsandstuffcrochet/')).toBe('https://www.instagram.com/starsandstuffcrochet/');
  expect(normalizeUrl('http://x.dev')).toBe('http://x.dev');
});
