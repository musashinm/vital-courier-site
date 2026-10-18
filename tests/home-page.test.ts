import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse, type HTMLElement } from 'node-html-parser';
import { ui, type Locale } from '../src/i18n/ui';

const HOME_PAGES: Record<Locale, string> = {
  en: 'dist/index.html',
  'pt-br': 'dist/pt-br/index.html',
};
const CIRCUIT_ID_PREFIX: Record<Locale, string> = {
  en: 'circuit-en',
  'pt-br': 'circuit-pt-br',
};
const APPROVED_ROUTE_PATH =
  'M26 6 C23.4 3.4 19.9 2 16 2 C8.268 2 2 8.268 2 16 C2 23.732 8.268 30 16 30 C19.9 30 23.4 28.6 26 26 L22 22 C20.4 23.3 18.3 24 16 24 C11.582 24 8 20.418 8 16 C8 11.582 11.582 8 16 8 C18.3 8 20.4 8.7 22 10 Z';
const APPROVED_DESTINATION_PATH = 'M24 13 H30 V19 H24 Z';
const TRACE_GUIDE_PATH =
  'M25 9 L24 8 C21.8 5.8 19 5 16 5 C9.925 5 5 9.925 5 16 C5 22.075 9.925 27 16 27 C19 27 21.8 26.2 24 24 L25 23';

function homeDocument(locale: Locale): HTMLElement {
  return parse(readFileSync(HOME_PAGES[locale], 'utf8'));
}

function required<T>(value: T | null | undefined): T {
  expect(value).toBeTruthy();
  return value as T;
}

describe.skipIf(!existsSync('dist/index.html'))('home hero', () => {
  const locales: Locale[] = ['en', 'pt-br'];

  it.each(locales)(
    'keeps the approved Circuit fill path byte for byte (%s)',
    (locale) => {
      const root = homeDocument(locale);
      expect(
        required(root.querySelector('path.hero-route')).getAttribute('d'),
      ).toBe(APPROVED_ROUTE_PATH);
      expect(
        required(root.querySelector('path.hero-destination')).getAttribute('d'),
      ).toBe(APPROVED_DESTINATION_PATH);
    },
  );

  it.each(locales)(
    'ships the trace guide with final-state presentation attributes (%s)',
    (locale) => {
      const guide = required(homeDocument(locale).querySelector('.hero-trace'));
      expect(guide.getAttribute('d')).toBe(TRACE_GUIDE_PATH);
      expect(guide.getAttribute('pathLength')).toBe('1');
      expect(guide.getAttribute('stroke-dasharray')).toBe('1');
      expect(guide.getAttribute('stroke-dashoffset')).toBe('0');
      expect(guide.getAttribute('stroke-width')).toBe('8');
      expect(guide.getAttribute('stroke-linecap')).toBe('butt');
      expect(guide.getAttribute('fill')).toBe('none');
    },
  );

  it.each(locales)(
    'scopes gradient and mask IDs to the locale (%s)',
    (locale) => {
      const html = readFileSync(HOME_PAGES[locale], 'utf8');
      const root = parse(html);
      const prefix = CIRCUIT_ID_PREFIX[locale];
      expect(
        required(root.querySelector('linearGradient')).getAttribute('id'),
      ).toBe(`${prefix}-gradient`);
      expect(required(root.querySelector('mask')).getAttribute('id')).toBe(
        `${prefix}-trace`,
      );
      const documentIds = new Set(
        root
          .querySelectorAll('[id]')
          .map((element) => element.getAttribute('id')),
      );
      const references = [...html.matchAll(/url\(#([^)]+)\)/g)];
      expect(references.length).toBeGreaterThan(0);
      for (const [, referencedId] of references) {
        expect(documentIds.has(referencedId), referencedId).toBe(true);
      }
    },
  );

  it.each(locales)(
    'keeps the h1 visible to assistive tech from first paint (%s)',
    (locale) => {
      const headings = homeDocument(locale).querySelectorAll('h1');
      expect(headings).toHaveLength(1);
      const [heading] = headings;
      for (const element of [heading, ...heading.querySelectorAll('*')]) {
        expect(element.hasAttribute('hidden')).toBe(false);
        expect(element.hasAttribute('aria-hidden')).toBe(false);
        expect(element.hasAttribute('style')).toBe(false);
      }
      expect(
        required(heading.querySelector('.hero-line-start')).text.trim(),
      ).toBe(ui[locale].home.headlineStart);
      expect(
        required(heading.querySelector('.hero-line-end')).text.trim(),
      ).toBe(ui[locale].home.headlineEnd);
    },
  );

  it.each(locales)('hides only the decoration (%s)', (locale) => {
    const root = homeDocument(locale);
    expect(
      required(root.querySelector('.hero-halo')).getAttribute('aria-hidden'),
    ).toBe('true');
    expect(
      required(root.querySelector('svg.hero-symbol')).getAttribute(
        'aria-hidden',
      ),
    ).toBe('true');
  });
});
