import { formatPrice } from './pricing';
import type { ProductLike } from './types';

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function productMessage(p: Pick<ProductLike, 'name' | 'price' | 'priceMode'>, pageUrl: string): string {
  const price = formatPrice(p);
  const body =
    price === 'consultar'
      ? `${p.name} que vi en la web, ¿me cuentas el precio? ✦`
      : `${p.name} (${price}) que vi en la web ✦`;
  return `¡Hola! Me interesa este tejido: ${body}\n${pageUrl}`;
}

export function genericMessage(): string {
  return '¡Hola! Vi su web y quiero hacer un pedido ✦';
}
