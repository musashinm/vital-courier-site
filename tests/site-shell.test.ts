import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { HTMLElement, parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const repoUrl = 'https://github.com/musashinm/vital-courier-site';

const pages = [
  {
    file: 'dist/privacy.html',
    ownPath: '/privacy',
    otherPath: '/pt-br/privacy',
    otherHreflang: 'pt-BR',
    currentLabel: 'EN',
    currentTitle: 'English',
    currentLang: 'en',
    otherLabel: 'PT-BR',
    otherTitle: 'Português do Brasil',
    otherLang: 'pt-BR',
    navLabel: 'Language',
    skipLink: 'Skip to content',
    footerLabel: 'Vital Courier on GitHub (opens in a new tab)',
  },
  {
    file: 'dist/pt-br/privacy.html',
    ownPath: '/pt-br/privacy',
    otherPath: '/privacy',
    otherHreflang: 'en',
    currentLabel: 'PT-BR',
    currentTitle: 'Português do Brasil',
    currentLang: 'pt-BR',
    otherLabel: 'EN',
    otherTitle: 'English',
    otherLang: 'en',
    navLabel: 'Idioma',
    skipLink: 'Pular para o conteúdo',
    footerLabel: 'Vital Courier no GitHub (abre em uma nova aba)',
  },
] as const;

// History, issues, GitHub privacy statement and the footer GitHub link.
const EXTERNAL_LINK_COUNT = 4;

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

  it('shows the Circuit lockup in a locale-aware brand link', () => {
    const brand = body(page.file).querySelector('header a.brand');
    expect(brand?.getAttribute('href')).toBe(page.ownPath);
    expect(brand?.getAttribute('aria-label')).toBeUndefined();
    const source = brand?.querySelector('picture > source');
    expect(source?.getAttribute('srcset')).toBe('/circuit-lockup-dark.svg');
    expect(source?.getAttribute('media')).toBe('(prefers-color-scheme: dark)');
    const img = brand?.querySelector('picture > img.brand-art');
    expect(img?.getAttribute('src')).toBe('/circuit-lockup-light.svg');
    expect(img?.getAttribute('alt')).toBe('Vital Courier');
    expect(img?.getAttribute('width')).toBe('191');
    expect(img?.getAttribute('height')).toBe('40');
    expect(brand?.text.trim()).toBe('');
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

  it('labels the footer GitHub link per locale', () => {
    const links = body(page.file).querySelectorAll('footer.site-footer a');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(repoUrl);
    expect(links[0].getAttribute('aria-label')).toBe(page.footerLabel);
    expect(links[0].text.trim()).toBe('GitHub');
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
      'a.skip-link, header a.brand, nav.language a',
    );
    expect(sameTabLinks).toHaveLength(3);
    for (const link of sameTabLinks) {
      expect(link.hasAttribute('target')).toBe(false);
    }
  });
});

// SHA-256 of the approved lockups in the vault's Design/Logo/Assets/ (Logo.md approved 2026-10-08).
// The vault isn't available in CI, so the hashes stand in for it. Change them only with a new logo approval.
describe('Circuit lockups', () => {
  it.each([
    [
      'circuit-lockup-light.svg',
      '6c1c57fa23f5d236d215180d505c44621329262115ff6114eb95029ab7bdef2e',
    ],
    [
      'circuit-lockup-dark.svg',
      'bdaa66987bc5558a3e6991cf5817e5c52ac87aa7c24d601559dcfb5fa19e8a98',
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
