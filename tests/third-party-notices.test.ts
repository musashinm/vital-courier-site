import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('third-party notices', () => {
  it("keeps Lucide's ISC and Feather's MIT notices for the shipped icon", () => {
    const notices = readFileSync('THIRD_PARTY_NOTICES.md', 'utf8');
    expect(notices).toContain('ISC License');
    expect(notices).toContain('Lucide Icons and Contributors');
    expect(notices).toContain('Cole Bemis');
    expect(notices).toContain('external-link');
  });

  it('points to the notices from the README license section', () => {
    expect(readFileSync('README.md', 'utf8')).toContain(
      '[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)',
    );
  });
});
