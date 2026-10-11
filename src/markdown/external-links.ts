import type { Element, Root, RootContent } from 'hast';
import { ui } from '../i18n/ui';
import { pathProperties, svgProperties } from '../icons/external-link';
import { appendClassName } from './hast-helpers';
import { localeFromMarkdownPath, type FileWithPath } from './markdown-locale';

const EXTERNAL_URL_PATTERN = /^https?:\/\//;
const PLUGIN_NAME = 'external-links';
const WORD_JOINER = '\u2060';
const NO_TEXT_CLASS = 'external-link--no-text';

function isExternalLink(node: RootContent | Root): node is Element {
  return (
    node.type === 'element' &&
    node.tagName === 'a' &&
    typeof node.properties.href === 'string' &&
    EXTERNAL_URL_PATTERN.test(node.properties.href)
  );
}

// Glues the icon to the link's last word: drops trailing whitespace-only text and ends the last text with one U+2060. Returns false when the link has no text.
function joinLastWordToIcon(element: Element): boolean {
  for (let index = element.children.length - 1; index >= 0; index -= 1) {
    const child = element.children[index];
    if (child.type === 'text') {
      if (child.value.trim() === '') {
        element.children.splice(index, 1);
        continue;
      }
      child.value = child.value.trimEnd();
      if (!child.value.endsWith(WORD_JOINER)) child.value += WORD_JOINER;
      return true;
    }
    if (child.type === 'element' && joinLastWordToIcon(child)) return true;
  }
  return false;
}

// A link this plugin already processed has its generated icon as a direct child; skipping it keeps the transform idempotent.
function hasExternalLinkIcon(link: Element): boolean {
  return link.children.some(
    (child) =>
      child.type === 'element' &&
      child.tagName === 'svg' &&
      Array.isArray(child.properties.className) &&
      child.properties.className.includes('external-link-icon'),
  );
}

function externalLinkIcon(): Element {
  return {
    type: 'element',
    tagName: 'svg',
    properties: { ...svgProperties, className: [...svgProperties.className] },
    children: [
      {
        type: 'element',
        tagName: 'path',
        properties: { ...pathProperties },
        children: [],
      },
    ],
  };
}

function openExternalLinksInNewTab(
  node: Root | RootContent,
  warningText: string,
): void {
  if (isExternalLink(node) && !hasExternalLinkIcon(node)) {
    node.properties.target = '_blank';
    node.properties.rel = ['noopener', 'noreferrer'];
    if (!joinLastWordToIcon(node)) appendClassName(node, NO_TEXT_CLASS);
    node.children.push(externalLinkIcon(), {
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
