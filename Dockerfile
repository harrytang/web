FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm install -g npm@latest
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi


# 2. Rebuild the source code only when needed
FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_STRAPI_API_URL
ARG NEXT_PUBLIC_STORAGE_HOST
ARG NEXT_PUBLIC_CSE_ID
ARG NEXT_PUBLIC_PAGE_SIZE
ARG NEXT_PUBLIC_HOME_PAGE_SIZE
ARG STRAPI_API_URL

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
ENV NEXT_PUBLIC_STRAPI_API_URL=${NEXT_PUBLIC_STRAPI_API_URL}
ENV NEXT_PUBLIC_STORAGE_HOST=${NEXT_PUBLIC_STORAGE_HOST}
ENV NEXT_PUBLIC_CSE_ID=${NEXT_PUBLIC_CSE_ID}
ENV NEXT_PUBLIC_PAGE_SIZE=${NEXT_PUBLIC_PAGE_SIZE}
ENV NEXT_PUBLIC_HOME_PAGE_SIZE=${NEXT_PUBLIC_HOME_PAGE_SIZE}
ENV STRAPI_API_URL=${STRAPI_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY --from=deps /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
COPY --from=deps /usr/local/bin/npm /usr/local/bin/npm
COPY --from=deps /usr/local/bin/npx /usr/local/bin/npx
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# RUN npx nx affected -t build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
# COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD node server.js