# Dev-only image. Cloudflare Workers Builds does the production build and
# deploy, so there is no production stage here.
#
# The base must be glibc, not Alpine: workerd (behind `npm run preview`) ships
# no musl build, so npm installs the glibc binary on Alpine and it then fails
# at exec. The image runs Node 24 to match .nvmrc. The digest pins the exact
# multi-arch image, and Dependabot refreshes it weekly.
FROM node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20

WORKDIR /app

# No COPY: compose bind-mounts the source and masks node_modules with a named
# volume, so the image holds only the runtime.
