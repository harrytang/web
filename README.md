# Harry Tang's offical website

[![Maintainability](https://api.codeclimate.com/v1/badges/305ca72fc0b549041a33/maintainability)](https://codeclimate.com/github/harrytang/web/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/305ca72fc0b549041a33/test_coverage)](https://codeclimate.com/github/harrytang/web/test_coverage)

This is the source code for my offical website harrytang.xyz. It is built using Next.js and Tailwind CSS. The backend is built using Strapi.

## Getting started

Install the dependencies:

```bash
pnpm install
```

Next, create a `.env.local` file in the root of your project and set the the nessary environment variables.

## Test

```bash
nodesh # docker run --rm -it -v ${PWD}:/workspace -w /workspace ghcr.io/harrytang/devops-tools:node sh
export $(cat .env.local | grep -v '^#' | xargs)
pnpm run test
```

## E2e testing

To run the e2e tests locally, run the following command:

```bash
docker run --rm -it -v ${PWD}:/workspace -w /workspace mcr.microsoft.com/playwright:latest bash
export $(cat .env.e2e.local | grep -v '^#' | xargs)
npm install -g pnpm
pnpm run build
pnpm exec playwright install --with-deps
pnpm run test:e2e
```
