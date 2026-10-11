import type { Element, Root, RootContent } from 'hast';
import { ui } from '../i18n/ui';
import { localeFromMarkdownPath, type FileWithPath } from './markdown-locale';

const EXTERNAL_URL_PATTERN = /^https?:\/\//;
const PLUGIN_NAME = 'external-links';

function isExternalLink(node: RootContent | Root): node is Element {
  return (
    node.type === 'element' &&
    node.tagName === 'a' &&
    typeof node.properties.href === 'string' &&
    EXTERNAL_URL_PATTERN.test(node.properties.href)
  );
}

function openExternalLinksInNewTab(
  node: Root | RootContent,
  warningText: string,
): void {
  if (isExternalLink(node)) {
    node.properties.target = '_blank';
    node.properties.rel = ['noopener', 'noreferrer'];
    node.children.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['sr-only'] },
      children: [{ type: 'text', value: ` ${warningText}` }],
    });
  }
  if ('children' in node) {
    for (const child of node.children) {
      openExternalLinksInNewTab(child, warningText);
    }
  }
}

export default function externalLinks() {
  return (tree: Root, file: FileWithPath) => {
    const locale = localeFromMarkdownPath(file.path, PLUGIN_NAME);
    openExternalLinksInNewTab(tree, ui[locale].opensInNewTab);
  };
}
