import type { Element, Root } from 'hast';
import { ui } from '../i18n/ui';
import {
  appendClassName,
  isElementNamed,
  isWhitespaceText,
  renderedText,
} from './hast-helpers';
import { localeFromMarkdownPath, type FileWithPath } from './markdown-locale';

const PLUGIN_NAME = 'policy-toc';
const CONTENTS_ID = 'policy-toc';
const CONTENTS_TITLE_ID = 'policy-toc-title';
const LEAD_CLASS = 'policy-lead';

function contentsLink(
  heading: Element,
  seenIds: Set<string>,
  filePath: string | undefined,
): Element {
  const id = heading.properties.id;
  if (typeof id !== 'string' || id === '') {
    throw new Error(
      `${PLUGIN_NAME}: an H2 in "${filePath}" has no id. Register rehypeHeadingIds before ${PLUGIN_NAME}.`,
    );
  }
  if (seenIds.has(id)) {
    throw new Error(
      `${PLUGIN_NAME}: duplicate H2 id "${id}" in "${filePath}".`,
    );
  }
  seenIds.add(id);
  return {
    type: 'element',
    tagName: 'li',
    properties: {},
    children: [
      {
        type: 'element',
        tagName: 'a',
        properties: { href: `#${id}` },
        children: [{ type: 'text', value: renderedText(heading).trim() }],
      },
    ],
  };
}

// Marks the policy's single lead paragraph and puts the "On this page" list right after it.
export default function policyToc() {
  return (tree: Root, file: FileWithPath) => {
    const locale = localeFromMarkdownPath(file.path, PLUGIN_NAME);
    const firstHeadingIndex = tree.children.findIndex((node) =>
      isElementNamed(node, 'h2'),
    );
    if (firstHeadingIndex === -1) {
      throw new Error(
        `${PLUGIN_NAME}: "${file.path}" has no top-level H2 sections to list.`,
      );
    }
    const preamble = tree.children
      .slice(0, firstHeadingIndex)
      .filter((node) => !isWhitespaceText(node));
    const lead = preamble[0];
    if (preamble.length !== 1 || !isElementNamed(lead, 'p')) {
      throw new Error(
        `${PLUGIN_NAME}: "${file.path}" must have exactly one paragraph before its first H2.`,
      );
    }
    appendClassName(lead, LEAD_CLASS);

    const seenIds = new Set<string>();
    const listItems = tree.children
      .filter((node): node is Element => isElementNamed(node, 'h2'))
      .map((heading) => contentsLink(heading, seenIds, file.path));

    // hast types ariaLabelledBy as string[], but the serialized attribute is this plain string.
    const contentsProperties: Record<string, string | string[]> = {
      id: CONTENTS_ID,
      className: ['policy-toc'],
      ariaLabelledBy: CONTENTS_TITLE_ID,
    };
    const contents: Element = {
      type: 'element',
      tagName: 'nav',
      properties: contentsProperties,
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {
            id: CONTENTS_TITLE_ID,
            className: ['policy-toc__title'],
          },
          children: [{ type: 'text', value: ui[locale].onThisPage }],
        },
        {
          type: 'element',
          tagName: 'ul',
          properties: { className: ['policy-toc__list'], role: 'list' },
          children: listItems,
        },
      ],
    };
    tree.children.splice(tree.children.indexOf(lead) + 1, 0, contents);
  };
}
