# Contributing

The README has the setup, scripts and CI details. This file covers what to do before you open a PR.

## Setup

Use Node 24, from `.nvmrc`. See [Prerequisites](README.md#prerequisites) for the supported range.

```bash
npm ci
npm run dev
```

To work in a container instead, see [Docker](README.md#docker).

## Before a PR

Run these four. They're the same ones [CI](README.md#ci) runs, and the `verify` job must pass.

```bash
npm run check
npm run lint
npm run format:check
npm test
```

`npm test` builds the site first. To see the real headers, run `npm run build && npm run preview`.

## Rules

- Policy text changes go in both `src/content/privacy/en.md` and `src/content/privacy/pt-br.md`, or the PR says why not. Each changed file gets a new `updated:` date.
- Policy pages ship no client-side JavaScript.
- The CSP allows no inline style or script. A test rejects `<style`, `style=`, `define:vars` and `<script` in `.astro` files. A new external resource needs a CSP change.
- Interface and page copy outside the policy text goes in `src/i18n/ui.ts`, in both languages. The home page's Markdown examples in `src/content/home/` are app output, not copy.
- Fill in the PR template.

## Policy wording

The policy has to match what the iOS app actually does. Wording changes need my sign-off, so open an issue first.

The policy text, logos and screenshots stay all rights reserved. A PR may edit them, but you can't reuse them elsewhere. See [License](README.md#license).

## Issues

Use the "Site problem" or "Privacy policy question" form. Issues are public, so don't put health data or anything private in one. Security reports go through [SECURITY.md](SECURITY.md).

## Merging

Merges are squash only. `@musashinm` owns every file in CODEOWNERS, so each PR waits for my review.

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
