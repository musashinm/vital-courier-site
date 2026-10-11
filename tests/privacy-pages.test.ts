import { existsSync, readFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const repoUrl = 'https://github.com/musashinm/vital-courier-site';
const githubPrivacyUrl =
  'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';

// Links whose every rel token is one of these point somewhere rather than load a resource, so the CSP never sees them.
const navigationLinkRels = ['canonical', 'alternate'];

const pages = [
  {
    locale: 'en',
    file: 'dist/privacy.html',
    url: 'https://vitalcourier.app/privacy',
    lang: 'en',
    otherPath: '/pt-br/privacy',
    dateLocale: 'en-US',
    lastUpdated: 'Last updated',
    title: 'Privacy Policy',
    opensInNewTab: ' (opens in a new tab)',
    warning: 'post health information',
    headings: [
      'What Vital Courier reads',
      'Reading in the background',
      'Where your data goes',
      'What stays on your iPhone',
      'Keeping and deleting data',
      'Turning off access',
      'What is never collected',
      'Children',
      'Changes to this policy',
      'Contact',
    ],
  },
  {
    locale: 'pt-br',
    file: 'dist/pt-br/privacy.html',
    url: 'https://vitalcourier.app/pt-br/privacy',
    lang: 'pt-BR',
    otherPath: '/privacy',
    dateLocale: 'pt-BR',
    lastUpdated: 'Última atualização',
    title: 'Política de Privacidade',
    opensInNewTab: ' (abre em uma nova aba)',
    warning: 'publique informações de saúde',
    headings: [
      'O que o Vital Courier lê',
      'Leitura em segundo plano',
      'Para onde vão seus dados',
      'O que fica no seu iPhone',
      'Como guardar e apagar dados',
      'Como desligar o acesso',
      'O que nunca é coletado',
      'Crianças',
      'Mudanças nesta política',
      'Contato',
    ],
  },
] as const;

function load(file: string): HTMLElement {
  return parse(readFileSync(file, 'utf8'));
}

function hrefs(root: HTMLElement): string[] {
  return root.querySelectorAll('a').map((a) => a.getAttribute('href') ?? '');
}

function frontmatterDate(locale: string): string {
  const source = readFileSync(`src/content/privacy/${locale}.md`, 'utf8');
  const match = source.match(/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
  if (!match) throw new Error(`no updated: date in ${locale}.md`);
  return match[1];
}

function expectedDate(
  locale: string,
  dateLocale: string,
): { iso: string; text: string } {
  const iso = frontmatterDate(locale);
  const [year, month, day] = iso.split('-').map(Number);
  const text = new Intl.DateTimeFormat(dateLocale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return { iso, text };
}

describe.each(pages)('$file', (page) => {
  it('exists', () => {
    expect(existsSync(page.file)).toBe(true);
  });

  it('has the policy title and every section heading in the raw HTML', () => {
    const root = load(page.file);
    expect(root.querySelector('h1')?.text.trim()).toBe(page.title);
    const h2s = root.querySelectorAll('h2').map((h) => h.text.trim());
    for (const heading of page.headings) expect(h2s).toContain(heading);
  });

  it('ships no client-side JavaScript', () => {
    expect(load(page.file).querySelectorAll('script')).toHaveLength(0);
  });

  it('has no inline styles or event handlers for the CSP to block', () => {
    const root = load(page.file);
    expect(root.querySelectorAll('style')).toHaveLength(0);
    const attributeNames = root
      .querySelectorAll('*')
      .flatMap((element) => Object.keys(element.attributes))
      .map((name) => name.toLowerCase());
    expect(attributeNames).not.toContain('style');
    expect(attributeNames.filter((name) => name.startsWith('on'))).toEqual([]);
  });

  it('loads styles and images only from its own origin', () => {
    const root = load(page.file);
    const srcsetUrls = root
      .querySelectorAll('img[srcset], source')
      .flatMap((element) =>
        (element.getAttribute('srcset') ?? '')
          .split(',')
          .map((candidate) => candidate.trim().split(/\s+/)[0]),
      );
    const resourceUrls = [
      ...root
        .querySelectorAll('link')
        .filter(
          (link) =>
            !(link.getAttribute('rel') ?? '')
              .toLowerCase()
              .split(/\s+/)
              .every((token) => navigationLinkRels.includes(token)),
        )
        .map((link) => link.getAttribute('href')),
      ...root.querySelectorAll('img').map((image) => image.getAttribute('src')),
      ...srcsetUrls,
    ];
    expect(resourceUrls.length).toBeGreaterThan(0);
    for (const url of resourceUrls) expect(url).toMatch(/^\/(?!\/)/);
  });

  it('sets the html lang attribute', () => {
    expect(load(page.file).querySelector('html')?.getAttribute('lang')).toBe(
      page.lang,
    );
  });

  it('links to the other language policy directly', () => {
    expect(hrefs(load(page.file))).toContain(page.otherPath);
  });

  it('links to its own file history, the issues page and the GitHub privacy statement', () => {
    const links = hrefs(load(page.file));
    expect(links).toContain(
      `${repoUrl}/commits/main/src/content/privacy/${page.locale}.md`,
    );
    expect(links).toContain(`${repoUrl}/issues`);
    expect(links).toContain(githubPrivacyUrl);
  });

  it('tells screen readers that the policy body links open in a new tab', () => {
    const root = load(page.file);
    const linkHrefs = [
      `${repoUrl}/commits/main/src/content/privacy/${page.locale}.md`,
      `${repoUrl}/issues`,
      githubPrivacyUrl,
    ];
    for (const href of linkHrefs) {
      const link = root.querySelector(`a[href="${href}"]`);
      expect(link?.querySelector('span.sr-only')?.text).toBe(
        page.opensInNewTab,
      );
    }
  });

  it('warns not to post health information in an issue', () => {
    expect(load(page.file).text).toContain(page.warning);
  });

  it('has a canonical link and both hreflang alternates', () => {
    const root = load(page.file);
    expect(
      root.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(page.url);
    const alternates = Object.fromEntries(
      root
        .querySelectorAll('link[rel="alternate"]')
        .map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]),
    );
    expect(alternates).toEqual({
      en: 'https://vitalcourier.app/privacy',
      'pt-BR': 'https://vitalcourier.app/pt-br/privacy',
    });
  });

  it('shows the frontmatter date as the last updated date, in UTC', () => {
    const { iso, text: expected } = expectedDate(page.locale, page.dateLocale);
    const root = load(page.file);
    const time = root.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe(iso);
    expect(time?.text.trim()).toBe(expected);
    expect(root.text).toContain(page.lastUpdated);
  });

  it('keeps the spaces around the date and the history link in the meta line', () => {
    const { text: expected } = expectedDate(page.locale, page.dateLocale);
    const meta = load(page.file).querySelector('time')?.parentNode;
    expect(meta?.text).toContain(`${page.lastUpdated}: ${expected} · `);
  });
});
