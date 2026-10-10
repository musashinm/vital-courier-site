import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import externalLinks from './src/markdown/external-links.ts';

export default defineConfig({
  site: 'https://vitalcourier.app',
  trailingSlash: 'never',
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    processor: unified({ rehypePlugins: [[externalLinks, {}]] }),
  },
  vite: { plugins: [tailwindcss()] },
});
