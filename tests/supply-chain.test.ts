import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type YamlRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const WORKFLOWS_DIRECTORY = '.github/workflows';

// Collects every `uses` value anywhere in a workflow, so a step can't slip past
// the check by sitting in an unexpected place.
function collectUses(node: unknown): unknown[] {
  if (Array.isArray(node)) return node.flatMap(collectUses);
  if (node === null || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) =>
    key === 'uses' ? [value] : collectUses(value),
  );
}

// Collects every step object that runs the given action.
function collectStepsUsing(node: unknown, action: string): YamlRecord[] {
  if (Array.isArray(node)) {
    return node.flatMap((item) => collectStepsUsing(item, action));
  }
  if (node === null || typeof node !== 'object') return [];
  const record = node as Record<string, unknown>;
  const own =
    typeof record.uses === 'string' && record.uses.startsWith(`${action}@`)
      ? [record]
      : [];
  return [
    ...own,
    ...Object.values(record).flatMap((value) =>
      collectStepsUsing(value, action),
    ),
  ];
}

const workflows = readdirSync(WORKFLOWS_DIRECTORY)
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => parse(readFileSync(`${WORKFLOWS_DIRECTORY}/${name}`, 'utf8')));

describe('workflow actions', () => {
  it('pins every action to a full commit SHA', () => {
    const uses = workflows.flatMap(collectUses);
    expect(uses.length).toBeGreaterThan(0);
    for (const reference of uses) {
      expect(reference).toMatch(/^[^@\s]+@[0-9a-f]{40}$/);
    }
  });

  it('does not persist the checkout token in the git config', () => {
    const checkoutSteps = workflows.flatMap((workflow) =>
      collectStepsUsing(workflow, 'actions/checkout'),
    );
    expect(checkoutSteps.length).toBeGreaterThan(0);
    for (const step of checkoutSteps) {
      expect(step.with['persist-credentials']).toBe(false);
    }
  });
});

describe('Dockerfile', () => {
  it('pins every base image by digest', () => {
    const fromLines = readFileSync('Dockerfile', 'utf8')
      .split('\n')
      .filter((line) => line.startsWith('FROM '));
    expect(fromLines.length).toBeGreaterThan(0);
    for (const line of fromLines) {
      expect(line).toMatch(/^FROM \S+:\S+@sha256:[0-9a-f]{64}(\s|$)/);
    }
  });
});

describe('dependabot config', () => {
  const { updates } = parse(readFileSync('.github/dependabot.yml', 'utf8'));
  const byEcosystem = (name: string) =>
    updates.find((update: YamlRecord) => update['package-ecosystem'] === name);

  it('covers Actions, Docker and npm', () => {
    expect(
      updates.map((update: YamlRecord) => update['package-ecosystem']).sort(),
    ).toEqual(['docker', 'github-actions', 'npm']);
  });

  it('checks weekly and waits 7 days after a release', () => {
    for (const update of updates) {
      expect(update.schedule.interval).toBe('weekly');
      expect(update.cooldown['default-days']).toBe(7);
    }
  });

  it('groups npm minor and patch bumps', () => {
    const group = Object.values(byEcosystem('npm').groups)[0];
    expect(group).toMatchObject({
      patterns: ['*'],
      'update-types': ['minor', 'patch'],
    });
  });

  it('ignores Node major bumps for the Docker image', () => {
    expect(byEcosystem('docker').ignore).toContainEqual({
      'dependency-name': 'node',
      'update-types': ['version-update:semver-major'],
    });
  });
});
