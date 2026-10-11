import { readFileSync } from 'node:fs';
import { HTMLElement, TextNode, parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { pathProperties, svgProperties } from '../src/icons/external-link';

const WORD_JOINER = '\u2060';
// The current policy has eleven sections; a deliberate section edit should update this.
const SECTION_COUNT = 11;
// History, Cloudflare's privacy policy, issues, GitHub privacy statement and the footer GitHub link.
const NEW_TAB_LINK_COUNT = 5;

// HAST property names that serialize differently; attribute names are compared lowercased.
const ATTRIBUTE_NAMES: Record<string, string> = {
  className: 'class',
  viewBox: 'viewbox',
  ariaHidden: 'aria-hidden',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeWidth: 'stroke-width',
};

const pages = [
  {
    file: 'dist/privacy.html',
    onThisPage: 'On this page',
    backToContents: 'Back to contents',
    newTabWarning: ' (opens in a new tab)',
    firstSectionId: 'what-vital-courier-reads',
  },
  {
    file: 'dist/pt-br/privacy.html',
    onThisPage: 'Nesta página',
    backToContents: 'Voltar ao conteúdo',
    newTabWarning: ' (abre em uma nova aba)',
    firstSectionId: 'o-que-o-vital-courier-lê',
  },
] as const;

function load(file: string): HTMLElement {
  return parse(readFileSync(file, 'utf8'));
}

function article(file: string): HTMLElement {
  const element = load(file).querySelector('article.policy-prose');
  if (!element) throw new Error(`${file} has no policy article`);
  return element;
}

function childElements(element: HTMLElement): HTMLElement[] {
  return element.childNodes.filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

function describeElement(element: HTMLElement): string {
  const id = element.id ? `#${element.id}` : '';
  const className = element.getAttribute('class');
  return `${element.tagName}${id}${className ? `.${className}` : ''}`;
}

function expectedAttributes(
  properties: Record<string, string | string[]>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(properties).map(([name, value]) => [
      ATTRIBUTE_NAMES[name] ?? name.toLowerCase(),
      Array.isArray(value) ? value.join(' ') : value,
    ]),
  );
}

function actualAttributes(element: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    Object.entries(element.attributes).map(([name, value]) => [
      name.toLowerCase(),
      value,
    ]),
  );
}

describe.each(pages)('$file wayfinding', (page) => {
  it('puts the lead, then the contents, before the first section', () => {
    const order = childElements(article(page.file))
      .slice(0, 5)
      .map(describeElement);
    expect(order).toEqual([
      'H1',
      'P.policy-meta',
      'P.policy-lead',
      'NAV#policy-toc.policy-toc',
      `H2#${page.firstSectionId}`,
    ]);
  });

  it('lists every section, in order, by its exact id', () => {
    const policy = article(page.file);
    const headings = policy.querySelectorAll('h2');
    const contentsLinks = policy.querySelectorAll('nav#policy-toc a');
    expect(headings).toHaveLength(SECTION_COUNT);
    expect(contentsLinks).toHaveLength(SECTION_COUNT);
    expect(contentsLinks.map((link) => link.getAttribute('href'))).toEqual(
      headings.map((heading) => `#${heading.id}`),
    );
    expect(contentsLinks.map((link) => link.text.trim())).toEqual(
      headings.map((heading) => heading.text.trim()),
    );
  });

  it('names the contents by its visible title and keeps list semantics', () => {
    const nav = article(page.file).querySelector('nav#policy-toc');
    expect(nav?.getAttribute('aria-labelledby')).toBe('policy-toc-title');
    expect(nav?.getAttribute('aria-label')).toBeUndefined();
    const title = nav?.querySelector('#policy-toc-title');
    expect(title?.tagName).toBe('P');
    expect(title?.text.trim()).toBe(page.onThisPage);
    expect(
      nav?.querySelector('ul.policy-toc__list')?.getAttribute('role'),
    ).toBe('list');
    expect(nav?.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0);
  });

  it('keeps contents links in the same tab without icons', () => {
    for (const link of article(page.file).querySelectorAll(
      'nav#policy-toc a',
    )) {
      expect(link.getAttribute('target')).toBeUndefined();
      expect(link.getAttribute('rel')).toBeUndefined();
      expect(link.querySelectorAll('svg')).toHaveLength(0);
    }
  });

  it('ends every section with one return link to the contents', () => {
    const policy = article(page.file);
    const returns = policy.querySelectorAll('.policy-section-return');
    expect(returns).toHaveLength(SECTION_COUNT);
    for (const returnParagraph of returns) {
      expect(returnParagraph.tagName).toBe('P');
      const [link, ...extra] = childElements(returnParagraph);
      expect(extra).toHaveLength(0);
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('#policy-toc');
      expect(link.getAttribute('target')).toBeUndefined();
      expect(link.text.trim()).toBe(page.backToContents);
      expect(
        returnParagraph.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      ).toHaveLength(0);
    }

    const children = childElements(policy);
    const headingIndexes = children.flatMap((child, index) =>
      child.tagName === 'H2' ? [index] : [],
    );
    for (const headingIndex of headingIndexes.slice(1)) {
      expect(
        children[headingIndex - 1].classList.contains('policy-section-return'),
      ).toBe(true);
    }
    expect(children.at(-1)?.classList.contains('policy-section-return')).toBe(
      true,
    );
  });

  it('marks every new-tab link with one icon and the warning', () => {
    const newTabLinks = load(page.file).querySelectorAll('a[target="_blank"]');
    expect(newTabLinks).toHaveLength(NEW_TAB_LINK_COUNT);
    for (const link of newTabLinks) {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      const icons = link.querySelectorAll('svg.external-link-icon');
      expect(icons).toHaveLength(1);
      expect(icons[0].getAttribute('aria-hidden')).toBe('true');
      expect(
        link.querySelectorAll('span.sr-only').map((span) => span.text),
      ).toEqual([page.newTabWarning]);
    }
  });

  it('puts the icon right after a label ending in one word joiner', () => {
    for (const link of load(page.file).querySelectorAll('a[target="_blank"]')) {
      const icon = link.querySelector('svg.external-link-icon')!;
      const iconIndex = link.childNodes.indexOf(icon);
      expect(iconIndex).toBeGreaterThan(0);
      const labelNode = link.childNodes[iconIndex - 1];
      expect(labelNode).toBeInstanceOf(TextNode);
      expect(labelNode.text.trim()).not.toBe(WORD_JOINER);
      expect(labelNode.text.endsWith(WORD_JOINER)).toBe(true);
      expect(labelNode.text.endsWith(`${WORD_JOINER}${WORD_JOINER}`)).toBe(
        false,
      );
    }
  });

  it('draws every icon from the shared geometry', () => {
    const icons = load(page.file).querySelectorAll('svg.external-link-icon');
    expect(icons).toHaveLength(NEW_TAB_LINK_COUNT);
    for (const icon of icons) {
      expect(actualAttributes(icon)).toEqual(expectedAttributes(svgProperties));
      const [path, ...extra] = childElements(icon);
      expect(extra).toHaveLength(0);
      expect(path.tagName).toBe('PATH');
      expect(actualAttributes(path)).toEqual(
        expectedAttributes(pathProperties),
      );
    }
  });
});
