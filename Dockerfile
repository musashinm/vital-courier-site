# Dev-only image. Cloudflare Workers Builds does the production build and
# deploy, so there is no production stage here.
#
# The base must be glibc, not Alpine: workerd (behind `npm run preview`) ships
# no musl build, so npm installs the glibc binary on Alpine and it then fails
# at exec. The image runs Node 24 to match .nvmrc. The digest pins the exact
# multi-arch image. Dependabot checks it weekly but hasn't opened a PR for it
# so far, so bump it by hand when a Node CVE matters.
FROM node:24.22.1-bookworm-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c

# workerd (behind `npm run preview`) loads the system CA store at startup and
# exits with "No CA certificates were loaded from the system" when it's empty.
# The slim base ships none, so install them.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# No COPY: compose bind-mounts the source and masks node_modules with a named
# volume, so the image holds only the runtime.
