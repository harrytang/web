# Base image with minimal footprint
FROM node:22-alpine AS base

# Set environment variables for PNPM
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

# Enable corepack for package management
RUN corepack enable

# Set working directory
WORKDIR /app

###################
### Build Stage ###
###################
FROM base AS builder

# Define ARG variables to pass build-time environment variables
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STATUS_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_STRAPI_API_URL
ARG NEXT_PUBLIC_STORAGE_HOST
ARG NEXT_PUBLIC_CSE_ID
ARG NEXT_PUBLIC_PAGE_SIZE
ARG NEXT_PUBLIC_HOME_PAGE_SIZE
ARG NEXT_PUBLIC_AVATAR_URL
ARG NEXT_PUBLIC_FAVICON_URL
ARG NEXT_PUBLIC_ICON_URL
ARG NEXT_PUBLIC_REMARK42_SITE_ID
ARG NEXT_PUBLIC_REMARK42_HOST
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ARG NEXT_PUBLIC_PLAUSIBLE_SITE
ARG NEXT_PUBLIC_PLAUSIBLE_ENABLED
ARG STRAPI_API_URL
ARG SITEMAP_SIZE

# Pass ARG values to ENV variables
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_STATUS_URL=${NEXT_PUBLIC_STATUS_URL} \
    NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME} \
    NEXT_PUBLIC_STRAPI_API_URL=${NEXT_PUBLIC_STRAPI_API_URL} \
    NEXT_PUBLIC_STORAGE_HOST=${NEXT_PUBLIC_STORAGE_HOST} \
    NEXT_PUBLIC_CSE_ID=${NEXT_PUBLIC_CSE_ID} \
    NEXT_PUBLIC_PAGE_SIZE=${NEXT_PUBLIC_PAGE_SIZE} \
    NEXT_PUBLIC_HOME_PAGE_SIZE=${NEXT_PUBLIC_HOME_PAGE_SIZE} \
    NEXT_PUBLIC_AVATAR_URL=${NEXT_PUBLIC_AVATAR_URL} \
    NEXT_PUBLIC_FAVICON_URL=${NEXT_PUBLIC_FAVICON_URL} \
    NEXT_PUBLIC_ICON_URL=${NEXT_PUBLIC_ICON_URL} \
    NEXT_PUBLIC_REMARK42_SITE_ID=${NEXT_PUBLIC_REMARK42_SITE_ID} \
    NEXT_PUBLIC_REMARK42_HOST=${NEXT_PUBLIC_REMARK42_HOST} \
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN=${NEXT_PUBLIC_PLAUSIBLE_DOMAIN} \
    NEXT_PUBLIC_PLAUSIBLE_SITE=${NEXT_PUBLIC_PLAUSIBLE_SITE} \
    NEXT_PUBLIC_PLAUSIBLE_ENABLED=${NEXT_PUBLIC_PLAUSIBLE_ENABLED} \
    STRAPI_API_URL=${STRAPI_API_URL} \
    SITEMAP_SIZE=${SITEMAP_SIZE} \
    NEXT_TELEMETRY_DISABLED=1

# Fetch dependencies
COPY pnpm-lock.yaml /app
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch

# Install dependencies
COPY . .
RUN pnpm install --offline --frozen-lockfile

# Download favicon for the app (uses ADD for simplicity)
ADD ${NEXT_PUBLIC_FAVICON_URL} /app/src/app/favicon.ico

# Build the Next.js app
RUN pnpm run build

########################
### Production Stage ###
########################
FROM node:22-alpine AS runner

# Set NODE_ENV for production and define the application port
ENV NODE_ENV=production \
    PORT=3000

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy the build artifacts from the builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change user to non-root
USER nextjs

# Expose the application port
EXPOSE 3000

# Start the NextJS application
CMD ["node", "server.js"]
