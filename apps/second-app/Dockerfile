# syntax=docker/dockerfile:1.7
#
# Production image for @ops/second-app (Module Federation remote, served at
# "/second-app/*" behind the reverse proxy). Build from the REPO ROOT:
#
#   docker build -f apps/second-app/Dockerfile \
#     --build-arg SECOND_APP_URL=https://example.com/second-app \
#     --build-arg SHELL_URL=https://example.com \
#     -t mfe/second-app .

# ---------------------------------------------------------------------------
# Stage 1: base — Node + pnpm, shared by the prune/install/build stages
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
RUN pnpm config set store-dir /pnpm-store
WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: pruner — turbo prune isolates only what @ops/second-app needs
# ---------------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN --mount=type=cache,id=turbo-dlx,target=/pnpm-store \
    pnpm dlx turbo@2.10.0 prune @ops/second-app --docker

# ---------------------------------------------------------------------------
# Stage 3: installer — install pruned deps first (cached independently of
# source changes), then overlay full source and build.
# ---------------------------------------------------------------------------
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# SECOND_APP_URL becomes this app's own asset prefix (Module Federation
# remoteEntry/chunk URLs); SHELL_URL is where it resolves "shell/store" from.
# Both are baked into the JS bundle at build time — changing them later
# requires rebuilding this image, not just restarting it.
ARG SECOND_APP_URL
ARG SHELL_URL
ENV NODE_ENV=production \
    SECOND_APP_URL=${SECOND_APP_URL} \
    SHELL_URL=${SHELL_URL}

RUN pnpm turbo build --filter=@ops/second-app

# ---------------------------------------------------------------------------
# Stage 4: runner — nginx serves the static dist/ output. Non-root, minimal.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner
RUN apk add --no-cache nginx-mod-http-brotli

COPY apps/second-app/nginx.conf /etc/nginx/nginx.conf
COPY --from=installer /app/apps/second-app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
