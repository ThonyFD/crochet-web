// One-shot: turns the Instagram export in starsandstuffcrochet-posts/ into content collection entries.
// Idempotent: rewrites the same files on every run. Only states what each post says.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';

const SRC = 'starsandstuffcrochet-posts/fotos';
const OUT = 'src/content/products';

const products = [
  { n: '01', slug: 'corona-navidena', name: 'Corona navideña', price: 25, priceMode: 'desde', category: 'temporada',
    description: 'Llena tus espacios de magia navideña con esta corona decorativa tejida a mano. Ideal para puertas, paredes y rincones especiales del hogar.',
    colors: 'a tu gusto', measures: 'según tu necesidad' },
  { n: '02', slug: 'serpientita-de-colores', name: 'Serpientita de colores', price: 20, priceMode: 'fijo', category: 'amigurumis',
    description: 'Súper suave y llena de color, perfecta para regalar, decorar o acompañar las aventuras de los más pequeños.',
    availability: 'entrega inmediata' },
  { n: '03', slug: 'ovejita', name: 'Ovejita', price: 35, priceMode: 'fijo', category: 'amigurumis', featured: true,
    description: 'Suavecita y hecha con mucho cariño, perfecta para regalar o decorar un rinconcito especial.',
    availability: 'entrega inmediata' },
  { n: '04', slug: 'peluche-ovejita', name: 'Peluche Ovejita', price: 35, priceMode: 'desde', category: 'amigurumis',
    description: 'Un peluche tierno y esponjoso, ideal para decorar o para regalar en un baby shower.',
    measures: '28 × 15 × 10 cm', colors: 'por pedido', customizable: true },
  { n: '05', slug: 'cosmetiquera-tejida', name: 'Cosmetiquera tejida', price: 25, priceMode: 'fijo', category: 'accesorios',
    description: 'Una cosmetiquera tejida a mano para llevar tus cositas con estilo.',
    colors: 'por pedido', customizable: true },
  { n: '06', slug: 'wirset', name: 'Wirset', price: 15, priceMode: 'fijo', category: 'accesorios',
    description: 'Para lucir con tus accesorios favoritos.',
    colors: 'por pedido' },
  { n: '07', slug: 'ramo-rosas-san-valentin', name: 'Ramo de Rosas San Valentín', price: 25, priceMode: 'fijo', category: 'flores', featured: true,
    description: 'Rosas que no se marchitan, ideales para regalar. Puedes elegir los colores y agregarle chocolates.',
    measures: '25 × 15 cm', colors: 'por pedido', customizable: true },
  { n: '08', slug: 'portavasos-de-rosa', name: 'Portavasos de rosa', price: 5, priceMode: 'fijo', category: 'hogar',
    description: 'Portavasos en forma de rosa que también funciona como masetero. Ideal para vasos y tazas.',
    colors: 'por pedido' },
  { n: '09', slug: 'ramo-de-rosas', name: 'Ramo de rosas', priceMode: 'consultar', category: 'flores',
    description: 'Un ramo de rosas tejidas para regalar. El precio depende de la cantidad de rosas.' },
  { n: '10', slug: 'llavero-de-flor', name: 'Llavero de flor', price: 5, priceMode: 'fijo', category: 'llaveros',
    description: 'Un llavero florecido, perfecto para colgar en tu bolso.',
    colors: 'por pedido' },
  { n: '12', slug: 'llavero-lirio-del-valle', name: 'Llavero lirio del valle', price: 6, priceMode: 'fijo', category: 'llaveros',
    description: 'Delicados lirios del valle tejidos para acompañar tu bolso.',
    colors: 'por pedido' },
  { n: '13', slug: 'masetero-portavasos', name: 'Masetero convertible en portavasos', price: 20, priceMode: 'desde', category: 'hogar',
    description: 'Decora como masetero o úsalo como portavasos. Un regalo lindo y útil.',
    measures: 'por pedido', colors: 'por pedido' },
  { n: '14', slug: 'cosmic-kitty', name: 'Cosmic Kitty', price: 15, priceMode: 'fijo', category: 'amigurumis', featured: true,
    description: 'Un gatito cósmico con ojitos de botón y estrellitas, ideal para regalar.',
    measures: '13 × 9 cm', colors: 'por pedido' },
  { n: '15', slug: 'amigurumi-y-mono', name: 'Amigurumi y moño tejido', priceMode: 'consultar', category: 'amigurumis',
    description: 'Amigurumi tejido a mano acompañado de un moño a juego.' },
  { n: '16', slug: 'bolso-de-playa', name: 'Bolso de playa', price: 20, priceMode: 'fijo', category: 'accesorios',
    description: 'Para llevar tus cosas a la playa o usarlo todos los días.',
    measures: 'por pedido', colors: 'por pedido' },
];

const categories = ['amigurumis', 'flores', 'llaveros', 'accesorios', 'hogar', 'temporada'];

const resize = (from, to, size) => execFileSync('sips', ['-Z', String(size), from, '--out', to], { stdio: 'ignore' });

for (const { n, slug, ...p } of products) {
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });
  resize(join(SRC, `${n}-${slug}.jpg`), join(dir, `${slug}.jpg`), 1600);
  const data = {
    name: p.name,
    photos: [`./${slug}.jpg`],
    ...(p.price !== undefined && { price: p.price }),
    priceMode: p.priceMode,
    category: p.category,
    description: p.description,
    ...(p.measures && { measures: p.measures }),
    ...(p.colors && { colors: p.colors }),
    ...(p.customizable !== undefined && { customizable: p.customizable }),
    shipping: 'todo Panamá',
    ...(p.availability && { availability: p.availability }),
    featured: p.featured ?? false,
    visible: true,
    order: Number(n),
  };
  writeFileSync(join(dir, 'index.md'), `---\n${stringify(data, { lineWidth: 0 })}---\n`);
}

mkdirSync('src/content/categories', { recursive: true });
categories.forEach((id, i) =>
  writeFileSync(`src/content/categories/${id}.yml`, stringify({ label: id, order: i + 1 })),
);

mkdirSync('src/content/settings', { recursive: true });
resize(join(SRC, '03-ovejita.jpg'), 'src/content/settings/about.jpg', 1200);
writeFileSync(
  'src/content/settings/site.yml',
  stringify({
    whatsapp: '50765839292',
    instagram: 'https://www.instagram.com/starsandstuffcrochet/',
    heroTagline: 'Amigurumis, flores y accesorios tejidos a mano con mucho cariño en Panamá. Colores a tu gusto ✦',
    aboutTitle: '¡hola! soy la de Stars & Stuff ♡',
    aboutText:
      'Texto provisional, edítalo desde el panel. Aquí va quién soy, desde cuándo tejo y por qué cada pieza se hace por pedido, con los colores que tú elijas.',
    aboutPhoto: './about.jpg',
  }),
);

console.log(`migrated ${products.length} products`);
