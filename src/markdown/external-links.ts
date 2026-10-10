import type { Element, Root, RootContent } from 'hast';
import { locales, ui, type Locale } from '../i18n/ui';

const EXTERNAL_URL_PATTERN = /^https?:\/\//;

interface FileWithPath {
  path?: string;
}

function localeFromMarkdownPath(filePath: string | undefined): Locale {
  const fileName = filePath?.split(/[\\/]/).pop() ?? '';
  const locale = locales.find((candidate) => fileName === `${candidate}.md`);
  if (!locale) {
    throw new Error(
      `external-links: cannot tell the locale of "${filePath ?? '(no path)'}". ` +
        `Name the Markdown file after one of: ${locales.join(', ')} (for example "${locales[0]}.md").`,
    );
  }
  return locale;
}

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
    const locale = localeFromMarkdownPath(file.path);
    openExternalLinksInNewTab(tree, ui[locale].opensInNewTab);
  };
}
