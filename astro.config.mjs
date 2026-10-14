// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL in the hosting dashboard once the client's domain is connected.
const site = process.env.SITE_URL ?? 'https://zbdesign.example';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
