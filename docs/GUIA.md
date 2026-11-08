# Guía de Stars & Stuff

Esta guía es para ustedes, los dueños de la web. Explica cómo publicarla, cómo entrar al panel y cómo usar un dominio propio. Los pasos 1 a 3 se hacen una sola vez.

## 1. Publicar la web en Cloudflare Pages (gratis)

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) con tu cuenta (o crea una gratis).
2. Ve a **Workers & Pages → Create → Pages → Connect to Git** y elige el repositorio `ThonyFD/crochet-web`.
3. Configura:
   - **Production branch:** `main`
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** `NODE_VERSION` = `24` y `SITE_URL` = la dirección que te dé Cloudflare (por ejemplo `https://stars-and-stuff-crochet.pages.dev`).
4. Guarda y despliega. Cada vez que algo cambie en `main` (también cuando guardan desde el panel), la web se vuelve a publicar sola en 1 o 2 minutos.

Si el nombre `stars-and-stuff-crochet.pages.dev` no está libre, Cloudflare te dará otro. En ese caso, cambia `site_url` en `public/admin/config.yml`, la línea `Sitemap:` en `public/robots.txt` y la variable `SITE_URL`.

## 2. Activar el login del panel con GitHub

El panel (`/admin/`) usa GitHub para entrar. Necesita un pequeño servicio gratuito en Cloudflare que hace el login.

1. **Desplegar el autenticador:** abre [github.com/sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) y usa el botón **Deploy to Cloudflare Workers**. Al terminar tendrás una URL como `https://sveltia-cms-auth.<tu-cuenta>.workers.dev`.
2. **Crear la OAuth App en GitHub:** en GitHub ve a **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - **Application name:** Stars & Stuff panel
   - **Homepage URL:** la URL de la web
   - **Authorization callback URL:** `https://sveltia-cms-auth.<tu-cuenta>.workers.dev/callback`
   - Guarda y copia el **Client ID**, luego genera un **Client secret**.
3. **Configurar el autenticador:** en Cloudflare, abre el worker `sveltia-cms-auth` → **Settings → Variables** y agrega:
   - `GITHUB_CLIENT_ID` = el Client ID
   - `GITHUB_CLIENT_SECRET` = el Client secret (márcalo como secreto)
   - `ALLOWED_DOMAINS` = el dominio de la web, por ejemplo `stars-and-stuff-crochet.pages.dev`
4. **Conectar el panel:** en `public/admin/config.yml` quita el `#` de la línea `base_url` y pon la URL del worker. Haz commit a `main`.

## 3. Darle acceso a tu hija

En el repositorio de GitHub ve a **Settings → Collaborators → Add people**, escribe su usuario de GitHub y dale rol **Write**. Ella acepta la invitación desde su correo o desde GitHub, y desde ese momento puede entrar al panel.

## 4. Usar el panel

Entra a `https://<tu-web>/admin/` y toca **Sign in with GitHub**.

- **Agregar un producto:** Productos → Nuevo. Completa nombre, al menos una foto, tipo de precio y categoría. Lo demás es opcional: **todo campo que quede vacío no se muestra en la web** (excepto Envíos, que si queda vacío muestra "todo Panamá").
- **Precio:** elige "Fijo" ($15), "Desde" ("desde $25") o "A consultar" (sin precio; el mensaje de WhatsApp pregunta el precio).
- **Fotos:** la primera es la principal. Si subes varias, la página del producto muestra miniaturas. Súbelas siempre desde el campo **Fotos** del producto (botón de subir), no eligiéndolas de la biblioteca general de "Medios": las fotos de esa biblioteca no funcionan como foto de producto y la web no se publicaría. Usa JPG o PNG (las fotos HEIC del iPhone no sirven).
- **Portada:** marca "Destacar en la portada" en hasta 3 productos. Si hay menos, la portada completa con los primeros del catálogo.
- **Ocultar sin borrar:** desmarca "Visible en la web".
- **Orden:** los números más bajos aparecen primero.
- **Categorías:** se pueden crear y renombrar. Los filtros del catálogo muestran solo las categorías que tienen productos visibles.
- **Ajustes del sitio:** WhatsApp, Instagram, texto de la portada y la sección "sobre mí".
- **Galería de "sobre mí":** en la sección **Galería de fotos** del panel. Cada foto es una entrada: "Nueva foto" para agregar, ábrela para cambiar foto o texto, bórrala desde su menú, y usa "Orden" para acomodarlas (números bajos primero). Para que combinen, súbelas en vertical; las actuales están editadas en 4:5 con `scripts/edit-gallery.py`.

Al tocar **Publicar**, el cambio queda guardado en GitHub y la web se actualiza en 1 o 2 minutos.

## 5. Dominio propio (opcional)

1. Compra el dominio (en Cloudflare Registrar sale a precio de costo).
2. En Cloudflare Pages → tu proyecto → **Custom domains → Set up a custom domain** y sigue los pasos.
3. Actualiza `SITE_URL` en las variables de Pages, `site_url` en `public/admin/config.yml`, la línea `Sitemap:` de `public/robots.txt` y `ALLOWED_DOMAINS` del worker de login.
