import { readFileSync } from 'node:fs';
import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { describe, expect, it } from 'vitest';
import { allowedUrlPattern, normalizeUrl } from './allowed-urls';

// The Markdown pipeline passes raw HTML straight through to the page (allowDangerousHtml plus rehype-raw), so these checks keep it out of the source.
const policyFiles = [
  'src/content/privacy/en.md',
  'src/content/privacy/pt-br.md',
];

const frontmatterBlock = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

function collectNodes(node: Nodes): Nodes[] {
  const children = 'children' in node ? (node.children as Nodes[]) : [];
  return [node, ...children.flatMap(collectNodes)];
}

function parsePolicy(file: string): Nodes[] {
  const source = readFileSync(file, 'utf8').replace(frontmatterBlock, '');
  return collectNodes(fromMarkdown(source));
}

describe.each(policyFiles)('%s', (file) => {
  it('has no raw HTML for the Markdown pipeline to pass through', () => {
    const rawHtml = parsePolicy(file).flatMap((node) =>
      node.type === 'html' ? [node.value] : [],
    );
    expect(rawHtml).toEqual([]);
  });

  it('links only to http(s), mailto, fragments or same-origin paths', () => {
    const urls = parsePolicy(file).flatMap((node) =>
      'url' in node ? [node.url] : [],
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls)
      expect(normalizeUrl(url)).toMatch(allowedUrlPattern);
  });
});
