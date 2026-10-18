import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const BUILT_ASSETS_DIR = 'dist/_astro';
const BUILT_PAGES_DIR = 'dist';
const ASTRO_SOURCE_DIR = 'src';

function allBuiltHtml(): string[] {
  return readdirSync(BUILT_PAGES_DIR, { recursive: true, encoding: 'utf8' })
    .filter((fileName) => fileName.endsWith('.html'))
    .map((fileName) => join(BUILT_PAGES_DIR, fileName));
}

function allAstroSources(): string[] {
  return readdirSync(ASTRO_SOURCE_DIR, { recursive: true, encoding: 'utf8' })
    .filter((fileName) => fileName.endsWith('.astro'))
    .map((fileName) => join(ASTRO_SOURCE_DIR, fileName));
}

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

describe('built CSS for the home page', () => {
  it('defines the home halo colors and type roles', () => {
    const css = builtCss();
    expect(css).toContain('--color-home-halo-start:#f0eefc');
    expect(css).toMatch(/--text-home-hero:min\(2\.7625rem,\s*5\.78svh\)/);
  });

  it('defines the runtime hero tokens', () => {
    const css = builtCss();
    expect(css).toContain('--home-halo-overscan:3%');
    expect(css).toContain('--home-ring-window-size:87%');
    expect(css).toContain('--home-line-travel:110%');
  });

  it('sticks the home menu to the top', () => {
    expect(builtCss()).toMatch(/\.home-nav\{[^}]*position:sticky[^}]*top:0/);
  });

  it('offsets fragment targets by 152, 92 and 100 px', () => {
    const css = builtCss();
    for (const offset of ['152px', '92px', '100px']) {
      expect(css).toMatch(
        new RegExp(`html\\{[^}]*scroll-padding-top:${offset}`),
      );
      expect(css).toMatch(
        new RegExp(`#main-content,#ios-app\\{[^}]*scroll-margin-top:${offset}`),
      );
    }
  });

  it('sets no overflow on the ancestors of the sticky menu', () => {
    const ancestorRules = [
      ...builtCss().matchAll(/([^{}]+)\{([^{}]*)\}/g),
    ].filter(([, selector]) =>
      /\.(site-shell|home-main|home-content)(?![\w-])/.test(selector),
    );
    expect(ancestorRules.length).toBeGreaterThan(0);
    for (const [, selector, declarations] of ancestorRules) {
      expect(declarations, selector).not.toMatch(/overflow/);
    }
  });

  it('sizes the phone capture to the smaller of 280px and the viewport minus 80px', () => {
    expect(builtCss()).toMatch(
      /\.phone-capture\{[^}]*width:min\(280px,(?:calc\()?100vw - 80px\)?\)/,
    );
  });
});

describe('built HTML and CSP', () => {
  it('sets build.inlineStylesheets to never', () => {
    expect(readFileSync('astro.config.mjs', 'utf8')).toMatch(
      /inlineStylesheets:\s*'never'/,
    );
  });

  it.each(allBuiltHtml())(
    '%s has no <style> and links an emitted stylesheet',
    (file) => {
      const html = readFileSync(file, 'utf8');
      expect(html).not.toMatch(/<style[\s>]/i);
      expect(html).toMatch(
        /<link rel="stylesheet" href="\/_astro\/[^"]+\.css"/,
      );
    },
  );

  it.each(allAstroSources())(
    '%s keeps styles and scripts out of Astro sources',
    (file) => {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/<style[\s>]/i);
      expect(source).not.toMatch(/\sstyle\s*=/i);
      expect(source).not.toMatch(/define:vars/);
      expect(source).not.toMatch(/<script[\s>]/i);
    },
  );
});
