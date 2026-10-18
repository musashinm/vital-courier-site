import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { HTMLElement, parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { expectLabelJoinedToIcon } from './html';

const repoUrl = 'https://github.com/musashinm/vital-courier-site';

const pages = [
  {
    file: 'dist/privacy.html',
    ownPath: '/privacy',
    otherPath: '/pt-br/privacy',
    homePath: '/',
    iosHref: '/#ios-app',
    iosText: 'iOS app',
    otherHreflang: 'pt-BR',
    currentLabel: 'EN',
    currentTitle: 'English',
    currentLang: 'en',
    otherLabel: 'PT-BR',
    otherTitle: 'Português do Brasil',
    otherLang: 'pt-BR',
    navLabel: 'Language',
    primaryNavLabel: 'Main',
    skipLink: 'Skip to content',
    footerLabel: 'Vital Courier on GitHub',
    historyLabel: 'See every change on GitHub',
    newTabWarning: ' (opens in a new tab)',
  },
  {
    file: 'dist/pt-br/privacy.html',
    ownPath: '/pt-br/privacy',
    otherPath: '/privacy',
    homePath: '/pt-br',
    iosHref: '/pt-br#ios-app',
    iosText: 'App para iOS',
    otherHreflang: 'en',
    currentLabel: 'PT-BR',
    currentTitle: 'Português do Brasil',
    currentLang: 'pt-BR',
    otherLabel: 'EN',
    otherTitle: 'English',
    otherLang: 'en',
    navLabel: 'Idioma',
    primaryNavLabel: 'Principal',
    skipLink: 'Pular para o conteúdo',
    footerLabel: 'Vital Courier no GitHub',
    historyLabel: 'Ver todas as mudanças no GitHub',
    newTabWarning: ' (abre em uma nova aba)',
  },
] as const;

// History, Cloudflare's privacy policy, issues, GitHub privacy statement and the footer GitHub link.
const EXTERNAL_LINK_COUNT = 5;

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]';

function childElements(element: HTMLElement): HTMLElement[] {
  return element.childNodes.filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

function body(file: string): HTMLElement {
  const root = parse(readFileSync(file, 'utf8'));
  const element = root.querySelector('body');
  if (!element) throw new Error(`${file} has no body`);
  return element;
}

describe.each(pages)('$file shell', (page) => {
  it('puts the accent rule and then the skip link first in the body', () => {
    const shell = body(page.file);
    expect(shell.classList.contains('site-shell')).toBe(true);
    const [accent, skip] = childElements(shell);
    expect(accent.classList.contains('site-accent')).toBe(true);
    expect(accent.getAttribute('aria-hidden')).toBe('true');
    expect(skip.classList.contains('skip-link')).toBe(true);
  });

  it('makes the skip link the first focusable element and points it at main', () => {
    const shell = body(page.file);
    const first = shell.querySelector(FOCUSABLE_SELECTOR);
    expect(first?.classList.contains('skip-link')).toBe(true);
    expect(first?.getAttribute('href')).toBe('#main-content');
    expect(first?.text.trim()).toBe(page.skipLink);
    expect(shell.querySelector('main#main-content')).not.toBeNull();
  });

  it('uses the shared site menu with home destinations', () => {
    const shell = body(page.file);
    expect(shell.querySelectorAll('header.site-menu')).toHaveLength(1);
    expect(shell.querySelector('.site-header')).toBeNull();
    const header = shell.querySelector('header.site-menu')!;
    const navs = header.querySelectorAll('nav');
    expect(navs).toHaveLength(2);
    for (const nav of navs) expect(nav.querySelector('nav')).toBeNull();
    expect(
      header
        .querySelector('nav.site-menu__primary')
        ?.getAttribute('aria-label'),
    ).toBe(page.primaryNavLabel);
    expect(
      header.querySelector('nav.language')?.getAttribute('aria-label'),
    ).toBe(page.navLabel);
    const brand = header.querySelector('a.brand');
    expect(brand?.getAttribute('href')).toBe(page.homePath);
    expect(
      brand?.querySelector('picture > img.brand-art')?.getAttribute('alt'),
    ).toBe('Vital Courier');
    expect(brand?.querySelectorAll('picture > source')).toHaveLength(3);
    const ios = header.querySelector('a.site-menu__ios');
    expect(ios?.getAttribute('href')).toBe(page.iosHref);
    expect(ios?.text.trim()).toBe(page.iosText);
  });

  it('places the menu between the skip link and main', () => {
    const [, , menu, main] = childElements(body(page.file));
    expect(menu.tagName).toBe('HEADER');
    expect(menu.classList.contains('site-menu')).toBe(true);
    expect(main.id).toBe('main-content');
  });

  it('marks the current language and links the other one', () => {
    const nav = body(page.file).querySelector('nav.language');
    expect(nav?.getAttribute('aria-label')).toBe(page.navLabel);
    expect(nav?.querySelectorAll('h2')).toHaveLength(0);

    const current = nav?.querySelector('span[aria-current="page"] > abbr');
    expect(current?.text.trim()).toBe(page.currentLabel);
    expect(current?.getAttribute('title')).toBe(page.currentTitle);
    expect(current?.getAttribute('lang')).toBe(page.currentLang);

    const links = nav?.querySelectorAll('a') ?? [];
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(page.otherPath);
    expect(links[0].getAttribute('hreflang')).toBe(page.otherHreflang);
    const other = links[0].querySelector('abbr');
    expect(other?.text.trim()).toBe(page.otherLabel);
    expect(other?.getAttribute('title')).toBe(page.otherTitle);
    expect(other?.getAttribute('lang')).toBe(page.otherLang);
  });

  it('wraps the policy in the prose classes and splits the meta line', () => {
    const article = body(page.file).querySelector('main article');
    expect(article?.classList.contains('prose')).toBe(true);
    expect(article?.classList.contains('policy-prose')).toBe(true);
    const meta = article?.querySelector('p.policy-meta');
    const dateSpan = meta?.querySelector('time')?.parentNode;
    expect(dateSpan?.tagName).toBe('SPAN');
    expect(dateSpan?.parentNode).toBe(meta);
    const separator = dateSpan?.querySelector('span.policy-meta__separator');
    expect(separator?.getAttribute('aria-hidden')).toBe('true');
    expect(separator?.text).toBe(' · ');
    const history = childElements(meta!).find(
      (element) => element.tagName === 'A',
    );
    expect(history?.getAttribute('href')).toContain(
      '/commits/main/src/content/privacy/',
    );
  });

  it('labels the footer GitHub link with its visible text, icon and warning', () => {
    const links = body(page.file).querySelectorAll('footer.site-footer a');
    expect(links).toHaveLength(1);
    const [footerLink] = links;
    expect(footerLink.getAttribute('href')).toBe(repoUrl);
    expect(footerLink.getAttribute('aria-label')).toBeUndefined();
    expectLabelJoinedToIcon(footerLink, page.footerLabel);
    expect(footerLink.querySelector('span.sr-only')?.text).toBe(
      page.newTabWarning,
    );
  });

  it('joins the history link label to its icon', () => {
    const historyLink = body(page.file).querySelector(
      'p.policy-meta a[href*="/commits/main/"]',
    );
    expect(historyLink).not.toBeNull();
    expectLabelJoinedToIcon(historyLink!, page.historyLabel);
    expect(historyLink!.querySelector('span.sr-only')?.text).toBe(
      page.newTabWarning,
    );
  });

  it('opens every external link in a new tab without leaking the opener', () => {
    const externalLinks = body(page.file).querySelectorAll('a[href^="http"]');
    expect(externalLinks).toHaveLength(EXTERNAL_LINK_COUNT);
    for (const link of externalLinks) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('keeps the brand, language-switch and skip links in the same tab', () => {
    const sameTabLinks = body(page.file).querySelectorAll(
      'a.skip-link, header a.brand, a.site-menu__ios, nav.language a',
    );
    expect(sameTabLinks).toHaveLength(4);
    for (const link of sameTabLinks) {
      expect(link.hasAttribute('target')).toBe(false);
    }
  });
});

// SHA-256 of the approved lockups and symbols in the vault's Design/Logo/Assets/ (Logo.md approved 2026-10-08).
// The vault isn't available in CI, so the hashes stand in for it. Change them only with a new logo approval.
describe('Circuit artwork', () => {
  it.each([
    [
      'circuit-lockup-light.svg',
      '6c1c57fa23f5d236d215180d505c44621329262115ff6114eb95029ab7bdef2e',
    ],
    [
      'circuit-lockup-dark.svg',
      'bdaa66987bc5558a3e6991cf5817e5c52ac87aa7c24d601559dcfb5fa19e8a98',
    ],
    [
      'circuit-symbol-light.svg',
      'dbac72b69cf5a1b5e47ff663a3c9fcdd449f607cb576dab6256bf161205226d5',
    ],
    [
      'circuit-symbol-dark.svg',
      'd30fc1c12bae2d1037716d41b61305b7fcbf027dc9ccfd58d1b6f8ff37de4273',
    ],
  ])(
    'ships %s byte-identical to the approved logo asset',
    (file, approvedSha256) => {
      const sha256 = createHash('sha256')
        .update(readFileSync(`dist/${file}`))
        .digest('hex');
      expect(sha256).toBe(approvedSha256);
    },
  );
});

function metaContent(file: string, selector: string): string | undefined {
  const root = parse(readFileSync(file, 'utf8'));
  return root.querySelector(selector)?.getAttribute('content');
}

describe('policy viewport', () => {
  it.each(['dist/privacy.html', 'dist/pt-br/privacy.html'])(
    'keeps the policy viewport meta unchanged in %s',
    (file) => {
      expect(metaContent(file, 'meta[name="viewport"]')).toBe(
        'width=device-width, initial-scale=1',
      );
    },
  );
});

const homePages = [
  {
    file: 'dist/index.html',
    canonical: 'https://vitalcourier.app/',
  },
  {
    file: 'dist/pt-br.html',
    canonical: 'https://vitalcourier.app/pt-br',
  },
] as const;

describe('home variant shell', () => {
  it.each(homePages)(
    'gives only the home variant viewport-fit=cover in $file',
    ({ file }) => {
      expect(metaContent(file, 'meta[name="viewport"]')).toBe(
        'width=device-width, initial-scale=1, viewport-fit=cover',
      );
    },
  );

  it.each(homePages)(
    'resolves locale roots without a trailing slash in $file',
    ({ file, canonical }) => {
      const root = parse(readFileSync(file, 'utf8'));
      expect(
        root.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ).toBe(canonical);
      const alternates = Object.fromEntries(
        root
          .querySelectorAll('link[rel="alternate"]')
          .map((link) => [
            link.getAttribute('hreflang'),
            link.getAttribute('href'),
          ]),
      );
      expect(alternates).toEqual({
        en: 'https://vitalcourier.app/',
        'pt-BR': 'https://vitalcourier.app/pt-br',
      });
    },
  );

  it.each(homePages)(
    'renders hero, then navigation, then main#main-content.home-main, then footer, after the accent and skip link in $file',
    ({ file }) => {
      const children = childElements(body(file));
      expect(children[0].classList.contains('site-accent')).toBe(true);
      expect(children[1].classList.contains('skip-link')).toBe(true);
      const mainIndex = children.findIndex(
        (child) => child.id === 'main-content',
      );
      expect(children[mainIndex].tagName).toBe('MAIN');
      expect(children[mainIndex].classList.contains('home-main')).toBe(true);
      const heroIndex = children.findIndex((child) =>
        child.querySelector('h1'),
      );
      const navigationIndex = children.findIndex((child) =>
        child.classList.contains('site-menu'),
      );
      const footerIndex = children.findIndex(
        (child) => child.tagName === 'FOOTER',
      );
      expect(heroIndex).toBeGreaterThan(1);
      expect(navigationIndex).toBeGreaterThan(heroIndex);
      expect(mainIndex).toBeGreaterThan(navigationIndex);
      expect(footerIndex).toBeGreaterThan(mainIndex);
    },
  );

  it.each(homePages)('has no policy header in $file', ({ file }) => {
    const shell = body(file);
    expect(shell.querySelectorAll('header.site-menu')).toHaveLength(1);
    expect(shell.querySelector('.site-main')).toBeNull();
  });
});
