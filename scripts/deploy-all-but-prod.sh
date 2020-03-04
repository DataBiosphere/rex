#!/usr/bin/env bash
set -eo pipefail
yarn install
yarn lint
yarn generate-docs

for env in dev alpha perf staging ; do
    TERRA_ENV=$env
    cp config.$TERRA_ENV.json config.json
    gcloud app deploy --project=terra-rex-$TERRA_ENV -q
done
