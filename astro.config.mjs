import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://qzkasoma-luo.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
  compressHTML: true,
  devToolbar: { enabled: false },
});
