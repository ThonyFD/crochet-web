# Stars & Stuff

Web de [@starsandstuffcrochet](https://www.instagram.com/starsandstuffcrochet/): crochet hecho a mano en Panamá. Astro + Sveltia CMS, publicada en Cloudflare Pages.

## Desarrollo

```sh
nvm use          # Node 24
npm install
npm run dev      # http://localhost:4321
npm run verify   # astro check + tests + build + smoke tests del sitio generado
```

- Productos: `src/content/products/<slug>/index.md` con sus fotos al lado.
- Categorías: `src/content/categories/*.yml`. Ajustes: `src/content/settings/site.yml`.
- Panel: `/admin/` (config en `public/admin/config.yml`, debe coincidir con `src/content.config.ts`).

Para publicar, el login del panel y el dominio, ver [docs/GUIA.md](docs/GUIA.md).
