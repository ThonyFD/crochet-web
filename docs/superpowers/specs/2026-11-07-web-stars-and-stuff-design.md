# Web Stars & Stuff: diseño

Fecha: 2026-11-07
Repo: `git@github.com:ThonyFD/crochet-web.git`

## Intención

Stars & Stuff (@starsandstuffcrochet) es el emprendimiento de crochet de la hija del dueño del repo, en Panamá. Hoy vive solo en Instagram. La web existe para **dar presencia y seriedad a la marca**: un lugar propio, bonito y fácil de compartir, con el catálogo de productos y una forma directa de pedir por WhatsApp.

No es una tienda online. La venta sigue siendo conversacional por WhatsApp.

## Objetivos

- Sitio que transmita marca propia, con la estética scrapbook que eligió la dueña.
- Catálogo con todos los productos, filtrable por categoría.
- Página propia por producto con foto(s), precio, ficha y botón de WhatsApp con mensaje prellenado.
- Que la dueña y su papá puedan agregar, editar y quitar productos, fotos, precios y textos sin tocar código.
- Costo mensual cero (solo un dominio propio, si se compra más adelante).

## No objetivos

- Carrito, checkout, pagos en línea, inventario o cuentas de cliente.
- Blog.
- Multi-idioma (todo en español).
- Sincronización automática con Instagram.

## Anti-objetivos (fallaría aunque funcione)

- Que se vea como una plantilla genérica de tienda: la estética scrapbook es el punto.
- Que la irregularidad visual sacrifique legibilidad o accesibilidad (texto con contraste AA, precios y botones siempre claros).
- Que editar un producto requiera que alguien toque código o la terminal.
- Que se vea roto en el celular: la mayoría del tráfico llegará desde el link de la bio de IG.

## Decisiones tomadas (por el dueño)

- **Stack:** Astro (sitio estático) + Sveltia CMS en `/admin` + hosting en Cloudflare Pages.
- **Acceso al CMS:** login con GitHub. Ambos tienen cuenta de GitHub.
- **Contacto/venta:** WhatsApp `+507 6583-9292` (`https://wa.me/50765839292`). Instagram: `https://www.instagram.com/starsandstuffcrochet/`.
- **Página por producto:** sí.
- **Logo:** `Crocheted moon and star logo.png` (1024x1024, PNG con transparencia, parche circular de mezclilla con estrella rosa y luna amarilla). `favicon.png` (250x250) como favicon.
- **Diseño visual: aprobado tal cual, "no le muevas nada".** Referencia exacta:
  - `docs/superpowers/specs/mockups/mezcla-a-b.html` (portada + catálogo + sobre mí + pie)
  - `docs/superpowers/specs/mockups/logo-y-producto.html` (logo integrado + página de producto)
  - Los mockups referencian imágenes como `/files/<nombre>.jpg`; son las mismas de `starsandstuffcrochet-posts/fotos/` (y `/files/logo.png` es el logo). Para verlos, abrir el HTML sirviendo esa carpeta de fotos en `/files/`.

## Dirección artística (de la dueña)

Estilo **Handmade Scrapbook / Art Journal / Mixed Media Collage**: un cuaderno artístico físico convertido en web. Composición espontánea pero cuidada.

- Texturas: papel de cuaderno, papel reciclado, cartulina. Recortes en rosa, lavanda, amarillo y azul pastel. Patrones gingham, rayas, punteado. Bordes rasgados. Sombras suaves de "pegado".
- Composición: asimétrica, rotaciones leves, capas superpuestas, stickers que se salen de su contenedor, nada rígido, pero legible.
- Elementos: estrellas a mano, corazones, garabatos, washi tape, clips, etiquetas de papel, flechas y subrayados irregulares, botones tipo sticker recortado.
- Tipografía: handwritten para títulos + sans-serif legible para contenido. Títulos con letras recortadas de revista (cada letra con fondo, fuente y rotación distinta).

En los mockups: Caveat (handwritten), Nunito (cuerpo), Abril Fatface / Rubik Mono One / Special Elite (letras recortadas). Paleta: crema `#fbf6ea`, rosa `#ffd6e7`/`#f6c9dd`/`#ff5fa2`, amarillo `#fff3a8`/`#ffd23f`, azul `#d7ecff`/`#bfe3ee`, lavanda `#e6dcff`, verde WhatsApp sticker `#7ed99b`, rosa texto `#b8175a` (contraste AA), tinta `#3a2f3a`.

## Estructura del sitio

### Portada (`/`)
Según mockup, de arriba a abajo:
1. **Menú:** logo pequeño + "Stars & Stuff" manuscrito; links a tejidos, sobre mí, pedidos (ancla al pie/WhatsApp), IG.
2. **Hero (estilo collage libre "A"):** bloques de papel rasgado gingham/punteado/rayas, estallido rosa, 3 fotos de productos destacados en polaroid con washi tape y girados, etiquetas de precio, título "STARS & STUFF" en letras recortadas, bajada, botón sticker "Pídelo por WhatsApp" con nota manuscrita, y el **logo como parche** arriba a la derecha girado.
3. **Catálogo (estilo ordenado "B"):** etiqueta "✂ nuestros tejidos", filtros por categoría como pills ("todo" + categorías), cuadrícula de polaroids con leve rotación alterna, nombre manuscrito, precio en etiqueta amarilla y mini botón "💬 pedir". Click en la tarjeta lleva a la página del producto; el mini botón abre WhatsApp directo.
4. **Sobre mí:** nota en papel rayado con washi tape y texto de la dueña, foto + recorte gingham al lado.
5. **Pie:** logo, "¿quieres uno en tus colores? ✦", botones WhatsApp e Instagram.

### Página de producto (`/tejidos/<slug>/`)
Según mockup: miga de pan, foto principal en polaroid sobre gingham + miniaturas (si hay más de una foto), nombre en letras recortadas, precio en etiqueta, descripción, "ficha" en papel rayado (medidas, colores, personalizable, envíos, disponibilidad; solo los campos que tengan dato), botón "Pedir por WhatsApp" con mensaje prellenado, y "también te puede gustar" (4 productos, preferir misma categoría).

### Mensaje de WhatsApp prellenado
`¡Hola! Me interesa el <nombre> (<precio>) que vi en la web ✦` y el link a la página del producto. Si el precio es "a consultar", se omite el paréntesis: `¡Hola! Me interesa el <nombre> que vi en la web, ¿me cuentas el precio? ✦`. En tarjetas y etiquetas ese modo se muestra como "consultar". El botón general (sin producto) usa un saludo genérico.

## Modelo de contenido (editable en el CMS)

**Producto** (colección, un archivo por producto):
- nombre (requerido), slug (derivado)
- fotos (lista, al menos 1; la primera es la principal)
- precio: número + modo `fijo` | `desde` | `a consultar`
- categoría (de la lista de categorías)
- descripción corta
- medidas (texto libre, opcional), colores (texto, opcional), personalizable (sí/no, opcional), envíos (default "todo Panamá"), disponibilidad (`entrega inmediata` | `por pedido`)
- destacado en portada (sí/no; el hero usa 3)
- orden (número, para ordenar el catálogo) y visible (sí/no, para ocultar sin borrar)

**Categorías** (editables): amigurumis, flores, llaveros, accesorios, hogar, temporada. Los filtros del catálogo salen de las categorías que tengan productos visibles.

**Ajustes del sitio** (archivo único): número de WhatsApp, link de Instagram, bajada del hero, texto "sobre mí" y su foto.

## Contenido inicial

Cargar los productos de `starsandstuffcrochet-posts/descripciones.txt` con su foto de `fotos/`. **Excluir el post 11** ("Pedidos San Valentín", no es un producto). La carpeta `fichas/` son capturas de los posts, no fotos extra: no usarla en la web.

| # | Producto | Precio | Categoría | Notas |
|---|---|---|---|---|
| 01 | Corona navideña | desde $25 | temporada | colores y tamaños a gusto |
| 02 | Serpientita de colores | $20 | amigurumis | entrega inmediata |
| 03 | Ovejita | $35 | amigurumis | entrega inmediata |
| 04 | Peluche Ovejita | desde $35 | amigurumis | 28×15×10 cm, personalizable |
| 05 | Cosmetiquera tejida | $25 | accesorios | personalizable |
| 06 | Wirset | $15 | accesorios | colores por pedido |
| 07 | Ramo de Rosas San Valentín | $25 | flores | 25×15 cm, se pueden agregar chocolates |
| 08 | Portavasos de rosa | $5 | hogar | portavaso y masetero |
| 09 | Ramo de rosas | a consultar | flores | precio según cantidad |
| 10 | Llavero de flor | $5 | llaveros | |
| 12 | Llavero lirio del valle | $6 | llaveros | |
| 13 | Masetero convertible en portavasos | desde $20 | hogar | |
| 14 | Cosmic Kitty | $15 | amigurumis | 13×9 cm |
| 15 | Amigurumi y moño tejido | a consultar | amigurumis | post sin descripción |
| 16 | Bolso de playa | $20 | accesorios | |

Destacados en portada: Cosmic Kitty, Ramo de Rosas San Valentín, Ovejita (como en el mockup).

En la carga inicial, solo se completan los campos de la ficha que el post menciona. Lo que el post no dice (disponibilidad, personalizable, medidas, etc.) queda vacío y esa fila no se muestra, para no prometer nada que la dueña no haya dicho. Excepción: "envíos: todo Panamá" va por defecto, porque casi todos los posts lo dicen. (decisión del diseñador; la dueña completa el resto desde el panel)

Las descripciones se reescriben en tono cálido y limpio a partir de los posts (sin hashtags ni exceso de emojis). El texto "sobre mí" queda provisional para que la dueña lo escriba desde el panel.

## Restricciones

- Mobile-first: el collage del hero debe recomponerse en celular (menos fotos, apiladas, sin solaparse sobre el texto), manteniendo el carácter.
- Imágenes optimizadas (las fotos originales son grandes): usar el pipeline de imágenes de Astro, formatos modernos y tamaños responsivos.
- Accesibilidad: contraste AA, `alt` en fotos (desde el nombre del producto), las letras recortadas deben leerse como texto real para lectores de pantalla, decoraciones con `aria-hidden`, respetar `prefers-reduced-motion` si hay animaciones.
- SEO básico: título y descripción por página, Open Graph con la foto del producto (los links se compartirán por WhatsApp e IG), sitemap.
- Sin costos recurrentes; nada de servicios pagos.
- Todo el texto en español.
- No usar el carácter em dash en textos ni código.

## Lo que queda a criterio del builder

- Estructura interna del proyecto Astro, componentes y CSS (vanilla CSS, CSS modules o Tailwind).
- Cómo se autentica Sveltia CMS con GitHub en Cloudflare Pages (p. ej. el worker OAuth `sveltia-cms-auth` en Cloudflare, o login con token). Debe quedar documentado paso a paso para el dueño, incluyendo dar acceso de colaborador a la cuenta de GitHub de la hija.
- Implementación de los filtros (JS liviano en cliente o páginas por categoría).
- Recomposición responsive exacta del hero y de la página de producto.
- Las decoraciones (estrellas, corazones, estallidos, texturas) pueden ser SVG/CSS propios; pueden variar un poco en detalle mientras se mantenga el look de los mockups.
- Dominio: arrancar con el subdominio gratuito `*.pages.dev`; dejar documentado cómo conectar un dominio propio.
- Despliegue: Cloudflare Pages conectado al repo, build en cada push a `main` (que es lo que hace el CMS al guardar).
