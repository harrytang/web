#!/bin/bash

# Source the environment variables from .env file
if [ -f .env.build.local ]; then
    export $(cat .env.build.local | grep -v '^#' | xargs)
fi

npm run test:e2e
