import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// Collects every `ports` entry anywhere in the file, x- anchors included, so a
// mapping can't slip past the check by sitting outside `services`.
function collectPublishedPorts(node: unknown): unknown[] {
  if (Array.isArray(node)) return node.flatMap(collectPublishedPorts);
  if (node === null || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) =>
    key === 'ports' ? [value].flat() : collectPublishedPorts(value),
  );
}

describe('compose config', () => {
  it('publishes the dev ports on the host loopback only', () => {
    const compose = parse(readFileSync('compose.yaml', 'utf8'));
    expect(collectPublishedPorts(compose)).toEqual([
      '127.0.0.1:4321:4321',
      '127.0.0.1:8787:8787',
    ]);
  });
});
