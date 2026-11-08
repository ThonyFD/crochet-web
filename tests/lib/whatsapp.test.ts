import { describe, expect, test } from 'vitest';
import { genericMessage, productMessage, whatsappUrl } from '../../src/lib/whatsapp';

describe('whatsappUrl', () => {
  test('keeps only digits of the phone', () => {
    expect(whatsappUrl('+507 6583-9292', 'hola')).toBe('https://wa.me/50765839292?text=hola');
  });

  test('encodes accents, ampersands and quotes', () => {
    expect(whatsappUrl('50765839292', 'Ñandú & "rosas" ✦')).toBe(
      'https://wa.me/50765839292?text=' + encodeURIComponent('Ñandú & "rosas" ✦'),
    );
  });
});

describe('messages', () => {
  test('product with price', () => {
    expect(
      productMessage({ name: 'Cosmic Kitty', price: 15, priceMode: 'fijo' }, 'https://x.dev/tejidos/cosmic-kitty/'),
    ).toBe('¡Hola! Me interesa este tejido: Cosmic Kitty ($15) que vi en la web ✦\nhttps://x.dev/tejidos/cosmic-kitty/');
  });

  test('product without price asks for it', () => {
    expect(
      productMessage({ name: 'Ramo de rosas', priceMode: 'consultar' }, 'https://x.dev/tejidos/ramo-de-rosas/'),
    ).toBe(
      '¡Hola! Me interesa este tejido: Ramo de rosas que vi en la web, ¿me cuentas el precio? ✦\nhttps://x.dev/tejidos/ramo-de-rosas/',
    );
  });

  test('generic', () => {
    expect(genericMessage()).toBe('¡Hola! Vi su web y quiero hacer un pedido ✦');
  });
});
