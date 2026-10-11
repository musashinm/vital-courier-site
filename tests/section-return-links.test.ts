import type { Element, ElementContent, Root, RootContent } from 'hast';
import { describe, expect, it } from 'vitest';
import sectionReturnLinks from '../src/markdown/section-return-links';

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

function returnParagraph(label: string): Element {
  return element('p', { className: ['policy-section-return'] }, [
    element('a', { href: '#policy-toc' }, [text(label)]),
  ]);
}

function run(children: RootContent[], path: string | null = '/x/en.md'): Root {
  const tree: Root = { type: 'root', children };
  sectionReturnLinks()(tree, { path: path ?? undefined });
  return tree;
}

describe('section-return-links rehype plugin', () => {
  it('ends every section with a return link, in English', () => {
    const intro = element('p', {}, [text('Lead')]);
    const first = element('h2', { id: 'a' }, [text('A')]);
    const body = element('p', {}, [text('Body')]);
    const second = element('h2', { id: 'b' }, [text('B')]);
    const tree = run([intro, first, body, text('\n'), second]);

    expect(tree.children).toEqual([
      intro,
      first,
      body,
      text('\n'),
      returnParagraph('Back to contents'),
      second,
      returnParagraph('Back to contents'),
    ]);
  });

  it('uses the Portuguese label for pt-br.md', () => {
    const tree = run([element('h2', { id: 'a' }, [text('A')])], '/x/pt-br.md');
    expect(tree.children.at(-1)).toEqual(returnParagraph('Voltar ao conteúdo'));
  });

  it('handles a single section', () => {
    const only = element('h2', { id: 'a' }, [text('A')]);
    const tree = run([only]);
    expect(tree.children).toEqual([only, returnParagraph('Back to contents')]);
  });

  it('creates a separate node for every section', () => {
    const tree = run([element('h2', { id: 'a' }), element('h2', { id: 'b' })]);
    const returns = tree.children.filter(
      (node) => node.type === 'element' && node.tagName === 'p',
    );
    expect(returns).toHaveLength(2);
    expect(returns[0]).not.toBe(returns[1]);
  });

  it('ignores H2s that are not top level and leaves other content alone', () => {
    const section = element('section', {}, [element('h2', { id: 'nested' })]);
    const top = element('h2', { id: 'top' });
    const tree = run([top, section]);
    expect(tree.children).toEqual([
      top,
      section,
      returnParagraph('Back to contents'),
    ]);
    expect(section.children).toHaveLength(1);
  });

  it('throws when there is no top-level H2', () => {
    expect(() => run([element('p', {}, [text('Lead')])])).toThrow(
      /no top-level H2/,
    );
  });

  it('throws for an unknown locale or a missing path', () => {
    expect(() => run([element('h2', { id: 'a' })], '/x/fr.md')).toThrow(
      /^section-return-links: cannot tell the locale/,
    );
    expect(() => run([element('h2', { id: 'a' })], null)).toThrow(
      /\(no path\)/,
    );
  });
});
