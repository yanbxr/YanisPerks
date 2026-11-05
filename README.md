# YanisPerks

Fast perk searcher for Destiny 2, by @yanbxr.

The site is fully static. Each visit asks Bungie for the current manifest version and loads the latest perks straight from Bungie, saving them in the browser until the next manifest update, so the data is always up to date without rebuilding.

## Setup

Create a Bungie API key at https://www.bungie.net/en/Application. In the key's settings, set the origin header to your site's address so the key only works from there.

```bash
cp .env.example .env
npm install
npm run dev
```

Put the key in `.env` as `NEXT_PUBLIC_BUNGIE_KEY`. It is built into the page, which is how Bungie keys are meant to be used from the browser.

## Deploy

`npm run build` exports the static site to `out/`. Upload that folder to any static host. Rebuild only when the code changes.

For GitHub Pages under `/YanisPerks/`, build with `PAGES_BASE_PATH=/YanisPerks`, or let the included GitHub Actions workflow do it with the key stored as a repository secret named `BUNGIE_KEY`.
