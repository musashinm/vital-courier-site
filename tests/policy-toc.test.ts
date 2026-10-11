import type { Element, ElementContent, Root, RootContent } from 'hast';
import { describe, expect, it } from 'vitest';
import policyToc from '../src/markdown/policy-toc';

function text(value: string): ElementContent {
  return { type: 'text', value };
}

function element(
  tagName: string,
  properties: Element['properties'] = {},
  children: ElementContent[] = [],
): Element {
  return { type: 'element', tagName, properties, children };
}

function heading(id: string, label: string): Element {
  return element('h2', { id }, [text(label)]);
}

function lead(properties: Element['properties'] = {}): Element {
  return element('p', properties, [text('It has no account and no server.')]);
}

function run(children: RootContent[], path: string | null = '/x/en.md'): Root {
  const tree: Root = { type: 'root', children };
  policyToc()(tree, { path: path ?? undefined });
  return tree;
}

function topLevelElements(tree: Root): Element[] {
  return tree.children.filter(
    (node): node is Element => node.type === 'element',
  );
}

function contentsLinks(tree: Root): Element[] {
  const nav = topLevelElements(tree).find((node) => node.tagName === 'nav');
  const list = nav?.children.find(
    (node): node is Element => node.type === 'element' && node.tagName === 'ul',
  );
  return (list?.children ?? []).map(
    (item) => (item as Element).children[0] as Element,
  );
}

describe('policy-toc rehype plugin', () => {
  it('puts the contents right after the lead and before the first section', () => {
    const tree = run([
      lead(),
      text('\n'),
      heading('a', 'A'),
      element('p', {}, [text('Body')]),
      heading('b', 'B'),
    ]);
    expect(topLevelElements(tree).map((node) => node.tagName)).toEqual([
      'p',
      'nav',
      'h2',
      'p',
      'h2',
    ]);
  });

  it('builds the exact navigation shape in English', () => {
    const tree = run([lead(), heading('only', 'Only section')]);
    expect(topLevelElements(tree)[1]).toEqual({
      type: 'element',
      tagName: 'nav',
      properties: {
        id: 'policy-toc',
        className: ['policy-toc'],
        ariaLabelledBy: 'policy-toc-title',
      },
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {
            id: 'policy-toc-title',
            className: ['policy-toc__title'],
          },
          children: [{ type: 'text', value: 'On this page' }],
        },
        {
          type: 'element',
          tagName: 'ul',
          properties: { className: ['policy-toc__list'], role: 'list' },
          children: [
            {
              type: 'element',
              tagName: 'li',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'a',
                  properties: { href: '#only' },
                  children: [{ type: 'text', value: 'Only section' }],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('uses the Portuguese title for pt-br.md and keeps accented ids as they are', () => {
    const tree = run(
      [lead(), heading('o-que-o-vital-courier-lê', 'O que o Vital Courier lê')],
      '/x/pt-br.md',
    );
    const nav = topLevelElements(tree)[1];
    expect((nav.children[0] as Element).children).toEqual([
      { type: 'text', value: 'Nesta página' },
    ]);
    expect(contentsLinks(tree)[0].properties.href).toBe(
      '#o-que-o-vital-courier-lê',
    );
  });

  it('lists any positive number of sections in order', () => {
    const tree = run([
      lead(),
      heading('one', 'One'),
      heading('two', 'Two'),
      heading('three', 'Three'),
    ]);
    expect(contentsLinks(tree).map((link) => link.properties.href)).toEqual([
      '#one',
      '#two',
      '#three',
    ]);
  });

  it('reads the label through nested elements', () => {
    const tree = run([
      lead(),
      element('h2', { id: 'what' }, [
        text('What '),
        element('em', {}, [text('Vital')]),
        text(' reads '),
      ]),
    ]);
    expect(contentsLinks(tree)[0].children).toEqual([
      { type: 'text', value: 'What Vital reads' },
    ]);
  });

  it('lists only top-level sections', () => {
    const tree = run([
      lead(),
      heading('top', 'Top'),
      element('section', {}, [heading('nested', 'Nested')]),
    ]);
    expect(contentsLinks(tree).map((link) => link.properties.href)).toEqual([
      '#top',
    ]);
  });

  it('marks the lead and keeps its existing classes', () => {
    const existingLead = lead({ className: ['intro'] });
    run([existingLead, heading('a', 'A')]);
    expect(existingLead.properties.className).toEqual(['intro', 'policy-lead']);
  });

  it('does not add policy-lead twice', () => {
    const markedLead = lead({ className: ['policy-lead'] });
    run([markedLead, heading('a', 'A')]);
    expect(markedLead.properties.className).toEqual(['policy-lead']);
  });

  it('ignores whitespace-only text before the lead', () => {
    const tree = run([text('\n'), lead(), text('\n'), heading('a', 'A')]);
    expect(topLevelElements(tree).map((node) => node.tagName)).toEqual([
      'p',
      'nav',
      'h2',
    ]);
  });

  it('adds nothing but an href to contents links', () => {
    const tree = run([lead(), heading('a', 'A')]);
    expect(contentsLinks(tree)[0].properties).toEqual({ href: '#a' });
  });

  it('throws when there is no top-level H2', () => {
    expect(() => run([lead()])).toThrow(/no top-level H2/);
  });

  it.each([
    ['no lead', [heading('a', 'A')]],
    ['two paragraphs', [lead(), lead(), heading('a', 'A')]],
    ['a list', [element('ul'), heading('a', 'A')]],
    [
      'a comment',
      [lead(), { type: 'comment', value: ' note ' }, heading('a', 'A')],
    ],
  ] as [string, RootContent[]][])(
    'throws for %s before the first H2',
    (_, children) => {
      expect(() => run(children)).toThrow(
        /exactly one paragraph before its first H2/,
      );
    },
  );

  it('throws for an H2 without an id', () => {
    expect(() => run([lead(), element('h2', {}, [text('A')])])).toThrow(
      /no id/,
    );
  });

  it('throws for a duplicate H2 id', () => {
    expect(() =>
      run([lead(), heading('a', 'A'), heading('a', 'Again')]),
    ).toThrow(/duplicate H2 id "a"/);
  });

  it('throws for an unknown locale or a missing path', () => {
    expect(() => run([lead(), heading('a', 'A')], '/x/fr.md')).toThrow(
      /^policy-toc: cannot tell the locale/,
    );
    expect(() => run([lead(), heading('a', 'A')], null)).toThrow(/\(no path\)/);
  });
});
