import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validatePng } from './png';

describe('validatePng', () => {
  it('rejects a file whose PNG signature is corrupted', () => {
    const png = Buffer.from(readFileSync('public/favicon-32.png'));
    expect(() => validatePng(png, 32, 32)).not.toThrow();
    png[1] = 0x00;
    expect(() => validatePng(png, 32, 32)).toThrow('Missing PNG signature');
  });
});
