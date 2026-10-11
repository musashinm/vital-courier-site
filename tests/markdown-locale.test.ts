import { describe, expect, it } from 'vitest';
import { localeFromMarkdownPath } from '../src/markdown/markdown-locale';

describe('localeFromMarkdownPath', () => {
  it.each([
    ['/any/dir/src/content/privacy/en.md', 'en'],
    ['/x/pt-br.md', 'pt-br'],
    ['C:\\repo\\src\\content\\privacy\\pt-br.md', 'pt-br'],
  ])('reads %s as %s', (filePath, expectedLocale) => {
    expect(localeFromMarkdownPath(filePath, 'test-plugin')).toBe(
      expectedLocale,
    );
  });

  it('names the plugin and the file when the locale is unknown', () => {
    expect(() => localeFromMarkdownPath('/x/fr.md', 'policy-toc')).toThrow(
      /^policy-toc: cannot tell the locale of "\/x\/fr\.md"/,
    );
  });

  it('says (no path) when the file has no path', () => {
    expect(() => localeFromMarkdownPath(undefined, 'policy-toc')).toThrow(
      /\(no path\)/,
    );
  });
});
