# YanisPerks

Fast perk searcher for Destiny 2, by @yanbxr.

## Setup

Bungie requires an API key for the manifest. Create one at https://www.bungie.net/en/Application, then:

```bash
cp .env.example .env
npm install
npm run dev
```

Put the key in `.env` as `BUNGIE_KEY`. `npm run perks` downloads the perk definitions into `public/perks.json`, and runs automatically before `dev` and `build`.

## Deploy

`npm run build` exports a static site to `out/`. The GitHub Actions workflow builds and deploys it to Pages on every push to `main` and once a day to pick up new manifests. Add the key as a repository secret named `BUNGIE_KEY`.
