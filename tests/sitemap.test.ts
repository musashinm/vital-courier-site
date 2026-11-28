import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const SITE_ORIGIN = 'https://vitalcourier.app';
const BUILT_SITE_DIR = 'dist';

interface PageLinks {
  canonical: string;
  // [hreflang, href] pairs, sorted, kept as an array so a duplicate stays visible.
  alternates: string[][];
}

const byHreflangThenHref = (left: string[], right: string[]) =>
  left.join(' ').localeCompare(right.join(' '));

function builtHtmlFiles(): string[] {
  return readdirSync(BUILT_SITE_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.html'))
    .map((name) => `${BUILT_SITE_DIR}/${name}`);
}

function linksFromPage(file: string): PageLinks {
  const head = parse(readFileSync(file, 'utf8')).querySelector('head');
  if (!head) throw new Error(`${file} has no <head>`);
  const canonicalLinks = head.querySelectorAll('link[rel="canonical"]');
  if (canonicalLinks.length !== 1) {
    throw new Error(
      `${file} has ${canonicalLinks.length} canonical links in <head>, expected 1`,
    );
  }
  const canonical = canonicalLinks[0].getAttribute('href');
  if (!canonical) throw new Error(`${file} has no canonical link`);
  const alternates = head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .map((link) => [
      link.getAttribute('hreflang') ?? '',
      link.getAttribute('href') ?? '',
    ])
    .sort(byHreflangThenHref);
  return { canonical, alternates };
}

function linksFromSitemap(sitemapXml: string): PageLinks[] {
  return [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
    ([, urlBody]) => {
      const canonical = /<loc>([^<]+)<\/loc>/.exec(urlBody)?.[1];
      if (!canonical) throw new Error('sitemap <url> without <loc>');
      const alternates = [
        ...urlBody.matchAll(
          /<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g,
        ),
      ]
        .map(([, hreflang, href]) => [hreflang, href])
        .sort(byHreflangThenHref);
      return { canonical, alternates };
    },
  );
}

const byCanonical = (left: PageLinks, right: PageLinks) =>
  left.canonical.localeCompare(right.canonical);

describe('robots.txt', () => {
  const robotsLines = readFileSync(
    `${BUILT_SITE_DIR}/robots.txt`,
    'utf8',
  ).split('\n');

  it('allows every crawler, states the content signals and names the sitemap', () => {
    expect(robotsLines).toEqual([
      'User-agent: *',
      'Content-Signal: search=yes, ai-input=yes, ai-train=no',
      'Allow: /',
      '',
      `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
      '',
    ]);
  });

  it('points at a sitemap that the build actually writes', () => {
    const sitemapLine = robotsLines.find((line) =>
      line.startsWith('Sitemap: '),
    );
    expect(sitemapLine).toBeDefined();
    const sitemapPath = new URL(sitemapLine!.slice('Sitemap: '.length))
      .pathname;
    expect(existsSync(`${BUILT_SITE_DIR}${sitemapPath}`)).toBe(true);
  });
});

describe('sitemap.xml', () => {
  const sitemapXml = readFileSync(`${BUILT_SITE_DIR}/sitemap.xml`, 'utf8');

  it('is a sitemaps.org urlset that declares the xhtml namespace', () => {
    expect(
      sitemapXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n'),
    ).toBe(true);
    expect(sitemapXml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    );
    expect(sitemapXml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('is exactly a declaration, one urlset, and well-formed <url> entries inside it', () => {
    // Anchored at both ends, so an entry outside <urlset>, a stray tag inside an
    // entry or trailing text can't pass.
    const urlEntryPattern =
      '  <url>\\n    <loc>[^<]+</loc>\\n(?:    <xhtml:link rel="alternate" hreflang="[^"]+" href="[^"]+"/>\\n)+  </url>\\n';
    const wholeSitemapPattern = new RegExp(
      '^<\\?xml version="1\\.0" encoding="UTF-8"\\?>\\n' +
        '<urlset xmlns="http://www\\.sitemaps\\.org/schemas/sitemap/0\\.9" xmlns:xhtml="http://www\\.w3\\.org/1999/xhtml">\\n' +
        `(?:${urlEntryPattern})+` +
        '</urlset>\\n$',
    );
    expect(sitemapXml).toMatch(wholeSitemapPattern);
  });

  it('lists every built page once, by its canonical URL, with the same alternates the page declares', () => {
    const pagesFromHtml = builtHtmlFiles().map(linksFromPage).sort(byCanonical);
    const pagesFromSitemap = linksFromSitemap(sitemapXml).sort(byCanonical);
    expect(pagesFromSitemap).toEqual(pagesFromHtml);
  });

  it('pins the four public URLs, so a page that loses its canonical link still fails', () => {
    expect(
      linksFromSitemap(sitemapXml)
        .map((page) => page.canonical)
        .sort(),
    ).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/privacy`,
      `${SITE_ORIGIN}/pt-br`,
      `${SITE_ORIGIN}/pt-br/privacy`,
    ]);
  });
});
