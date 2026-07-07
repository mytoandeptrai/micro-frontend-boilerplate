# syntax=docker/dockerfile:1.7
#
# Production image for @ops/shell (the Module Federation host, served at "/").
# Build from the REPO ROOT so `turbo prune` can see the whole workspace:
#
#   docker build -f apps/shell/Dockerfile \
#     --build-arg FIRST_APP_URL=https://example.com/first-app \
#     --build-arg SECOND_APP_URL=https://example.com/second-app \
#     -t mfe/shell .

# ---------------------------------------------------------------------------
# Stage 1: base — Node + pnpm, shared by the prune/install/build stages
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
RUN pnpm config set store-dir /pnpm-store
WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: pruner — turbo prune isolates only what @ops/shell needs to build
# (its own source + the internal packages it depends on), nothing else.
# ---------------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN --mount=type=cache,id=turbo-dlx,target=/pnpm-store \
    pnpm dlx turbo@2.10.0 prune @ops/shell --docker

# ---------------------------------------------------------------------------
# Stage 3: installer — install pruned deps first (cached independently of
# source changes), then overlay full source and build.
# ---------------------------------------------------------------------------
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Module Federation remote URLs — baked into the JS bundle at build time.
# Changing these later requires rebuilding this image, not just restarting it.
ARG FIRST_APP_URL
ARG SECOND_APP_URL
ARG PUBLIC_SHOW_EVENT_DEBUGGER=false
ENV NODE_ENV=production \
    FIRST_APP_URL=${FIRST_APP_URL} \
    SECOND_APP_URL=${SECOND_APP_URL} \
    PUBLIC_SHOW_EVENT_DEBUGGER=${PUBLIC_SHOW_EVENT_DEBUGGER}

RUN pnpm turbo build --filter=@ops/shell

# ---------------------------------------------------------------------------
# Stage 4: runner — nginx serves the static dist/ output. Non-root, minimal.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner
RUN apk add --no-cache nginx-mod-http-brotli

COPY apps/shell/nginx.conf /etc/nginx/nginx.conf
COPY --from=installer /app/apps/shell/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
