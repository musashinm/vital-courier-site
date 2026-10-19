# Security policy

## Reporting a vulnerability

Use [GitHub's private reporting form](https://github.com/musashinm/vital-courier-site/security/advisories/new). Don't open an issue for it, since issues here are public.

I'll reply within 7 days. It's a one-person project, so fixes take as long as they take. I'll say in the advisory when it's fixed.

## What's supported

Only what's live on vitalcourier.app, which is the latest `main`. There are no versions or branches to backport to.

## In scope

- The site's built pages and assets.
- `public/_headers`, which sets the Content-Security-Policy, HSTS and the other headers.
- `wrangler.jsonc`.
- The Workers Builds deploy of `main`.
- The CI and Dependabot config in `.github/`.
- Anything on the policy pages that leaks data or contradicts what the policy says the site collects.

## Out of scope

- The iOS app and its data handling. Report those through the [app repo's private reporting form](https://github.com/musashinm/vital-courier-app/security/advisories/new).
- Cloudflare's own platform, and the Web Analytics beacon script itself.
