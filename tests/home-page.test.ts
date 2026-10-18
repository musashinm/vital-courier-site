import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse, type HTMLElement } from 'node-html-parser';
import { appRepoUrl, ui, type Locale } from '../src/i18n/ui';
import { assertAssetExists, homeAssets } from '../src/home/assets';
import { allowedUrlPattern, normalizeUrl } from './allowed-urls';
import { expectLabelJoinedToIcon } from './html';

const HOME_PAGES: Record<Locale, string> = {
  en: 'dist/index.html',
  'pt-br': 'dist/pt-br.html',
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

describe('home hero', () => {
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
        required(root.querySelector('lineargradient')).getAttribute('id'),
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
    'wires the mask, gradient and painted paths together (%s)',
    (locale) => {
      const root = homeDocument(locale);
      const prefix = CIRCUIT_ID_PREFIX[locale];
      const gradientUrl = `url(#${prefix}-gradient)`;
      expect(
        required(root.querySelector('path.hero-route')).getAttribute('mask'),
      ).toBe(`url(#${prefix}-trace)`);
      for (const selector of ['path.hero-route', 'path.hero-destination']) {
        expect(
          required(root.querySelector(selector)).getAttribute('fill'),
          selector,
        ).toBe(gradientUrl);
      }
      const gradient = required(root.querySelector('lineargradient'));
      expect(gradient.getAttribute('x1')).toBe('0');
      expect(gradient.getAttribute('y1')).toBe('2');
      expect(gradient.getAttribute('x2')).toBe('0');
      expect(gradient.getAttribute('y2')).toBe('30');
      expect(gradient.getAttribute('gradientUnits')).toBe('userSpaceOnUse');
      const stops = gradient
        .querySelectorAll('stop')
        .map((stop) => [
          stop.getAttribute('offset'),
          stop.getAttribute('stop-color')?.toUpperCase(),
        ]);
      expect(stops).toEqual([
        ['0', '#5F57D8'],
        ['.5', '#4F46C7'],
        ['1', '#3F37A8'],
      ]);
      const mask = required(root.querySelector('mask'));
      expect(mask.getAttribute('maskUnits')).toBe('userSpaceOnUse');
      expect(mask.getAttribute('x')).toBe('0');
      expect(mask.getAttribute('y')).toBe('0');
      expect(mask.getAttribute('width')).toBe('32');
      expect(mask.getAttribute('height')).toBe('32');
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

const PAGE_EXPECTATIONS = [
  {
    file: 'dist/index.html',
    locale: 'en',
    htmlLang: 'en',
    brandHref: '/',
    otherHref: '/pt-br',
    privacyHref: '/privacy',
    navLabels: ['Main', 'Language'],
    iosText: 'iOS app',
    newTabWarning: ' (opens in a new tab)',
  },
  {
    file: 'dist/pt-br.html',
    locale: 'pt-br',
    htmlLang: 'pt-BR',
    brandHref: '/pt-br',
    otherHref: '/',
    privacyHref: '/pt-br/privacy',
    navLabels: ['Principal', 'Idioma'],
    iosText: 'App para iOS',
    newTabWarning: ' (abre em uma nova aba)',
  },
] as const;

describe('home assets', () => {
  it('makes the loader throw when a localized asset is missing', () => {
    expect(() => homeAssets('pt-br', () => false)).toThrow(
      'Missing home asset for pt-br: /home/data-types-pt-br.png',
    );
    expect(homeAssets('pt-br', () => true).dataTypesSrc).toBe(
      '/home/data-types-pt-br.png',
    );
  });

  it('throws when a localized asset is missing', () => {
    expect(() => assertAssetExists('public/home/x.png', () => false)).toThrow(
      'Missing home asset',
    );
    expect(() =>
      assertAssetExists('public/home/x.png', () => true),
    ).not.toThrow();
  });
});

describe.each(PAGE_EXPECTATIONS)('$file home page', (page) => {
  const strings = ui[page.locale].home;
  const root = () => homeDocument(page.locale);
  const main = () => required(root().querySelector('main#main-content'));

  it('declares language, title and description', () => {
    expect(required(root().querySelector('html')).getAttribute('lang')).toBe(
      page.htmlLang,
    );
    expect(required(root().querySelector('title')).text).toBe('Vital Courier');
    expect(
      required(root().querySelector('meta[name="description"]')).getAttribute(
        'content',
      ),
    ).toBe(strings.metaDescription);
  });

  it('keeps the skip link first and main as the home-main landmark', () => {
    const first = required(root().querySelector('a[href]'));
    expect(first.classList.contains('skip-link')).toBe(true);
    expect(first.getAttribute('href')).toBe('#main-content');
    expect(main().classList.contains('home-main')).toBe(true);
  });

  it('follows the approved focus order', () => {
    const hrefs = root()
      .querySelectorAll('a[href]')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual([
      '#main-content',
      page.brandHref,
      '#ios-app',
      page.otherHref,
      appRepoUrl,
      page.privacyHref,
      appRepoUrl,
    ]);
  });

  it('puts two sibling navs in a header after the hero', () => {
    const document = root();
    const header = required(document.querySelector('header.home-nav'));
    expect(
      header.querySelectorAll('nav').map((n) => n.getAttribute('aria-label')),
    ).toEqual(page.navLabels);
    for (const nav of header.querySelectorAll('nav')) {
      expect(nav.querySelector('nav')).toBeNull();
    }
    const body = required(document.querySelector('body'));
    const children = body.childNodes.filter(
      (node): node is HTMLElement => 'classList' in node,
    );
    const heroIndex = children.findIndex((c) => c.classList.contains('hero'));
    const navIndex = children.indexOf(header);
    expect(heroIndex).toBeGreaterThan(-1);
    expect(navIndex).toBeGreaterThan(heroIndex);
  });

  it('links the brand and the iOS anchor', () => {
    const header = required(root().querySelector('header.home-nav'));
    expect(required(header.querySelector('a.brand')).getAttribute('href')).toBe(
      page.brandHref,
    );
    const ios = required(header.querySelector('a.home-nav__ios'));
    expect(ios.getAttribute('href')).toBe('#ios-app');
    expect(ios.text.trim()).toBe(page.iosText);
    expect(root().querySelector('section#ios-app')).not.toBeNull();
  });

  it('shows the current locale as a non-link and links the other', () => {
    const language = required(root().querySelector('.home-nav nav.language'));
    expect(language.querySelectorAll('span[aria-current="page"]')).toHaveLength(
      1,
    );
    expect(language.querySelectorAll('a')).toHaveLength(1);
    expect(required(language.querySelector('a')).getAttribute('href')).toBe(
      page.otherHref,
    );
  });

  it('keeps the heading hierarchy', () => {
    const levels = root()
      .querySelectorAll('h1, h2, h3, h4')
      .map((h) => h.tagName);
    expect(levels).toEqual([
      'H1',
      'H2',
      'H3',
      'H3',
      'H3',
      'H2',
      'H3',
      'H3',
      'H3',
      'H2',
    ]);
    expect(root().querySelectorAll('h1')).toHaveLength(1);
    for (const section of main().querySelectorAll('section')) {
      expect(section.querySelectorAll('h2')).toHaveLength(1);
    }
  });

  it('lists the screenshots in order with localized images', () => {
    const shots = main().querySelectorAll('.shot');
    expect(shots.map((s) => s.querySelector('h3')?.text)).toEqual(
      strings.screens.items.map((item) => item.title),
    );
    const images = main().querySelectorAll('img.phone-capture');
    expect(images).toHaveLength(2);
    const suffix = page.locale;
    const expected = [
      [`/home/data-types-${suffix}.png`, strings.screens.items[0].alt],
      [`/home/destination-${suffix}.png`, strings.screens.items[1].alt],
    ];
    images.forEach((image, index) => {
      expect(image.getAttribute('src')).toBe(expected[index][0]);
      expect(image.getAttribute('alt')).toBe(expected[index][1]);
      expect(image.getAttribute('width')).toBe('840');
      expect(image.getAttribute('height')).toBe('1821');
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('decoding')).toBe('async');
    });
    expect(shots[2].classList.contains('shot--note')).toBe(true);
  });

  it('renders the Markdown example as escaped text', () => {
    // node-html-parser treats <pre> content as raw text unless told otherwise.
    const parsed = parse(readFileSync(page.file, 'utf8'), {
      blockTextElements: { script: true, noscript: true, style: true },
    });
    const frame = required(parsed.querySelector('figure.note-frame'));
    expect(frame.getAttribute('aria-label')).toBe(
      strings.screens.markdownLabel,
    );
    expect(required(frame.querySelector('.note-frame__bar')).text.trim()).toBe(
      strings.screens.markdownFilename,
    );
    const raw = readFileSync(
      `src/content/home/example-${page.locale}.md`,
      'utf8',
    );
    expect(required(frame.querySelector('pre code')).text).toBe(
      raw.replace(/\n$/, ''),
    );
    const syntax = frame.querySelectorAll('.note-syntax');
    expect(syntax.length).toBeGreaterThan(0);
    for (const span of syntax) expect(span.text).toBe('---');
  });

  it('joins both app-repo links to their icon', () => {
    const links = root().querySelectorAll(`a[href="${appRepoUrl}"]`);
    expect(links).toHaveLength(2);
    const labels = [strings.philosophy.sourceLink, strings.footer.source];
    links.forEach((link, index) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expectLabelJoinedToIcon(link, labels[index]);
      expect(required(link.querySelector('span.sr-only')).text).toBe(
        page.newTabWarning,
      );
    });
  });

  it('renders the footer', () => {
    const footer = required(root().querySelector('footer.home-footer'));
    expect(
      required(footer.querySelector('a[href^="/"]')).getAttribute('href'),
    ).toBe(page.privacyHref);
    expect(required(footer.querySelector('p')).text).toBe(
      strings.footer.context,
    );
  });

  it('shows the pre-approval App Store panel with no control', () => {
    const section = required(root().querySelector('#ios-app'));
    for (const selector of ['a', 'img', 'button']) {
      expect(section.querySelector(selector)).toBeNull();
    }
    expect(section.text).toContain(strings.appStore.preHeading);
    expect(section.text).toContain(strings.appStore.preBody);
  });

  it('has nothing for the CSP to block', () => {
    expect(root().querySelectorAll('script')).toHaveLength(0);
    expect(root().querySelectorAll('style')).toHaveLength(0);
    for (const element of root().querySelectorAll('*')) {
      const names = Object.keys(element.attributes);
      expect(names).not.toContain('style');
      expect(names.filter((name) => name.startsWith('on'))).toEqual([]);
    }
    const urls = [
      ...root()
        .querySelectorAll('img')
        .map((i) => i.getAttribute('src')),
      ...root()
        .querySelectorAll('link[rel="stylesheet"]')
        .map((l) => l.getAttribute('href')),
    ];
    for (const url of urls) {
      expect(normalizeUrl(url ?? '')).toMatch(allowedUrlPattern);
      expect(url).toMatch(/^\//);
    }
  });
});
