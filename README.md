# Harry Tang's offical website

This is the source code for my offical website harrytang.xyz. It is built using Next.js and Tailwind CSS. The backend is built using Strapi.

[![Test](https://github.com/harrytang/web/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/harrytang/web/actions/workflows/test.yaml)

## Getting started

To get started with docker, first clone this repo and run the following command to start a shell in a docker container:

```bash
docker run -it --rm -v $(pwd):/app -w /app node:20-alpine sh
```

Next, install the dependencies:

```bash
npm install
```

Next, create a `.env.local` file in the root of your project and set the the nessary environment variables.

Finally, run the development server:

```bash
docker-compose up -d
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## e2e testing

To run the e2e tests, run the following command:

```bash
docker run --rm -it \\n-v ${PWD}:/workspace \\n-w /workspace \\nmcr.microsoft.com/playwright:v1.44.1-jammy sh
export $(cat .env.build.local | grep -v '^#' | xargs)
npm run build
npx playwright install --with-deps
npm run test:e2e
```
