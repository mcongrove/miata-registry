# `/local` — personal dev tools

Same idea as `/backups`: contents are **gitignored** except this file. Do not commit tools here unless the user asks.

Vite serves the gitignored `local/` folder in development only via `serveLocalDevTools` in `vite.config.ts`. This path is not deployed to production.

**Shared URL pattern (with the normal dev stack):**

1. `npm run dev` (Vite on :5173)
2. `npm run worker:dev` (API on :8788)
3. Open `http://localhost:5173/local/<file>.html`

**Fallback** (without Vite): `npx serve local -p 5199` → `http://localhost:5199/<file>.html` (CORS allows :5199 in development).

## Edition photo picker (`photos.html`)

Pick `image_car_id` values by edition (approved car photos from R2). Needs `/editions`, `/photos/index`, `/cars/:id`. Optional query: `?api=…`, `?cdn=…`.

## Paint chips (`paint.html`)

Unique `edition.color` / `edition.colors[]` values, hex from an inlined `colorMap` (keep in sync with `src/utils/car.ts`). Sorted by hue (then greys by lightness). **1990 Color Test Cars** colors are split into their own section. Needs `/editions`. Optional: `?api=http://localhost:8788`.
