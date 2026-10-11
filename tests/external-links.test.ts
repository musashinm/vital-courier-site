import type { Element, ElementContent, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import externalLinks from '../src/markdown/external-links';

const WORD_JOINER = '\u2060';

const EXPECTED_ICON = {
  type: 'element',
  tagName: 'svg',
  properties: {
    className: ['external-link-icon'],
    viewBox: '0 0 24 24',
    width: '14',
    height: '14',
    ariaHidden: 'true',
    focusable: 'false',
  },
  children: [
    {
      type: 'element',
      tagName: 'path',
      properties: {
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '2',
        d: 'M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
      },
      children: [],
    },
  ],
};

function buildTree(
  href: string,
  linkChildren: ElementContent[] = [{ type: 'text', value: 'link' }],
): { tree: Root; link: Element } {
  const link: Element = {
    type: 'element',
    tagName: 'a',
    properties: { href },
    children: linkChildren,
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
  it('opens external links in a new tab with the joiner, icon and English warning', () => {
    const { tree, link } = buildTree('https://github.com/x');
    transform(tree, '/any/dir/src/content/privacy/en.md');

    expect(link.properties.target).toBe('_blank');
    expect(link.properties.rel).toEqual(['noopener', 'noreferrer']);
    expect(link.children).toHaveLength(3);
    expect(link.children[0]).toEqual({
      type: 'text',
      value: `link${WORD_JOINER}`,
    });
    expect(link.children[1]).toEqual(EXPECTED_ICON);
    expect(link.children[2]).toEqual({
      type: 'element',
      tagName: 'span',
      properties: { className: ['sr-only'] },
      children: [{ type: 'text', value: ' (opens in a new tab)' }],
    });
  });

  it('uses the Portuguese warning for pt-br.md', () => {
    const { tree, link } = buildTree('https://github.com/x');
    transform(tree, '/x/pt-br.md');

    expect(link.children[2]).toMatchObject({
      children: [{ type: 'text', value: ' (abre em uma nova aba)' }],
    });
  });

  it.each(['strong', 'em', 'code'])(
    'joins the last word inside a trailing <%s>',
    (tagName) => {
      const nested: Element = {
        type: 'element',
        tagName,
        properties: {},
        children: [{ type: 'text', value: 'GitHub' }],
      };
      const { tree, link } = buildTree('https://github.com/x', [
        { type: 'text', value: 'See ' },
        nested,
      ]);
      transform(tree, '/x/en.md');

      expect(link.children[0]).toEqual({ type: 'text', value: 'See ' });
      expect(nested.children).toEqual([
        { type: 'text', value: `GitHub${WORD_JOINER}` },
      ]);
      expect(link.children[2]).toEqual(EXPECTED_ICON);
    },
  );

  it('drops trailing whitespace so nothing sits between the joiner and the icon', () => {
    const { tree, link } = buildTree('https://github.com/x', [
      { type: 'text', value: 'GitHub  ' },
      { type: 'text', value: '\n ' },
    ]);
    transform(tree, '/x/en.md');

    expect(link.children[0]).toEqual({
      type: 'text',
      value: `GitHub${WORD_JOINER}`,
    });
    expect(link.children[1]).toEqual(EXPECTED_ICON);
  });

  it('adds no second joiner to text that already ends in one', () => {
    const { tree, link } = buildTree('https://github.com/x', [
      { type: 'text', value: `GitHub${WORD_JOINER}` },
    ]);
    transform(tree, '/x/en.md');

    expect(link.children[0]).toEqual({
      type: 'text',
      value: `GitHub${WORD_JOINER}`,
    });
  });

  it('changes nothing when run a second time', () => {
    const { tree, link } = buildTree('https://github.com/x');
    transform(tree, '/x/en.md');
    transform(tree, '/x/en.md');

    expect(link.children).toHaveLength(3);
    expect(link.children[0]).toEqual({
      type: 'text',
      value: `link${WORD_JOINER}`,
    });
    expect(link.children[1]).toEqual(EXPECTED_ICON);
    expect(link.children[2]).toMatchObject({
      children: [{ type: 'text', value: ' (opens in a new tab)' }],
    });
  });

  it('marks an image-only link with the no-text class and no joiner', () => {
    const image: Element = {
      type: 'element',
      tagName: 'img',
      properties: { src: '/x.svg', alt: '' },
      children: [],
    };
    const { tree, link } = buildTree('https://github.com/x', [image]);
    transform(tree, '/x/en.md');

    expect(link.properties.className).toEqual(['external-link--no-text']);
    expect(link.children[0]).toBe(image);
    expect(link.children[1]).toEqual(EXPECTED_ICON);
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
    expect(link.children).toEqual([{ type: 'text', value: 'link' }]);
  });
});
