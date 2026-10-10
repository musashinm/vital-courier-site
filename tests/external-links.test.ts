import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import externalLinks from '../src/markdown/external-links';

function buildTree(href: string): { tree: Root; link: Element } {
  const link: Element = {
    type: 'element',
    tagName: 'a',
    properties: { href },
    children: [{ type: 'text', value: 'link' }],
  };
  const paragraph: Element = {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: [link],
  };
  return { tree: { type: 'root', children: [paragraph] }, link };
}

function transform(tree: Root, path: string | undefined): void {
  externalLinks()(tree, { path });
}

describe('external-links rehype plugin', () => {
  it('opens external links in a new tab with the English warning', () => {
    const { tree, link } = buildTree('https://github.com/x');
    transform(tree, '/any/dir/src/content/privacy/en.md');

    expect(link.properties.target).toBe('_blank');
    expect(link.properties.rel).toEqual(['noopener', 'noreferrer']);
    expect(link.children[1]).toEqual({
      type: 'element',
      tagName: 'span',
      properties: { className: ['sr-only'] },
      children: [{ type: 'text', value: ' (opens in a new tab)' }],
    });
  });

  it('uses the Portuguese warning for pt-br.md', () => {
    const { tree, link } = buildTree('https://github.com/x');
    transform(tree, '/x/pt-br.md');

    expect(link.children[1]).toMatchObject({
      children: [{ type: 'text', value: ' (abre em uma nova aba)' }],
    });
  });

  it('throws for a Markdown file that is not named after a locale', () => {
    const { tree } = buildTree('https://github.com/x');
    expect(() => transform(tree, '/x/fr.md')).toThrow(/cannot tell the locale/);
  });

  it('throws when the file has no path', () => {
    const { tree } = buildTree('https://github.com/x');
    expect(() => transform(tree, undefined)).toThrow(/\(no path\)/);
  });

  it.each(['/privacy', '#main-content'])('leaves %s untouched', (href) => {
    const { tree, link } = buildTree(href);
    transform(tree, '/x/en.md');

    expect(link.properties).toEqual({ href });
    expect(link.children).toHaveLength(1);
  });
});
