# Web Stars & Stuff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitio estático de Stars & Stuff con portada collage, catálogo filtrable, página por producto con pedido por WhatsApp, y panel Sveltia CMS para editar todo sin código.

**Architecture:** Astro genera HTML estático desde content collections (productos como page bundles Markdown con su foto al lado, categorías y ajustes en YAML). La lógica pura (precios, links de WhatsApp, orden, relacionados, ficha) vive en `src/lib/` con tests de Vitest. Sveltia CMS en `public/admin/` escribe esos mismos archivos vía GitHub; cada commit dispara el build en Cloudflare Pages.

**Tech Stack:** Astro 7, TypeScript, CSS plano (custom properties), Vitest 5, Sveltia CMS (CDN), @fontsource, @astrojs/sitemap, Cloudflare Pages + worker `sveltia-cms-auth`.

**Spec:** `docs/superpowers/specs/2026-11-07-web-stars-and-stuff-design.md` (mockups aprobados en `docs/superpowers/specs/mockups/`; las imágenes `/files/*.jpg` de los mockups son `starsandstuffcrochet-posts/fotos/*`, `/files/logo.png` es `Crocheted moon and star logo.png`).

## Global Constraints

- El diseño visual es el de los mockups, aprobado "no le muevas nada". Copiar tokens, tipografías, rotaciones, texturas y composición de `mockups/logo-y-producto.html` (que incluye la portada con logo).
- Node >= 22.23.4 (Astro 7). Local hay 22.22.0: usar `nvm install 24 && nvm use 24`; agregar `.nvmrc` con `24`.
- Usar Context7 (`/withastro/docs`, `/llmstxt/sveltiacms_app_llms_txt`) para cualquier duda de API de Astro o Sveltia.
- Todo texto visible en español. Nunca el carácter em dash en texto, código, comentarios ni commits.
- WhatsApp `50765839292`, Instagram `https://www.instagram.com/starsandstuffcrochet/`.
- Contraste AA: texto rosa usa `#b8175a`, nunca `#e0457b`. Sin sombras de brillo de color.
- Sin servicios pagos. Sin carrito, pagos, blog ni i18n.
- Commits frecuentes en una rama `feat/web` (no en `main`), mensajes convencionales en inglés terminando con las líneas de atribución de la sesión.

## Review Focus

1. Campos opcionales vacíos desde el CMS (sin medidas, sin precio en modo consultar, una sola foto): el build no debe romper y la ficha solo muestra filas con dato. Test en Task 2 (`fichaRows`) y Task 3 (fixture mínima).
2. Nombres con tildes, ñ, `&` o comillas: el slug debe ser válido y el mensaje de WhatsApp debe ir bien codificado. Test en Task 2 (`whatsappUrl`).
3. Ningún producto marcado como destacado (o menos de 3): la portada rellena con los primeros visibles por orden. Test en Task 2 (`featuredProducts`).
4. Producto con `visible: false`: no genera página, no aparece en catálogo, relacionados ni sitemap. Test en Task 2 y en el smoke test de Task 6.
5. Nombre largo ("Masetero convertible en portavasos") en letras recortadas a 375px: debe partir en líneas sin scroll horizontal. Verificación visual en Task 8.

---

## File Structure

```
.nvmrc
astro.config.mjs              site, sitemap, image config
vitest.config.ts
package.json
src/
  content.config.ts           collections: products, categories, settings
  content/
    products/<slug>/index.md  + <slug>.jpg (page bundle)
    categories/<id>.yml
    settings/site.yml         + about.jpg
  lib/
    types.ts                  PriceMode, ProductLike, CategoryLike
    pricing.ts                formatPrice
    whatsapp.ts               whatsappUrl, productMessage, genericMessage
    catalog.ts                visibleSorted, featuredProducts, relatedProducts, usedCategories, fichaRows
  assets/logo.png             logo (copiado del repo raíz)
  styles/
    tokens.css                colores, fuentes, sombras
    scrapbook.css             texturas, tape, polaroid, cut, burst, torn, sticker
  components/
    CutoutTitle.astro         letras recortadas accesibles
    Polaroid.astro            foto con tape, caption, precio, mini botón
    StickerButton.astro       botón tipo sticker (link)
    Deco.astro                estrellas/corazones/estallidos decorativos (aria-hidden)
    Nav.astro, Footer.astro
    Hero.astro, Catalog.astro, About.astro
    ProductGallery.astro, ProductFicha.astro
  layouts/Base.astro          head, SEO, OG, fuentes, Nav, Footer
  pages/
    index.astro
    tejidos/[slug].astro
    404.astro
public/
  favicon.png
  admin/index.html
  admin/config.yml
scripts/migrate-ig.mjs        one-shot: posts del IG a content/
tests/
  lib/*.test.ts
  content.test.ts             estructura de contenido + cms config en sincronía
  dist.test.ts                smoke tests sobre dist/ (corre después de build)
docs/GUIA.md                  guía para los dueños: panel, deploy, OAuth, dominio
```

---

### Task 1: Proyecto Astro base

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.nvmrc`, `src/pages/index.astro` (placeholder), `tests/smoke.test.ts`
- Modify: `.gitignore` (agregar `node_modules/`, `dist/`, `.astro/`, `.DS_Store`)

**Interfaces:**
- Produces: scripts npm `dev`, `build`, `check` (`astro check`), `test` (`vitest run --exclude tests/dist.test.ts`), `test:dist` (`vitest run tests/dist.test.ts`), `verify` (`npm run check && npm test && npm run build && npm run test:dist`).

- [ ] **Step 1:** `git switch -c feat/web`; `nvm install 24 && nvm use 24`; crear `.nvmrc` con `24`.
- [ ] **Step 2:** Scaffold Astro 7 template minimal en la raíz sin pisar archivos existentes (`npm create astro@latest -- --template minimal --no-git --install` en carpeta temporal y mover, o crear a mano). Instalar `vitest`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `@fontsource/caveat`, `@fontsource/nunito`, `@fontsource/abril-fatface`, `@fontsource/rubik-mono-one`, `@fontsource/special-elite`, `yaml`, `gray-matter`.
- [ ] **Step 3:** `astro.config.mjs`: `site: process.env.SITE_URL ?? 'https://stars-and-stuff-crochet.pages.dev'`, integración sitemap, `trailingSlash: 'always'`. `vitest.config.ts` con `getViteConfig` de `astro/config`.
- [ ] **Step 4:** `tests/smoke.test.ts`: `expect(1).toBe(1)` para validar el runner.
- [ ] **Step 5:** Run `npm run check && npm test && npm run build`. Expected: 0 errores, 1 test pasa, `dist/index.html` existe.
- [ ] **Step 6:** Commit `chore: scaffold astro project`.

---

### Task 2: Lógica pura en `src/lib/` (TDD)

**Files:**
- Create: `src/lib/types.ts`, `src/lib/pricing.ts`, `src/lib/whatsapp.ts`, `src/lib/catalog.ts`
- Test: `tests/lib/pricing.test.ts`, `tests/lib/whatsapp.test.ts`, `tests/lib/catalog.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // types.ts
  export type PriceMode = 'fijo' | 'desde' | 'consultar';
  export type Availability = 'entrega inmediata' | 'por pedido';
  export interface ProductLike {
    id: string; name: string; category: string;
    price?: number; priceMode: PriceMode;
    featured: boolean; visible: boolean; order: number;
    measures?: string; colors?: string; customizable?: boolean;
    shipping?: string; availability?: Availability;
  }
  export interface CategoryLike { id: string; label: string; order: number }
  export interface FichaRow { label: string; value: string }
  // pricing.ts
  export function formatPrice(p: Pick<ProductLike,'price'|'priceMode'>): string;
  // whatsapp.ts
  export function whatsappUrl(phone: string, message: string): string;
  export function productMessage(p: Pick<ProductLike,'name'|'price'|'priceMode'>, pageUrl: string): string;
  export function genericMessage(): string;
  // catalog.ts
  export function visibleSorted<T extends ProductLike>(all: T[]): T[];
  export function featuredProducts<T extends ProductLike>(all: T[], n?: number): T[];   // n = 3
  export function relatedProducts<T extends ProductLike>(current: T, all: T[], n?: number): T[]; // n = 4
  export function usedCategories<C extends CategoryLike>(cats: C[], products: ProductLike[]): C[];
  export function fichaRows(p: ProductLike): FichaRow[];
  ```

- [ ] **Step 1: Tests de pricing**
  ```ts
  expect(formatPrice({ price: 15, priceMode: 'fijo' })).toBe('$15');
  expect(formatPrice({ price: 35.0, priceMode: 'fijo' })).toBe('$35');
  expect(formatPrice({ price: 5.5, priceMode: 'fijo' })).toBe('$5.50');
  expect(formatPrice({ price: 25, priceMode: 'desde' })).toBe('desde $25');
  expect(formatPrice({ priceMode: 'consultar' })).toBe('consultar');
  expect(formatPrice({ price: 20, priceMode: 'consultar' })).toBe('consultar');
  expect(formatPrice({ priceMode: 'fijo' })).toBe('consultar'); // precio faltante no rompe
  ```
- [ ] **Step 2: Tests de whatsapp**
  ```ts
  expect(whatsappUrl('+507 6583-9292', 'hola')).toBe('https://wa.me/50765839292?text=hola');
  expect(whatsappUrl('50765839292', 'Ñandú & "rosas" ✦'))
    .toBe('https://wa.me/50765839292?text=' + encodeURIComponent('Ñandú & "rosas" ✦'));
  expect(productMessage({ name: 'Cosmic Kitty', price: 15, priceMode: 'fijo' }, 'https://x.dev/tejidos/cosmic-kitty/'))
    .toBe('¡Hola! Me interesa este tejido: Cosmic Kitty ($15) que vi en la web ✦\nhttps://x.dev/tejidos/cosmic-kitty/');
  expect(productMessage({ name: 'Ramo de rosas', priceMode: 'consultar' }, 'https://x.dev/tejidos/ramo-de-rosas/'))
    .toBe('¡Hola! Me interesa este tejido: Ramo de rosas que vi en la web, ¿me cuentas el precio? ✦\nhttps://x.dev/tejidos/ramo-de-rosas/');
  expect(genericMessage()).toBe('¡Hola! Vi su web y quiero hacer un pedido ✦');
  ```
  Nota: el spec decía "Me interesa el <nombre>"; se cambia a "este tejido:" porque "el Corona navideña" no concuerda en género. Actualizar el spec en este mismo commit.
- [ ] **Step 3: Tests de catalog** con fixture de 6 productos (2 ocultos, 1 destacado, categorías mezcladas):
  - `visibleSorted` excluye `visible:false`, ordena por `order` y luego `name` con `localeCompare('es')`.
  - `featuredProducts` devuelve los destacados visibles primero y rellena con visibles por orden hasta 3; con 0 destacados devuelve los 3 primeros; nunca incluye ocultos.
  - `relatedProducts` excluye el actual y ocultos, prioriza misma categoría, rellena con otras, máximo 4.
  - `usedCategories` devuelve solo categorías con al menos un producto visible, ordenadas por `order`.
  - `fichaRows` con todo lleno devuelve en orden `Medidas, Colores, Personalizable ('sí ✓'), Envíos, Disponible`; con `customizable: false` muestra `'no'`; con campos `undefined` o `''` los omite; con todo vacío devuelve `[]`.
- [ ] **Step 4:** Run `npm test`. Expected: FAIL (módulos no existen).
- [ ] **Step 5:** Implementar las funciones con las firmas de arriba.
- [ ] **Step 6:** Run `npm test`. Expected: PASS.
- [ ] **Step 7:** Commit `feat: pricing, whatsapp and catalog helpers`.

---

### Task 3: Content collections + migración del contenido del IG

**Files:**
- Create: `src/content.config.ts`, `scripts/migrate-ig.mjs`, `src/content/products/*/index.md` + foto, `src/content/categories/*.yml`, `src/content/settings/site.yml`, `src/content/settings/about.jpg`, `tests/content.test.ts`

**Interfaces:**
- Consumes: `PriceMode`, `Availability` (Task 2).
- Produces: collections `products`, `categories`, `settings` (entry id `site`). Frontmatter de producto:
  `name, photos: image()[] (min 1), price?: number, priceMode, category: reference('categories'), description, measures?, colors?, customizable?: boolean, shipping? (default 'todo Panamá'), availability?, featured (default false), visible (default true), order (default 100)`.
  Ajustes: `whatsapp: string, instagram: url, heroTagline: string, aboutTitle: string, aboutText: string, aboutPhoto: image()`.
  Categoría: `label: string, order: number`; ids `amigurumis, flores, llaveros, accesorios, hogar, temporada` (order 1..6, label en minúscula como en el mockup).

- [ ] **Step 1: Test de contenido** (`tests/content.test.ts`, lee archivos con `gray-matter`/`yaml`):
  - hay exactamente 15 carpetas en `src/content/products/`, ninguna corresponde al post 11.
  - cada `index.md` tiene `name`, `priceMode`, `category` existente en `categories/`, y cada ruta de `photos` existe en disco junto al `index.md`.
  - destacados = `cosmic-kitty`, `ramo-rosas-san-valentin`, `ovejita`.
  - `ramo-de-rosas` y `amigurumi-y-mono` tienen `priceMode: consultar` y sin `price`.
  - `serpientita-de-colores` y `ovejita` tienen `availability: entrega inmediata`; `cosmic-kitty` no tiene `availability` ni `customizable` (no los dice el post).
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** `src/content.config.ts` con glob loaders (`products/**/index.md`, `categories/*.yml`, `settings/*.yml`) y el schema de arriba.
- [ ] **Step 4:** `scripts/migrate-ig.mjs` (one-shot, idempotente): para cada fila de la tabla "Contenido inicial" del spec crea `src/content/products/<slug>/index.md` y copia `starsandstuffcrochet-posts/fotos/NN-<slug>.jpg` a `<slug>.jpg` redimensionado a lado mayor 1600px (`sips -Z 1600`). Slug = nombre del archivo sin `NN-`. Los datos de la ficha salen solo de lo que dice cada post en `descripciones.txt` (spec: "lo que el post no dice queda vacío"). Descripciones reescritas en tono cálido, 1 a 2 frases, sin hashtags. `order` = número del post. `shipping: todo Panamá` en todos.
- [ ] **Step 5:** `site.yml`: whatsapp `50765839292`, instagram, heroTagline `Amigurumis, flores y accesorios tejidos a mano con mucho cariño en Panamá. Colores a tu gusto ✦`, aboutTitle `¡hola! soy la de Stars & Stuff ♡`, aboutText provisional (marcado "texto provisional, edítalo desde el panel"), aboutPhoto = copia de la foto de ovejita.
- [ ] **Step 6:** Run `node scripts/migrate-ig.mjs && npm test && npm run check && npm run build`. Expected: PASS, build valida schemas sin errores.
- [ ] **Step 7:** Commit `feat: content collections and initial catalog from instagram`.

---

### Task 4: Sistema visual scrapbook (estilos + componentes base)

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/scrapbook.css`, `src/components/CutoutTitle.astro`, `Polaroid.astro`, `StickerButton.astro`, `Deco.astro`, `src/assets/logo.png`, `public/favicon.png`

**Interfaces:**
- Produces:
  - `<CutoutTitle text: string, as?: 'h1'|'h2'|'div', size?: 'lg'|'md'|'sm' />`: renderiza el texto real en un `<span class="sr-only">` y cada letra como `<span class="cut" aria-hidden="true">`; espacios como `.sp`; las palabras se agrupan en `<span class="word">` con `white-space: nowrap` y el título hace wrap entre palabras.
  - `<Polaroid image: ImageMetadata, alt: string, caption: string, href?: string, price?: string, waHref?: string, tape?: 'pink'|'yellow'|'blue', priceStyle?: 'tag'|'bubble', class?: string />`: usa `<Image>` de `astro:assets` con `widths` responsivos y `sizes`; si `href`, la foto y caption son link; si `waHref`, muestra mini botón "💬 pedir" (link aparte, no anidado).
  - `<StickerButton href: string, variant?: 'wa'|'ig', size?: 'lg'|'md'>` con slot para el texto; abre en nueva pestaña con `rel="noopener"`.
  - `<Deco kind: 'star'|'heart'|'sparkle'|'burst', color: string, class?: string />` SVG inline `aria-hidden="true"`.
- Clases utilitarias en `scrapbook.css`: `.gingham`, `.dots`, `.stripes`, `.torn`, `.burst`, `.tape(.y|.b)`, `.uline`, `.ruled` (papel rayado), `.label-dashed`, `.pill`, `.sr-only`. Valores exactos copiados de `mockups/logo-y-producto.html`.

- [ ] **Step 1:** Copiar logo a `src/assets/logo.png` y `favicon.png` a `public/`.
- [ ] **Step 2:** Escribir `tokens.css` y `scrapbook.css` desde el `<style>` del mockup; fuentes vía imports de `@fontsource` (Caveat 600/700, Nunito 400/700, Abril Fatface, Rubik Mono One, Special Elite). Agregar `@media (prefers-reduced-motion: reduce)` que anule transiciones.
- [ ] **Step 3:** Implementar los 4 componentes con las props de arriba.
- [ ] **Step 4:** Usar temporalmente los componentes en `src/pages/index.astro` (placeholder de Task 1) para mirarlos en `npm run dev`. Run `npm run check && npm run build`. Expected: 0 errores. La portada real los reemplaza en Task 5.
- [ ] **Step 5:** Commit `feat: scrapbook visual system and base components`.

---

### Task 5: Layout + portada

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Nav.astro`, `Footer.astro`, `Hero.astro`, `Catalog.astro`, `About.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/dist.test.ts` (sección portada)

**Interfaces:**
- Consumes: Task 2 helpers, Task 3 collections, Task 4 componentes.
- Produces: `<Base title: string, description: string, ogImage?: ImageMetadata, canonicalPath: string>`; ids de ancla `#tejidos`, `#sobre-mi`, `#pedidos`.

Composición según mockup:
- **Nav:** logo 58px + "Stars & Stuff" en Caveat; links `tejidos` (`#tejidos`), `sobre mí`, `pedidos` (`#pedidos`, el pie), `IG ♡` (externo). En < 640px los links pasan a una fila debajo, sin menú hamburguesa.
- **Hero:** `featuredProducts(...)` en las 3 polaroids (p1 con burbuja de precio, p3 con burbuja); bloques gingham/dots/stripes rasgados; estallido rosa; logo como parche 120px girado 10deg arriba a la derecha; `CutoutTitle` "STARS & STUFF" como `h1`; bajada desde `heroTagline` con "tejidos a mano" subrayado si aparece en el texto; StickerButton WhatsApp con `genericMessage()`; nota "← ¡responde rapidito!". Desktop: posiciones absolutas del mockup. < 768px: título y botón arriba, luego las 3 polaroids en fila con solapamiento leve, bloques de papel detrás, logo parche más chico; nada tapa el texto.
- **Catalog (`#tejidos`):** label "✂ nuestros tejidos", pills "todo" + `usedCategories`, grid de `Polaroid` con `href` a `/tejidos/<id>/`, precio `formatPrice`, `waHref` con `productMessage`. 4 columnas desktop, 2 en < 768px. Filtro: botones con `aria-pressed`, JS inline (<1 KB) que oculta tarjetas por `data-category`; sin JS se ven todas.
- **About (`#sobre-mi`):** nota en papel rayado con tape, `aboutTitle` + `aboutText`, foto `aboutPhoto` en polaroid sobre gingham + estrella.
- **Footer (`#pedidos`):** fondo `#f6c9dd`, logo 64px girado, "¿quieres uno en tus colores? ✦", botones WhatsApp e Instagram.

- [ ] **Step 1: Smoke tests de portada** en `tests/dist.test.ts` (lee `dist/index.html` con `node:fs`, parsea con regex o `node-html-parser`):
  - el `h1` contiene el texto `STARS & STUFF` (sr-only) y hay letras `.cut` con `aria-hidden="true"`.
  - hay 15 tarjetas `[data-category]` en `#tejidos`, cada una con link a `/tejidos/<slug>/`.
  - hay 6 pills de categoría + "todo".
  - existe al menos un `href` que empieza con `https://wa.me/50765839292?text=`.
  - link de Instagram presente.
  - ningún texto del HTML contiene `—`.
- [ ] **Step 2:** Run `npm run build && npm run test:dist`. Expected: FAIL.
- [ ] **Step 3:** Implementar Base, Nav, Footer, Hero, Catalog, About e `index.astro`.
- [ ] **Step 4:** Run `npm run verify`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: home page with collage hero, catalog and about`.

---

### Task 6: Página de producto

**Files:**
- Create: `src/pages/tejidos/[slug].astro`, `src/components/ProductGallery.astro`, `src/components/ProductFicha.astro`
- Test: `tests/dist.test.ts` (sección producto)

**Interfaces:**
- Consumes: `fichaRows`, `relatedProducts`, `formatPrice`, `productMessage`, `whatsappUrl`, `Polaroid`, `CutoutTitle`, `Base`.
- Produces: rutas `/tejidos/<id>/` solo para productos `visible`.

Composición según mockup: miga "← tejidos / <categoría> / <nombre>"; galería con foto principal en polaroid (tape amarillo, -2deg) sobre gingham rasgado, miniaturas solo si hay más de 1 foto (botones que cambian la principal con JS inline; sin JS, link a la imagen); `CutoutTitle` con el nombre como `h1` (size `md`, wrap por palabras); etiqueta de precio grande; descripción; ficha en papel rayado con tape azul (se oculta entera si `fichaRows` devuelve `[]`); StickerButton "💬 Pedir por WhatsApp" con `productMessage(p, Astro.url.href)`; "✂ también te puede gustar" con 4 `relatedProducts`. Desktop 2 columnas, < 768px una columna.

- [ ] **Step 1: Smoke tests de producto:**
  - existen 15 `dist/tejidos/*/index.html`.
  - `dist/tejidos/peluche-ovejita/index.html`: contiene `desde $35`, fila Medidas `28 × 15 × 10 cm`, `Personalizable`, y el link de WhatsApp decodificado contiene `Peluche Ovejita (desde $35)`.
  - `dist/tejidos/cosmic-kitty/index.html`: no contiene la fila `Disponible` ni `Personalizable`.
  - `dist/tejidos/ramo-de-rosas/index.html`: el mensaje decodificado contiene `¿me cuentas el precio?` y no contiene `($`.
  - cada página tiene 4 tarjetas relacionadas y ninguna apunta a sí misma.
  - la cantidad de páginas es igual a la cantidad de `index.md` con `visible !== false` (leer frontmatter con `gray-matter`). Que los ocultos queden fuera lo cubre el test unitario de `visibleSorted`, y la página usa `visibleSorted` en `getStaticPaths`.
- [ ] **Step 2:** Run `npm run build && npm run test:dist`. Expected: FAIL.
- [ ] **Step 3:** Implementar la página y los dos componentes.
- [ ] **Step 4:** Run `npm run verify`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: product detail pages with ficha and whatsapp order`.

---

### Task 7: SEO, 404 y panel Sveltia CMS

**Files:**
- Modify: `src/layouts/Base.astro`
- Create: `src/pages/404.astro`, `public/admin/index.html`, `public/admin/config.yml`, `public/robots.txt`
- Test: `tests/content.test.ts` (sincronía CMS), `tests/dist.test.ts` (SEO)

**Interfaces:**
- Consumes: schema de Task 3.

- [ ] **Step 1: Tests:**
  - `content.test.ts`: parsear `public/admin/config.yml`; la colección `products` tiene `folder: src/content/products`, `path: '{{slug}}/index'`, `media_folder: ''`, `public_folder: ''`, y el set de `name` de sus fields es exactamente el set de claves del schema de producto (lista literal en el test); `categories` y `settings` apuntan a sus carpetas/archivo; `backend.name: github`, `backend.repo: ThonyFD/crochet-web`, `backend.branch: main`; `output.omit_empty_optional_fields: true`; `locale: es`.
  - `dist.test.ts`: cada página tiene `<title>`, `meta[name=description]`, `og:image` absoluta, `link[rel=canonical]`, favicon; existe `dist/sitemap-index.xml` sin `/admin/`; existe `dist/404.html`; `dist/admin/index.html` existe y tiene `<meta name="robots" content="noindex">`.
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** `Base.astro`: title `"<página> | Stars & Stuff"` (portada: `Stars & Stuff | Crochet hecho a mano en Panamá`), description (producto: su descripción), OG/Twitter con la foto del producto (`getImage` 1200px) o el logo en portada, `lang="es"`. Sitemap con `filter` que excluye `/admin/`.
- [ ] **Step 4:** `404.astro` en estilo scrapbook: "¡ups! esta página se deshilachó" + StickerButton a `/`.
- [ ] **Step 5:** `public/admin/index.html`: carga `https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`, `noindex`. `config.yml`: backend github con `base_url` comentado (se completa en Task 8 con la URL del worker), `media_folder: /public/uploads` global, colecciones:
  - `products` (folder, page bundle, `create: true`, `slug: '{{name}}'`, `sortable_fields: [order, name]`, summary `{{name}} · {{priceMode}}`), widgets: string, image `multiple: true` (photos), number (price, `value_type: float`), select (priceMode, availability), relation (category → categories, `value_field: '{{slug}}'`, `display_fields: [label]`), text (description), string opcionales, boolean (customizable, featured, visible), number (order). Labels en español con `hint` explicando cada campo (p. ej. "Déjalo vacío si no aplica: no se mostrará").
  - `categories` (folder `src/content/categories`, extension `yml`, `create: true`).
  - `settings` (files: `src/content/settings/site.yml`, label "Ajustes del sitio").
- [ ] **Step 6:** Run `npm run verify`. Expected: PASS. Abrir `npm run dev` → `/admin/` carga la pantalla de login de Sveltia (sin backend real aún).
- [ ] **Step 7:** Commit `feat: seo, 404 and sveltia cms admin`.

---

### Task 8: Verificación visual, deploy y guía

**Files:**
- Create: `docs/GUIA.md`
- Modify: `public/admin/config.yml` (`base_url`), `README.md`

- [ ] **Step 1: Verificación visual** con el navegador (claude-in-chrome) en `npm run preview`: portada y `/tejidos/peluche-ovejita/` a 1280px comparadas lado a lado con `mockups/logo-y-producto.html`; luego portada, `/tejidos/masetero-convertible-en-portavasos/` y `/tejidos/ramo-de-rosas/` a 375px. Criterios: composición igual al mockup en desktop, sin scroll horizontal en 375px, título largo parte por palabras, ningún texto tapado por decoraciones, filtros funcionan, botón de WhatsApp abre `wa.me` con el mensaje correcto. Corregir y repetir hasta cumplir. Guardar capturas en el scratchpad y mostrarlas al usuario.
- [ ] **Step 2:** `docs/GUIA.md` en español, paso a paso para los dueños:
  1. Conectar el repo a Cloudflare Pages (preset Astro, build `npm run build`, output `dist`, variable `NODE_VERSION=24`, `SITE_URL`).
  2. Crear GitHub OAuth App y desplegar `sveltia/sveltia-cms-auth` en Cloudflare Workers (botón deploy del repo), variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_DOMAINS`; poner la URL del worker en `base_url` de `config.yml`.
  3. Invitar la cuenta de GitHub de la hija como colaboradora del repo (Settings → Collaborators, rol Write).
  4. Cómo usar el panel: entrar a `/admin/`, agregar/editar/ocultar producto, fotos, destacar en portada, cambiar orden, editar "sobre mí" y WhatsApp; cada "Publicar" tarda 1 a 2 minutos en verse.
  5. Conectar un dominio propio en Cloudflare Pages (Custom domains) y actualizar `SITE_URL`.
- [ ] **Step 3:** `README.md` corto: qué es, `nvm use`, `npm install`, `npm run dev`, `npm run verify`, link a la guía.
- [ ] **Step 4:** Run `npm run verify`. Expected: PASS.
- [ ] **Step 5:** Commit `docs: owner guide for cms, deploy and domain`.
- [ ] **Step 6:** Detenerse y pedir al usuario: crear el proyecto en Cloudflare Pages y la OAuth App (requieren sus cuentas), o autorización explícita para hacerlo con `wrangler`. No hacer push ni merge a `main` sin pedirlo.
