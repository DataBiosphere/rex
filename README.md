test
# Rex
Survey response service

### Requirements
- Docker
- Node 12
- Google cloud SDK

### Developing
Install deps
```sh
yarn install
```

Write config file
```sh
cp config/dev.json config.json
```

Build docs
```sh
yarn generate-docs
```

Run datastore emulator locally
```sh
gcloud beta emulators datastore start
```

Start a dev server on port 8080 with auto-reload
```sh
gcloud beta emulators datastore env-init; yarn start-dev
```

Lint
```sh
yarn lint
```

Deploy
```sh
TERRA_ENV=dev scripts/deploy.sh
```
