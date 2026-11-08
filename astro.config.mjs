// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://starsandstuff.pages.dev',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
