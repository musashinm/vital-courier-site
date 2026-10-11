import { defineConfig } from 'astro/config';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import externalLinks from './src/markdown/external-links.ts';
import policyToc from './src/markdown/policy-toc.ts';
import sectionReturnLinks from './src/markdown/section-return-links.ts';

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
    // rehypeHeadingIds must come first: policyToc reads the H2 ids it assigns.
    processor: unified({
      rehypePlugins: [
        rehypeHeadingIds,
        [policyToc, {}],
        [sectionReturnLinks, {}],
        [externalLinks, {}],
      ],
    }),
  },
  vite: { plugins: [tailwindcss()] },
});
