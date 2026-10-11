import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type YamlRecord = Record<string, unknown>;

const GITHUB_DIRECTORY = '.github';
const WORKFLOWS_DIRECTORY = '.github/workflows';

function isRecord(value: unknown): value is YamlRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asRecordList(value: unknown): YamlRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

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
  const record = node as YamlRecord;
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

// Every YAML file under .github, including composite action metadata, so an
// action added outside workflows/ can't bring in an unpinned `uses`.
const githubYamlFiles = readdirSync(GITHUB_DIRECTORY, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => parse(readFileSync(`${GITHUB_DIRECTORY}/${name}`, 'utf8')));

describe('workflow actions', () => {
  it('pins every action to a full commit SHA', () => {
    // Local references (./...) live in this repo, so they need no pin.
    const externalUses = githubYamlFiles
      .flatMap(collectUses)
      .filter(
        (reference) =>
          !(typeof reference === 'string' && reference.startsWith('./')),
      );
    expect(externalUses.length).toBeGreaterThan(0);
    for (const reference of externalUses) {
      expect(reference).toMatch(/^[^@\s]+@[0-9a-f]{40}$/);
    }
  });

  it('does not persist the checkout token in the git config', () => {
    const checkoutSteps = workflows.flatMap((workflow) =>
      collectStepsUsing(workflow, 'actions/checkout'),
    );
    expect(checkoutSteps.length).toBeGreaterThan(0);
    for (const step of checkoutSteps) {
      expect(isRecord(step.with) && step.with['persist-credentials']).toBe(
        false,
      );
    }
  });
});

describe('Dockerfile', () => {
  it('pins every base image by digest', () => {
    const fromLines = readFileSync('Dockerfile', 'utf8')
      .split('\n')
      .filter((line) => /^\s*from\s/i.test(line));
    expect(fromLines.length).toBeGreaterThan(0);
    for (const line of fromLines) {
      // Drop the FROM keyword and any --flag=value tokens; the first token
      // left is the image (a trailing `AS name` is ignored).
      const [image] = line
        .trim()
        .split(/\s+/)
        .slice(1)
        .filter((token) => !token.startsWith('--'));
      expect(image).toMatch(/^[^\s@]+:[^\s@]+@sha256:[0-9a-f]{64}$/);
    }
  });
});

describe('dependabot config', () => {
  const config = parse(readFileSync('.github/dependabot.yml', 'utf8'));
  const updates = asRecordList(config.updates);
  const byEcosystem = (name: string) =>
    updates.find((update) => update['package-ecosystem'] === name);

  it('uses config version 2', () => {
    expect(config.version).toBe(2);
  });

  it('covers Actions, Docker and npm from the repo root', () => {
    expect(updates.map((update) => update['package-ecosystem']).sort()).toEqual(
      ['docker', 'github-actions', 'npm'],
    );
    for (const update of updates) {
      expect(update.directory).toBe('/');
    }
  });

  it('checks weekly and waits 7 days after a release', () => {
    for (const update of updates) {
      expect((update.schedule as YamlRecord).interval).toBe('weekly');
      expect((update.cooldown as YamlRecord)['default-days']).toBe(7);
    }
  });

  it('groups npm minor and patch bumps', () => {
    const group = Object.values(byEcosystem('npm')?.groups as YamlRecord)[0];
    expect(group).toMatchObject({
      patterns: ['*'],
      'update-types': ['minor', 'patch'],
    });
  });

  it('ignores Node major bumps for the Docker image', () => {
    expect(byEcosystem('docker')?.ignore).toContainEqual({
      'dependency-name': 'node',
      'update-types': ['version-update:semver-major'],
    });
  });
});
