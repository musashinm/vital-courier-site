import type { Element } from 'hast';
import { describe, expect, it } from 'vitest';
import {
  appendClassName,
  isElementNamed,
  isWhitespaceText,
  renderedText,
} from '../src/markdown/hast-helpers';

function paragraph(properties: Element['properties'] = {}): Element {
  return { type: 'element', tagName: 'p', properties, children: [] };
}

describe('hast helpers', () => {
  it('matches elements by tag name only', () => {
    expect(isElementNamed(paragraph(), 'p')).toBe(true);
    expect(isElementNamed(paragraph(), 'h2')).toBe(false);
    expect(isElementNamed({ type: 'text', value: 'p' }, 'p')).toBe(false);
  });

  it('treats only whitespace-only text as whitespace', () => {
    expect(isWhitespaceText({ type: 'text', value: '\n  ' })).toBe(true);
    expect(isWhitespaceText({ type: 'text', value: ' a ' })).toBe(false);
    expect(isWhitespaceText(paragraph())).toBe(false);
  });

  it('reads text through nested elements', () => {
    const heading: Element = {
      type: 'element',
      tagName: 'h2',
      properties: {},
      children: [
        { type: 'text', value: 'What ' },
        {
          type: 'element',
          tagName: 'em',
          properties: {},
          children: [{ type: 'text', value: 'Vital' }],
        },
        { type: 'text', value: ' reads' },
      ],
    };
    expect(renderedText(heading)).toBe('What Vital reads');
  });

  it('appends a class once and keeps existing ones', () => {
    const fromArray = paragraph({ className: ['intro'] });
    appendClassName(fromArray, 'policy-lead');
    appendClassName(fromArray, 'policy-lead');
    expect(fromArray.properties.className).toEqual(['intro', 'policy-lead']);

    const fromString = paragraph({
      className: 'intro note',
    } as unknown as Element['properties']);
    appendClassName(fromString, 'policy-lead');
    expect(fromString.properties.className).toEqual([
      'intro',
      'note',
      'policy-lead',
    ]);

    const empty = paragraph();
    appendClassName(empty, 'policy-lead');
    expect(empty.properties.className).toEqual(['policy-lead']);
  });
});
