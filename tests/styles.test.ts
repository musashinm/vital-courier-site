import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const BUILT_ASSETS_DIR = 'dist/_astro';

function builtCss(): string {
  return readdirSync(BUILT_ASSETS_DIR)
    .filter((fileName) => fileName.endsWith('.css'))
    .map((fileName) => readFileSync(join(BUILT_ASSETS_DIR, fileName), 'utf8'))
    .join('\n');
}

describe('built CSS for policy wayfinding', () => {
  it('keeps external-link icons inline despite Preflight making SVGs block', () => {
    expect(builtCss()).toMatch(
      /\.external-link-icon\{[^}]*display:inline-block/,
    );
  });

  it('splits the contents list into two columns on wider screens', () => {
    expect(builtCss()).toMatch(/\.policy-toc__list\{[^}]*column-count:2/);
  });

  it('hides the return links on wider screens', () => {
    expect(builtCss()).toMatch(/\.policy-section-return\{display:none\}/);
  });
});
