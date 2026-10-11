import type { Element, Root } from 'hast';
import { ui } from '../i18n/ui';
import { isElementNamed } from './hast-helpers';
import { localeFromMarkdownPath, type FileWithPath } from './markdown-locale';

const PLUGIN_NAME = 'section-return-links';
const CONTENTS_HREF = '#policy-toc';

function returnParagraph(label: string): Element {
  return {
    type: 'element',
    tagName: 'p',
    properties: { className: ['policy-section-return'] },
    children: [
      {
        type: 'element',
        tagName: 'a',
        properties: { href: CONTENTS_HREF },
        children: [{ type: 'text', value: label }],
      },
    ],
  };
}

// Ends every top-level section with a "Back to contents" link; CSS shows them only below 640 px.
export default function sectionReturnLinks() {
  return (tree: Root, file: FileWithPath) => {
    const locale = localeFromMarkdownPath(file.path, PLUGIN_NAME);
    const label = ui[locale].backToContents;
    const headingIndexes = tree.children.flatMap((node, index) =>
      isElementNamed(node, 'h2') ? [index] : [],
    );
    if (headingIndexes.length === 0) {
      throw new Error(
        `${PLUGIN_NAME}: "${file.path}" has no top-level H2 sections to end.`,
      );
    }
    tree.children.push(returnParagraph(label));
    // Insert from the last section backwards so earlier indexes stay valid.
    for (const headingIndex of headingIndexes.slice(1).reverse()) {
      tree.children.splice(headingIndex, 0, returnParagraph(label));
    }
  };
}
