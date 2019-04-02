#!/usr/bin/env bash
set -eo pipefail
npm install
npm run lint
npm run generate-docs

for env in dev alpha perf staging ; do
    TERRA_ENV=$env
    cp config.$TERRA_ENV.json config.json
    gcloud app deploy --project=terra-rex-$TERRA_ENV
done
