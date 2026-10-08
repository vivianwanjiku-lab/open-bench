# Open Bench

Open Bench is a crowd-sourced map of adult changing tables: full-size benches in public restrooms, for disabled adults, caregivers, families, and venues.

The name lives in one file, [`src/config/site.ts`](src/config/site.ts). Change `name` there (keep it a single-line double-quoted string) and rebuild. The HTML title, description, and theme color are read from that file.

Listings on the public map are **sample data**. They use fictional venue names and addresses, and every map, list, and detail view says so. Do not travel to them. Search engines are asked not to index the site while `showSampleData` is `true`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

```bash
npm test
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/` and copies `index.html` to `dist/404.html` so client-side routes work on GitHub Pages.

## Stack

- Vite, React, TypeScript
- Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/) (Radix)
- React Router
- Leaflet with OpenStreetMap tiles (no API key)
- Place search uses OpenStreetMap Nominatim when a query is not already in the sample list
- Fonts: Atkinson Hyperlegible and Fraunces, bundled with the site

## Pages

- Home, with search and the cited reasons this map exists
- Map and list, with filters and “use my location”
- Station detail: access, hours, bench, hoist, room, route, photos, last check, community checks, report, directions, share
- Add a station, with validation and a photo picker
- For venues, About, FAQ, Privacy, Contact

## Data and a future backend

There is no server. The app reads:

1. Fictional seed listings in [`src/data/stations.ts`](src/data/stations.ts), included only while `showSampleData` is `true`
2. Submissions, checks, and reports in `localStorage`, under the prefix in `site.storageKey` (`open-bench` by default)

Submissions are labeled pending review and exist only in that browser. The form says this before you submit.

[`src/data/repository.ts`](src/data/repository.ts) is the seam. `localRepository` implements `StationRepository`. [`src/data/supabase.example.ts`](src/data/supabase.example.ts) shows the same shape for Supabase and is not imported by the app. To switch later:

1. `npm install @supabase/supabase-js`
2. Copy [`.env.example`](.env.example) to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Store stations with a status such as `pending` or `published`
4. Point the `repository` export at the Supabase adapter
5. Set `showSampleData` to `false` only after real, reviewed listings exist, and update the privacy page

Turning off `showSampleData` also removes the `noindex` tag. Do that only when the listings are real.

## Deploy

The production build is a static `dist/` folder.

- **Netlify:** [`netlify.toml`](netlify.toml) builds the site and rewrites routes to `index.html`.
- **Vercel:** [`vercel.json`](vercel.json) rewrites all paths to `index.html`. Use the Vite preset.
- **GitHub Pages:** For a project site, set `base` in [`vite.config.ts`](vite.config.ts) to `"/your-repo/"`. `npm run build` adds `dist/404.html`, which Pages uses for client-side routes. Upload `dist`, or deploy that folder with an action. A user or organization site served from `/` can keep `base` as `/`.

Map tiles and unmatched place searches call OpenStreetMap. The host must allow those requests in the browser.

## Contact and rename

The contact address in `src/config/site.ts` is `TODO@example.com` until you replace it. The contact page says that it is a placeholder.

Founder details (Vivian Wanjiku, Nairobi, YouTube `@VivianeWanjiku_lab`) are in the same config file.

## Accessibility

The interface uses semantic headings and landmarks, visible labels, keyboard focus, a skip link, and a list that matches the map. Motion is reduced when the visitor asks for that. Sample listings are text, not color alone.
