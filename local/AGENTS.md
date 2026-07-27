# `/local` — personal dev tools

Same idea as `/backups`: contents are **gitignored** except this file. Do not commit tools here unless the user asks.

## Edition photo picker (`photos.html`)

Pick `image_car_id` values by edition (approved car photos from R2).

**URL (with the normal dev stack):**

1. `npm run dev` (Vite on :5173)
2. `npm run worker:dev` (API on :8788 — required for `/editions`, `/photos/index`, `/cars/:id`)
3. Open **http://localhost:5173/local/photos.html**

Vite serves the gitignored `local/` folder in development only via `serveLocalDevTools` in `vite.config.ts`. This path is not deployed to production.

**Query params (optional):** `?api=http://localhost:8788`, `?cdn=https://store.miataregistry.com`

**Worker note:** `/photos/index` must exist in the worker you point at. Restart `worker:dev` after pulling API changes.

**Fallback** (without Vite): `npx serve local -p 5199` → http://localhost:5199/photos.html (CORS allows :5199 in development).
