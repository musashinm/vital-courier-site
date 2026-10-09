import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { crc32, inflateSync } from 'node:zlib';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

const PNG_SIGNATURE_LENGTH = 8;
const PNG_CHUNK_LENGTH_SIZE = 4;
const PNG_CHUNK_TYPE_SIZE = 4;
const PNG_CHUNK_CRC_SIZE = 4;

type PngChunk = { type: string; data: Buffer };

// Walks every chunk after the signature and throws on a bad CRC or a chunk that overruns the file.
function readPngChunks(png: Buffer): { chunks: PngChunk[]; endOffset: number } {
  const chunks: PngChunk[] = [];
  let offset = PNG_SIGNATURE_LENGTH;
  while (offset < png.length) {
    const headerSize = PNG_CHUNK_LENGTH_SIZE + PNG_CHUNK_TYPE_SIZE;
    if (offset + headerSize > png.length) {
      throw new Error(`Truncated chunk header at offset ${offset}`);
    }
    const dataLength = png.readUInt32BE(offset);
    const typeStart = offset + PNG_CHUNK_LENGTH_SIZE;
    const dataStart = typeStart + PNG_CHUNK_TYPE_SIZE;
    const crcStart = dataStart + dataLength;
    const chunkEnd = crcStart + PNG_CHUNK_CRC_SIZE;
    if (chunkEnd > png.length) {
      throw new Error(
        `Chunk at offset ${offset} runs past the end of the file`,
      );
    }
    const type = png.subarray(typeStart, dataStart).toString('ascii');
    const storedCrc = png.readUInt32BE(crcStart);
    const actualCrc = crc32(png.subarray(typeStart, crcStart));
    if (storedCrc !== actualCrc) {
      throw new Error(`Bad CRC in ${type} chunk at offset ${offset}`);
    }
    chunks.push({ type, data: png.subarray(dataStart, crcStart) });
    offset = chunkEnd;
  }
  return { chunks, endOffset: offset };
}

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

    const { chunks, endOffset } = readPngChunks(png);
    expect(chunks.some((chunk) => chunk.type === 'IDAT')).toBe(true);
    expect(chunks.at(-1)?.type).toBe('IEND');
    expect(endOffset).toBe(png.length);
    const imageData = Buffer.concat(
      chunks
        .filter((chunk) => chunk.type === 'IDAT')
        .map((chunk) => chunk.data),
    );
    expect(() => inflateSync(imageData)).not.toThrow();
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
