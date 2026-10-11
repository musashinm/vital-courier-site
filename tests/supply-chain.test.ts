import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type YamlRecord = Record<string, unknown>;

const GITHUB_DIRECTORY = '.github';

function isRecord(value: unknown): value is YamlRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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

// Every YAML file under .github plus every tracked composite action
// (`action.yml`/`action.yaml`, wherever it lives), so an action added anywhere
// can't bring in an unpinned `uses` or an unsafe checkout.
const githubYamlPaths = readdirSync(GITHUB_DIRECTORY, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => `${GITHUB_DIRECTORY}/${name}`);
const compositeActionPaths = execFileSync(
  'git',
  ['ls-files', '*action.yml', '*action.yaml'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((path) => ['action.yml', 'action.yaml'].includes(basename(path)));
const scannedYamlFiles = [
  ...new Set([...githubYamlPaths, ...compositeActionPaths]),
].map((path) => parse(readFileSync(path, 'utf8')));

describe('workflow actions', () => {
  it('pins every action to a full commit SHA', () => {
    // Local references (./...) live in this repo, so they need no pin.
    const externalUses = scannedYamlFiles
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
    const checkoutSteps = scannedYamlFiles.flatMap((file) =>
      collectStepsUsing(file, 'actions/checkout'),
    );
    expect(checkoutSteps.length).toBeGreaterThan(0);
    for (const step of checkoutSteps) {
      const persistCredentials = isRecord(step.with)
        ? step.with['persist-credentials']
        : undefined;
      expect(persistCredentials).toBe(false);
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
  const updates: YamlRecord[] = config.updates;
  const byEcosystem = (name: string) =>
    updates.find((update) => update['package-ecosystem'] === name);

  it('lists updates as an array of records', () => {
    expect(Array.isArray(config.updates)).toBe(true);
    for (const update of config.updates) {
      expect(isRecord(update)).toBe(true);
    }
  });

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

  it('ignores @types/node major bumps to follow .nvmrc', () => {
    expect(byEcosystem('npm')?.ignore).toContainEqual({
      'dependency-name': '@types/node',
      'update-types': ['version-update:semver-major'],
    });
  });
});

describe('npm lockfile', () => {
  const FIXED_PARSER_VERSION = '7.1.6';
  const PARSER_PACKAGE = 'postcss-selector-parser';
  const TYPOGRAPHY_PACKAGE = '@tailwindcss/typography';
  const lockfile = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const lockedPackages: Record<string, YamlRecord> = lockfile.packages;

  // Compares plain major.minor.patch versions numerically; no semver dependency.
  function compareVersions(left: string, right: string): number {
    const leftParts = left.split('.').map(Number);
    const rightParts = right.split('.').map(Number);
    for (let index = 0; index < 3; index += 1) {
      const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
      if (difference !== 0) return difference;
    }
    return 0;
  }

  it('locks every postcss-selector-parser at 7.1.6 or later', () => {
    const parserEntries = Object.entries(lockedPackages).filter(([path]) =>
      path.endsWith(`node_modules/${PARSER_PACKAGE}`),
    );
    expect(parserEntries.length).toBeGreaterThan(0);
    for (const [, entry] of parserEntries) {
      expect(
        compareVersions(entry.version as string, FIXED_PARSER_VERSION),
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('overrides the typography parser while typography asks for an older one', () => {
    const typographyDependencies = lockedPackages[
      `node_modules/${TYPOGRAPHY_PACKAGE}`
    ]?.dependencies as Record<string, string> | undefined;
    const declaredSpec = typographyDependencies?.[PARSER_PACKAGE];
    // Anything but a plain x.y.z counts as needing the override (fail-safe).
    const declaresFixedVersion =
      declaredSpec !== undefined &&
      /^\d+\.\d+\.\d+$/.test(declaredSpec) &&
      compareVersions(declaredSpec, FIXED_PARSER_VERSION) >= 0;
    if (declaredSpec === undefined || declaresFixedVersion) return;

    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(packageJson.overrides?.[TYPOGRAPHY_PACKAGE]?.[PARSER_PACKAGE]).toBe(
      FIXED_PARSER_VERSION,
    );
  });
});
