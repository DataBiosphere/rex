#!/usr/bin/env bash
set -eo pipefail
cp config/$TERRA_ENV.json config.json
yarn install
yarn lint
yarn generate-docs
gcloud app deploy --project=terra-rex-$TERRA_ENV
