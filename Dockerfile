# Dev-only image. Cloudflare Workers Builds does the production build and
# deploy, so there is no production stage here.
#
# The base must be glibc, not Alpine: workerd (behind `npm run preview`) ships
# no musl build, so npm installs the glibc binary on Alpine and it then fails
# at exec. The tag matches .tool-versions; bump both together.
FROM node:24.21.0-bookworm-slim

WORKDIR /app

# No COPY: compose bind-mounts the source and masks node_modules with a named
# volume, so the image holds only the runtime.
