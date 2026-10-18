import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { validatePng } from './png';

describe('deploy config', () => {
  it('ships no _redirects file, so / serves the home page', () => {
    expect(existsSync('dist/_redirects')).toBe(false);
  });

  // Header pairs stay in an ordered list so a duplicate line fails the test; Cloudflare would join duplicates with a comma.
  // script-src ends the beacon path with a slash because Cloudflare injects a versioned URL under it, and only a slash-ended path matches longer paths.
  it('ships a _headers file with the security headers on every path', () => {
    const lines = readFileSync('dist/_headers', 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));
    expect(lines[0]).toBe('/*');
    const headerLines = lines.slice(1);
    for (const line of headerLines) expect(line).toMatch(/^\s+\S/);
    const headerPairs = headerLines.map((line) => {
      const separatorIndex = line.indexOf(':');
      return [
        line.slice(0, separatorIndex).trim(),
        line.slice(separatorIndex + 1).trim(),
      ];
    });
    expect(headerPairs).toEqual([
      [
        'Content-Security-Policy',
        "default-src 'none'; script-src https://static.cloudflareinsights.com/beacon.min.js/; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      ],
      ['X-Content-Type-Options', 'nosniff'],
      ['X-Frame-Options', 'DENY'],
      ['Referrer-Policy', 'no-referrer'],
      ['Strict-Transport-Security', 'max-age=31536000'],
    ]);
  });

  it('points Workers static assets at dist and binds the custom domain', () => {
    const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
    expect(config.name).toBe('vital-courier');
    expect(config.assets).toEqual({ directory: './dist' });
    // The privacy policy says Workers Logs and Traces record nothing because no Worker script runs. Adding `main` (or `run_worker_first`) means updating that paragraph in both languages.
    expect(config.main).toBeUndefined();
    expect(config.routes).toEqual([
      { pattern: 'vitalcourier.app', custom_domain: true },
    ]);
  });

  it('serves the Worker only on the custom domain, with no workers.dev or preview URLs', () => {
    const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
    expect(config.workers_dev).toBe(false);
    expect(config.preview_urls).toBe(false);
    expect(config.previews).toBeUndefined();
  });

  it('configures Workers Logs and Traces', () => {
    const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
    expect(config.observability).toEqual({
      logs: {
        enabled: true,
        head_sampling_rate: 1,
        invocation_logs: true,
        persist: true,
      },
      traces: { enabled: true, head_sampling_rate: 1, persist: true },
    });
  });

  it.each(['favicon.svg', 'favicon-32.png'])('ships %s', (file) => {
    expect(existsSync(`dist/${file}`)).toBe(true);
  });

  it('no longer ships the old dark favicon', () => {
    expect(existsSync('dist/favicon-dark.svg')).toBe(false);
  });

  // SHA-256 of the approved tile favicon in the vault's Design/Favicon Tile/Assets/ (Favicon Tile.md approved 2026-10-09).
  // The vault isn't available in CI, so the hash stands in for it. Change it only with a new favicon approval.
  it.each([
    [
      'favicon.svg',
      '1e6b6a18cdccab4ca8ee3fa999e729f229e36ba46bbf0129924d90f348873940',
    ],
  ])(
    'ships %s byte-identical to the approved favicon asset',
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

    expect(() => validatePng(png, 32, 32)).not.toThrow();
  });

  it.each([
    'dist/index.html',
    'dist/pt-br.html',
    'dist/privacy.html',
    'dist/pt-br/privacy.html',
  ])('%s links the favicons', (file) => {
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
    ]);
  });
});
