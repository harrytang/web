#!/bin/bash

# Source the environment variables from .env file
if [ -f .env.build.local ]; then
    export $(cat .env.build.local | grep -v '^#' | xargs)
fi

# Docker build command with all the ARG values
docker build \
    --progress=plain \
    --build-arg NEXT_PUBLIC_STRAPI_API_URL=${NEXT_PUBLIC_STRAPI_API_URL} \
    --build-arg NEXT_PUBLIC_STORAGE_HOST=${NEXT_PUBLIC_STORAGE_HOST} \
    --build-arg NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME} \
    --build-arg NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    --build-arg NEXT_PUBLIC_CA_PUB=${NEXT_PUBLIC_CA_PUB} \
    --build-arg NEXT_PUBLIC_PAGE_SIZE=${NEXT_PUBLIC_PAGE_SIZE} \
    --build-arg NEXT_PUBLIC_CSE_ID=${NEXT_PUBLIC_CSE_ID} \
    --build-arg NEXT_PUBLIC_HOME_PAGE_SIZE=${NEXT_PUBLIC_HOME_PAGE_SIZE} \
    --build-arg NEXT_PUBLIC_AVATAR_URL=${NEXT_PUBLIC_AVATAR_URL} \
    --build-arg NEXT_PUBLIC_FAVICON_URL=${NEXT_PUBLIC_FAVICON_URL} \
    --build-arg NEXT_PUBLIC_ICON_URL=${NEXT_PUBLIC_ICON_URL} \
    --build-arg NEXT_PUBLIC_REMARK42_HOST=${NEXT_PUBLIC_REMARK42_HOST} \
    --build-arg NEXT_PUBLIC_REMARK42_SITE_ID=${NEXT_PUBLIC_REMARK42_SITE_ID} \
    --build-arg STRAPI_API_URL=${NEXT_PUBLIC_STRAPI_API_URL} \
    --build-arg SITEMAP_SIZE=${SITEMAP_SIZE} \
    -t ghcr.io/harrytang/web:dev .
