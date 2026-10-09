import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

describe('deploy config', () => {
  it('ships a _redirects file with only the root 302', () => {
    expect(readFileSync('dist/_redirects', 'utf8').trim()).toBe(
      '/ /privacy 302',
    );
  });

  it('points Workers static assets at dist and binds the custom domain', () => {
    const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
    expect(config.name).toBe('vital-courier-site');
    expect(config.assets).toEqual({ directory: './dist' });
    expect(config.main).toBeUndefined();
    expect(config.routes).toEqual([
      { pattern: 'vitalcourier.app', custom_domain: true },
    ]);
    expect(config.preview_urls).toBe(true);
    expect(config.previews).toEqual({});
  });

  it.each(['favicon.svg', 'favicon-dark.svg', 'favicon-32.png'])(
    'ships %s',
    (file) => {
      expect(existsSync(`dist/${file}`)).toBe(true);
    },
  );

  // SHA-256 of the approved files in the vault's Design/Logo/Assets/ (Logo.md approved 2026-10-08).
  // The vault isn't available in CI, so the hashes stand in for it. Change them only with a new logo approval.
  it.each([
    [
      'favicon.svg',
      '060bbdc6d56e5f02474457759ea05b178c063cf3c3bf3f65a4baab5cb1ff0a51',
    ],
    [
      'favicon-dark.svg',
      '06dd646b463034839f834effd44442ab3d549bbdc308b5150b0b79be72aac46c',
    ],
  ])(
    'ships %s byte-identical to the approved logo asset',
    (file, approvedSha256) => {
      const sha256 = createHash('sha256')
        .update(readFileSync(`dist/${file}`))
        .digest('hex');
      expect(sha256).toBe(approvedSha256);
    },
  );

  it('ships a 32 x 32 PNG favicon', () => {
    const png = readFileSync('dist/favicon-32.png');
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect(png.readUInt32BE(16)).toBe(32);
    expect(png.readUInt32BE(20)).toBe(32);
  });

  it.each(['dist/privacy.html', 'dist/pt-br/privacy.html'])(
    '%s links the favicons',
    (file) => {
      const root = parse(readFileSync(file, 'utf8'));
      const icons = root
        .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')
        .map((l) => ({
          href: l.getAttribute('href'),
          media: l.getAttribute('media') ?? null,
        }));
      expect(icons).toEqual([
        { href: '/favicon-32.png', media: null },
        { href: '/favicon.svg', media: null },
        { href: '/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
      ]);
    },
  );
});
