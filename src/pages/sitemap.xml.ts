import type { APIRoute } from 'astro';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { htmlLang, locales, type Locale } from '../i18n/ui';

// The same URL rules as the canonical and hreflang links in src/layouts/Base.astro.
// tests/sitemap.test.ts fails if the two ever disagree.
const HOME_PAGE = '';
const sitemapPages = [HOME_PAGE, 'privacy'] as const;

function pageUrl(locale: Locale, page: string, site: URL): string {
  const localeRootPath = locale === 'en' ? '/' : `/${locale}`;
  const path =
    page === HOME_PAGE ? localeRootPath : getRelativeLocaleUrl(locale, page);
  return new URL(path, site).href;
}

function urlEntry(locale: Locale, page: string, site: URL): string {
  const alternateLinks = locales
    .map(
      (target) =>
        `    <xhtml:link rel="alternate" hreflang="${htmlLang[target]}" href="${pageUrl(target, page, site)}"/>`,
    )
    .join('\n');
  return `  <url>\n    <loc>${pageUrl(locale, page, site)}</loc>\n${alternateLinks}\n  </url>`;
}

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must set site');
  const urlEntries = sitemapPages.flatMap((page) =>
    locales.map((locale) => urlEntry(locale, page, site)),
  );
  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urlEntries,
    '</urlset>',
    '',
  ].join('\n');
  // Only `astro dev` uses this header; Workers static assets set it from the .xml extension.
  return new Response(sitemapXml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
