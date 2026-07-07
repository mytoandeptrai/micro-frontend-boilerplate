# syntax=docker/dockerfile:1.7
#
# Reverse proxy that fronts the three app containers behind one origin:
#   /            -> shell
#   /first-app/  -> first-app
#   /second-app/ -> second-app
#
# Build context is this directory (./nginx), not the repo root:
#   docker build -t mfe/reverse-proxy ./nginx

FROM nginx:1.27-alpine
RUN apk add --no-cache nginx-mod-http-brotli

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx/proxy_cache /tmp/client_temp /tmp/proxy_temp \
    && chown -R nginx:nginx /var/cache/nginx /tmp/client_temp /tmp/proxy_temp

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
