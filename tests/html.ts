import { TextNode, type HTMLElement } from 'node-html-parser';
import { expect } from 'vitest';

export const WORD_JOINER = '\u2060';

// The icon must be a direct child whose previous node is the visible label ending in U+2060, with no whitespace node between them.
export function expectLabelJoinedToIcon(
  link: HTMLElement,
  label: string,
): void {
  const icons = link.querySelectorAll('svg.external-link-icon');
  expect(icons).toHaveLength(1);
  expect(icons[0].getAttribute('aria-hidden')).toBe('true');
  const iconIndex = link.childNodes.indexOf(icons[0]);
  expect(iconIndex).toBeGreaterThan(0);
  const labelNode = link.childNodes[iconIndex - 1];
  expect(labelNode).toBeInstanceOf(TextNode);
  expect(labelNode.text.trimStart()).toBe(`${label}${WORD_JOINER}`);
}
