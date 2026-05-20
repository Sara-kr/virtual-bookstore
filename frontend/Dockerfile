# ── Build Stage ──────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ── Production Stage: Nginx ───────────────────────
FROM nginx:1.25-alpine

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config for React SPA (handle client-side routing)
RUN echo 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  location /static/ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
  } \
  gzip on; \
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
