# vitalcourier.app

Source for [vitalcourier.app](https://vitalcourier.app), the site for the Vital Courier iOS app. The home page is in English at `/` and in Brazilian Portuguese at `/pt-br`. The privacy policy is in English at `/privacy` and in Brazilian Portuguese at `/pt-br/privacy`.

## Stack

- Astro 7, built to static HTML (`build.format: 'file'`, no trailing slashes). The policy pages ship no client-side JavaScript of their own. Cloudflare Web Analytics adds its beacon script at the edge, in live responses to browsers only.
- Both policies are Markdown files in a content collection (`src/content/privacy/`), rendered through one shared layout.
- Tailwind CSS 4 through `@tailwindcss/vite`, with `@tailwindcss/typography` for the policy text.
- Cloudflare Workers static assets serve `dist/`. There is no Worker script. `public/_headers` sets the Content-Security-Policy, HSTS and the other security headers on every static response. The only script the CSP allows is the Web Analytics beacon from `static.cloudflareinsights.com`, which reports to the site's own `/cdn-cgi/rum`. Any other new external resource, such as a web font, needs its source added to the CSP or the browser blocks it.
- The site supports the browsers [Tailwind CSS 4 supports](https://tailwindcss.com/docs/compatibility): Safari and iOS 16.4+, Chrome 111+ and Firefox 128+. The built CSS and the header's `<picture>` media queries rely on Media Queries Level 4 syntax.
- Vitest reads the built HTML in `dist/` with `node-html-parser`, without a browser.

## Prerequisites

- Node 24, from `.nvmrc`. The `engines` field in `package.json` allows `^22.22.3 || ^24.16.0 || >=26.3.0`.
- npm. The `allowScripts` field in `package.json` approves install scripts for `esbuild` and `workerd` only.
- `overrides` in `package.json` forces `postcss-selector-parser` 7.1.6 under `@tailwindcss/typography`, whose 0.5.20 release pins the vulnerable 6.0.10 (GHSA-rj75-hqrm-r3gf). Remove it once a published typography release depends on 7.1.6 or later, then regenerate the lockfile. `npm ci` honors it.
- Docker (optional), only for the container workflow in [Docker](#docker).

## Getting started

```bash
npm ci
npm run dev
```

To run it with nothing on the host but Docker, see [Docker](#docker).

## Scripts

| Script                 | What it runs                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | `astro dev`, the dev server                                                                                   |
| `npm run build`        | `astro build`, which writes the site to `dist/`                                                               |
| `npm run preview`      | `wrangler dev`, which serves `dist/` the way Cloudflare does, `_headers` included. Run `npm run build` first. |
| `npm run check`        | `astro check`, which type-checks `.astro` and `.ts` files                                                     |
| `npm run lint`         | `eslint .`                                                                                                    |
| `npm run format`       | `prettier --write .`                                                                                          |
| `npm run format:check` | `prettier --check .`                                                                                          |
| `npm test`             | `TZ=America/Los_Angeles astro build && vitest run`. The time zone catches dates that print a day early.       |

## Docker

The site also runs in a container, for local development only. Cloudflare still builds and deploys `main` as described in [Deploying](#deploying), and the native npm workflow above doesn't change.

```bash
docker compose up
```

That builds the image and starts the dev server at http://localhost:4321/privacy. Edits on the host reload the page through the bind mount. The first start runs `npm ci` into a named Docker volume, which is the slow part. Later starts skip it, and it runs again on its own when `package-lock.json` changes.

- Both ports are published on `127.0.0.1` only, so other machines on your network can't reach the dev server, which can serve any file in the bind-mounted tree. To test from a phone on the same network, change the web mapping to `'4321:4321'` and restart with `docker compose up`. When you're done, put the mapping back and run `docker compose up` again, because the running container keeps the LAN-wide mapping until Compose recreates it. Don't commit the changed mapping.
- `docker compose up preview` builds `dist/` and serves it through Wrangler at http://localhost:8787, `_headers` included.
- One-off scripts (`check`, `lint`, `format:check`, `test`) run as `docker compose run --rm web npm run <script>`, for example `docker compose run --rm web npm test`.
- To start over from a clean install, remove the volume with `docker compose --profile preview down --volumes`. The profile flag stops `preview` too, which would otherwise keep the volume in use.

About the setup in `Dockerfile` and `compose.yaml`:

- The base image is Debian (`node:24.21.0-bookworm-slim`), not Alpine, because workerd, which `npm run preview` runs on, has no musl build. It runs Node 24 to match `.nvmrc`. The digest after the tag pins the exact image, and Dependabot proposes a refreshed digest or a newer 24.x each week.
- `astro dev` runs with `--ignore-lock`. Astro's lock file in `.astro/` is shared with the host through the bind mount, and the image has no `ps`, so Astro would treat any live PID in a stale lock as a running server and refuse to start. The cost is that `astro dev stop`, `status` and `logs` can't see the container's server.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It runs `npm ci`, then `npm run check`, `npm run lint`, `npm run format:check` and `npm test`, on the Node version in `.nvmrc`. A ruleset on `main`, set in the GitHub repo settings rather than in this repo, only accepts squash merges from a PR whose `verify` job passed. Both actions are pinned to commit SHAs, and checkout doesn't keep the token in the git config (`persist-credentials: false`).

`.github/dependabot.yml` checks the Actions, the Docker image and npm weekly. Version-update PRs wait 7 days after a release; security updates are not delayed. npm minor and patch bumps arrive as one grouped PR; majors come one per PR. Node majors are ignored for the Docker image, and `@types/node` majors too, because both follow `.nvmrc`. Its PRs need the same review or an admin merge as any other.

## Project layout

```
src/
  content/privacy/   en.md and pt-br.md, the policy text. Changing the text means moving its `updated:` date.
  content.config.ts  The privacy collection schema
  pages/             privacy.astro and pt-br/privacy.astro
  layouts/           Base.astro, the page shell
  content/home/      example-en.md and example-pt-br.md, the sample daily notes shown on the home page
  components/        PolicyPage.astro
  components/home/   The home page sections
  i18n/              ui.ts, the interface strings in both languages
  markdown/          external-links.ts, a rehype plugin that opens links in a new tab
  styles/            global.css
public/              _headers, favicons, the logo lockups and home/ (the app screenshots), copied into dist/ as they are
tests/               Vitest suites that read the built HTML, the policy Markdown and the deploy config
wrangler.jsonc       Cloudflare Worker config
Dockerfile           Dev-only image for the Docker workflow
compose.yaml         The web and preview services
.dockerignore        Keeps node_modules, build output and .env files out of the build context
```

## Deploying

Cloudflare Workers Builds is connected to this repo and deploys `main` with `npm run build`, then `npx wrangler deploy`. Every merge to `main` goes live on `vitalcourier.app`, with no separate deploy step.

Pull requests get no preview deploys. Preview builds are turned off in the Workers Builds settings in the Cloudflare dashboard, which live outside this repo. Separately, `wrangler.jsonc` sets `workers_dev` and `preview_urls` to `false`, so the Worker has no `workers.dev` or preview URL and the site is served only on its custom domain. To see a change before it merges, run `npm run build && npm run preview`.

`wrangler.jsonc` turns on Workers Logs and Traces at full sampling. The site has no Worker script, so static-asset requests don't invoke one and neither records anything; the privacy policy says so, and a Worker script would need that paragraph updated.

## Questions about the policy

Open an issue. Issues are public, so don't put health information or anything private in one.

## License

Everything in this repo is under the MIT License (see `LICENSE`), except the material below, which stays copyright 2026 Kleber Kihara, all rights reserved:

- The privacy policy text in `src/content/privacy/en.md` and `src/content/privacy/pt-br.md`.
- The Vital Courier logos and icons: `public/circuit-lockup-dark.svg`, `public/circuit-lockup-light.svg`, `public/circuit-symbol-dark.svg`, `public/circuit-symbol-light.svg`, `public/favicon.svg` and `public/favicon-32.png`.
- The app screenshots: `public/home/data-types-en.png`, `public/home/data-types-pt-br.png`, `public/home/destination-en.png` and `public/home/destination-pt-br.png`.

The exception covers copies of that material too, such as the policy excerpts in `tests/privacy-pages.test.ts` and the built pages and images in `dist/`. Copying or reusing any of it needs permission.

The external-link icon comes from Lucide and, before that, Feather, so it's covered by Lucide's ISC License and Feather's MIT License. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
