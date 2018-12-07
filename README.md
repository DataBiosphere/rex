# Rex
Survey response service

### Requirements
- Docker
- Node 8
- Google cloud SDK

### Developing
Install deps
```sh
npm install
```

Write config file
```sh
cp config.dev.json config.json
```

Build docs
```sh
npm run generate-docs
```

Run datastore emulator locally
```sh
gcloud beta emulators datastore start
$(gcloud beta emulators datastore env-init)
```

Start a dev server on port 8080 with auto-reload
```sh
npm run start-dev
```

Lint
```sh
npm run lint
```

Deploy
```sh
TERRA_ENV=dev scripts/deploy.sh
```
