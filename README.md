# vitalcourier.app

Source for [vitalcourier.app](https://vitalcourier.app), the privacy policy site for the Vital Courier iOS app. The policy is in English at `/privacy` and in Brazilian Portuguese at `/pt-br/privacy`, and `/` answers with a 302 to `/privacy`.

## Stack

- Astro 7, built to static HTML (`build.format: 'file'`, no trailing slashes). The policy pages ship no client-side JavaScript.
- Both policies are Markdown files in a content collection (`src/content/privacy/`), rendered through one shared layout.
- Tailwind CSS 4 through `@tailwindcss/vite`, with `@tailwindcss/typography` for the policy text.
- Cloudflare Workers static assets serve `dist/`. There is no Worker script, and `public/_redirects` handles the root redirect.
- Vitest reads the built HTML in `dist/` with `node-html-parser`, without a browser.

## Prerequisites

- Node 24, from `.nvmrc`. The `engines` field in `package.json` allows `^22.22.3 || ^24.16.0 || >=26.3.0`.
- npm. The `allowScripts` field in `package.json` approves install scripts for `esbuild` and `workerd` only.

## Getting started

```bash
npm ci
npm run dev
```

## Scripts

| Script                 | What it runs                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | `astro dev`, the dev server                                                                                     |
| `npm run build`        | `astro build`, which writes the site to `dist/`                                                                 |
| `npm run preview`      | `wrangler dev`, which serves `dist/` the way Cloudflare does, `_redirects` included. Run `npm run build` first. |
| `npm run check`        | `astro check`, which type-checks `.astro` and `.ts` files                                                       |
| `npm run lint`         | `eslint .`                                                                                                      |
| `npm run format`       | `prettier --write .`                                                                                            |
| `npm run format:check` | `prettier --check .`                                                                                            |
| `npm test`             | `TZ=America/Los_Angeles astro build && vitest run`. The time zone catches dates that print a day early.         |

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It runs `npm ci`, then `npm run check`, `npm run lint`, `npm run format:check` and `npm test`, on the Node version in `.nvmrc`. A ruleset on `main`, set in the GitHub repo settings rather than in this repo, only accepts squash merges from a PR whose `verify` job passed.

## Project layout

```
src/
  content/privacy/   en.md and pt-br.md, the policy text. Changing the text means moving its `updated:` date.
  content.config.ts  The privacy collection schema
  pages/             privacy.astro and pt-br/privacy.astro
  layouts/           Base.astro, the page shell
  components/        PolicyPage.astro
  i18n/              ui.ts, the interface strings in both languages
  markdown/          external-links.ts, a rehype plugin that opens links in a new tab
  styles/            global.css
public/              _redirects, favicons and the logo lockups, copied into dist/ as they are
tests/               Vitest suites that read the built HTML and the deploy config
wrangler.jsonc       Cloudflare Worker config
```

## Deploying

Cloudflare Workers Builds is connected to this repo and deploys `main` with `npm run build`, then `npx wrangler deploy`. Every merge to `main` goes live on `vitalcourier.app`, with no separate deploy step.

Pull requests get no preview deploys. Preview builds are turned off in the Workers Builds settings in the Cloudflare dashboard, which live outside this repo. Separately, `wrangler.jsonc` sets `workers_dev` and `preview_urls` to `false`, so the Worker has no `workers.dev` or preview URL and the site is served only on its custom domain. To see a change before it merges, run `npm run build && npm run preview`.

`wrangler.jsonc` turns on Workers Logs and Traces at full sampling. The site has no Worker script yet, and requests that only hit static assets may not show up in either.

## Questions about the policy

Open an issue. Issues are public, so don't put health information or anything private in one.

## License

Everything in this repo is under the MIT License (see `LICENSE`), except the material below, which stays copyright 2026 Kleber Kihara, all rights reserved:

- The privacy policy text in `src/content/privacy/en.md` and `src/content/privacy/pt-br.md`.
- The Vital Courier logos and icons: `public/circuit-lockup-dark.svg`, `public/circuit-lockup-light.svg`, `public/favicon.svg` and `public/favicon-32.png`.

The exception covers copies of that material too, such as the policy excerpts in `tests/privacy-pages.test.ts` and the built pages and images in `dist/`. Copying or reusing any of it needs permission.
