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

  it('sticks the site menu to the top with the rem minimum height', () => {
    const css = builtCss();
    expect(css).toMatch(/\.site-menu\{[^}]*position:sticky[^}]*top:0/);
    expect(css).toMatch(
      /\.site-menu\{[^}]*min-height:var\(--site-menu-min-height\)/,
    );
    expect(css).not.toMatch(
      /(?:^|[}\s,])\.site-menu\{[^}]*(?<![-\w])height:\d/,
    );
    expect(css).not.toMatch(/\.site-menu__inner\{[^}]*flex-wrap:wrap/);
    expect(css).not.toMatch(/\.site-menu__inner\{[^}]*min-height/);
    expect(css).not.toMatch(/\.site-menu\{[^}]*border-bottom/);
    const rule = css.match(/\.site-menu:(?::)?after\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toContain('content:""');
    expect(rule).toContain('position:absolute');
    // Lightning CSS may keep inset-inline:0 or expand it to left:0;right:0. Accept both.
    expect(rule).toMatch(/inset-inline:0|left:0;right:0|right:0;left:0/);
    expect(rule).toContain('bottom:0');
    expect(rule).toContain('height:1px');
    expect(rule).toContain('background:var(--vc-border)');
    expect(rule).toContain('pointer-events:none');
    // Lightning CSS reorders declarations, so check each one on its own.
    expect(css).toMatch(/\.site-menu\{[^}]*display:flex/);
    expect(css).toMatch(/\.site-menu\{[^}]*align-items:center/);
  });

  it('gives the language group 8px padding, the deliberate policy change from 2px', () => {
    expect(builtCss()).toMatch(/\.site-menu \.language\{[^}]*padding:8px/);
  });

  it('derives the fragment offset from the menu height tokens', () => {
    const css = builtCss();
    expect(css).toContain('--site-menu-min-height:4.75rem');
    expect(css).toContain('--site-fragment-gap:1rem');
    expect(css).toMatch(
      /--site-fragment-offset:calc\(var\(--site-menu-min-height\) \+ var\(--site-fragment-gap\)\)/,
    );
    expect(css).toMatch(
      /@media \((?:min-width: ?64rem|width>=64rem)\)\{(?:[^{}]|\{[^{}]*\})*:root\{[^}]*--site-menu-min-height:5\.25rem/,
    );
    expect(css).toMatch(
      /html:has\(\.site-menu\)\{[^}]*scroll-padding-top:var\(--site-fragment-offset\)/,
    );
    expect(css).not.toMatch(
      /(?:#ios-app|\.home-main|#main-content)[^{]*\{[^}]*scroll-margin/,
    );
  });

  it('sizes the brand art as a 32px symbol on phones and the lockup from sm', () => {
    const css = builtCss();
    expect(css).toMatch(
      /\.site-menu \.brand-art\{[^}]*width:32px[^}]*height:32px/,
    );
    expect(css).toMatch(
      /@media \((?:min-width: ?40rem|width>=40rem)\)\{(?:[^{}]|\{[^{}]*\})*\.site-menu \.brand-art\{[^}]*width:190\.848px[^}]*height:40px/,
    );
  });

  it('keeps the Markdown stage at 680px and the frame on soft', () => {
    const css = builtCss();
    expect(css).not.toMatch(/\.shot--note \.stage\{[^}]*min-height/);
    expect(css).toMatch(/\.note-frame\{[^}]*background:var\(--vc-soft\)/);
  });

  it('places the philosophy heading in columns 1 to 7 above the proofs', () => {
    const css = builtCss();
    expect(css).toMatch(
      /\.philosophy>:not\(\.proofs\)\{[^}]*grid-column:1\/span 7/,
    );
    expect(css).toMatch(/\.philosophy>\.proofs\{[^}]*grid-column:1\/-1/);
  });

  it('keeps the phone shadow out of the runtime token block', () => {
    expect(builtCss()).not.toContain('--home-phone-shadow');
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

describe('built CSS for the home hero', () => {
  function withoutReducedMotionBlocks(css: string): string {
    const opener = '@media (prefers-reduced-motion:no-preference){';
    let remainder = css;
    let start = remainder.indexOf(opener);
    while (start !== -1) {
      let depth = 1;
      let index = start + opener.length;
      while (depth > 0 && index < remainder.length) {
        if (remainder[index] === '{') depth += 1;
        if (remainder[index] === '}') depth -= 1;
        index += 1;
      }
      remainder = remainder.slice(0, start) + remainder.slice(index);
      start = remainder.indexOf(opener);
    }
    return remainder;
  }

  it('only assigns animations inside prefers-reduced-motion: no-preference', () => {
    const css = builtCss().replace(
      /@media \(prefers-reduced-motion: ?no-preference\) ?\{/g,
      '@media (prefers-reduced-motion:no-preference){',
    );
    expect(css).toContain('@media (prefers-reduced-motion:no-preference){');
    const outside = withoutReducedMotionBlocks(css);
    expect(outside).not.toMatch(/animation(?:-name)?:/);
  });

  it('runs every hero animation with fill-mode both', () => {
    const css = builtCss();
    const opener = '@media (prefers-reduced-motion:no-preference){';
    const start = css.indexOf(opener);
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start);
    const animations = [...block.matchAll(/[;{]animation:([^;}]*)/g)].map(
      ([, value]) => value,
    );
    expect(animations.length).toBeGreaterThanOrEqual(6);
    for (const value of animations) {
      expect(value, value).toMatch(/(?:^|\s)both(?:\s|$)/);
    }
  });

  it('contains the sliding headline on the x axis only', () => {
    // The minifier folds overflow-x/overflow-y into the `overflow: clip visible` shorthand.
    const clipsXOnly = /overflow(?:-x)?:clip(?: visible|;overflow-y:visible|$)/;
    const css = builtCss();
    const headingRules = [
      ...css.matchAll(/([^{}]*\.hero h1)\{([^{}]*)\}/g),
    ].map(([, selector, declarations]) => ({ selector, declarations }));
    const containing = headingRules.filter(({ declarations }) =>
      clipsXOnly.test(declarations),
    );
    expect(containing.length).toBeGreaterThanOrEqual(2);
    for (const { selector, declarations } of headingRules) {
      expect(declarations, selector).not.toContain('clip-path');
    }
    const shortViewport = css.match(
      /@media \((?:max-height: ?560px|height<=560px)\)\{(?:[^{}]|\{[^{}]*\})*\}/,
    );
    expect(shortViewport?.[0]).toMatch(/\.hero h1\{[^}]*overflow:clip visible/);
    const normalComposition = css.match(
      /@media \((?:min-width: ?40rem|width>=40rem)\)\{(?:[^{}]|\{[^{}]*\})*\.hero h1\{[^}]*\}/,
    );
    expect(normalComposition?.[0]).toMatch(/\.hero h1\{[^}]*overflow:visible/);
  });

  it('makes the outer disc 106 percent of the core', () => {
    const css = builtCss();
    expect(css).toMatch(
      /\.hero-halo\{[^}]*inset:calc\(0% - var\(--home-halo-overscan\)\)/,
    );
    expect(css).toContain('--home-halo-overscan:3%');
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

describe('README browser support', () => {
  it('names the Safari and iOS floor that Media Queries Level 4 needs', () => {
    expect(readFileSync('README.md', 'utf8')).toMatch(
      /Safari and iOS 16\.4\+, Chrome 111\+ and Firefox 128\+/,
    );
  });
});
