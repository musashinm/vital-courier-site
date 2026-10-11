import type { Element, Root, RootContent } from 'hast';

export function isElementNamed(
  node: Root | RootContent,
  tagName: string,
): node is Element {
  return node.type === 'element' && node.tagName === tagName;
}

export function isWhitespaceText(node: Root | RootContent): boolean {
  return node.type === 'text' && node.value.trim() === '';
}

export function renderedText(node: Root | RootContent): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) return node.children.map(renderedText).join('');
  return '';
}

export function appendClassName(element: Element, className: string): void {
  // Typed as string[] by hast, but plugins and raw HTML can leave a string.
  const existing: unknown = element.properties.className;
  const classNames = Array.isArray(existing)
    ? existing.map(String)
    : typeof existing === 'string'
      ? existing.split(/\s+/).filter(Boolean)
      : [];
  if (!classNames.includes(className)) classNames.push(className);
  element.properties.className = classNames;
}
