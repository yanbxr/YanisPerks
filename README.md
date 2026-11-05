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

The site is hosted on GitHub Pages from the `gh-pages` branch, without GitHub Actions.

```bash
npm run deploy
```

This builds the site for `/YanisPerks/`, then force-pushes the result to `gh-pages`. In the repository settings, set Pages to deploy from the `gh-pages` branch, root folder. Run it again only when the code changes; perk data updates on its own.
