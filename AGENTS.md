# Miata Registry — Agent Instructions

Community registry for limited edition Mazda Miatas. React 19 SPA (Vite 6, Tailwind 4) + Hono API on Cloudflare Workers, D1/Drizzle, KV, R2, Clerk, Resend.

Human-oriented docs: [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md).

## Session start (new chats only)

At the **start of a new agent chat session** — not on every follow-up message — run:

```bash
npm audit
```

Cross-reference findings against **direct** dependencies only (`dependencies` and `devDependencies` in `package.json`). If a direct package has an advisory, mention it briefly so the user can decide whether to upgrade during this session.

- **Do** flag direct-dependency vulnerabilities to the user.
- **Don't** report or act on transitive-only findings.
- **Don't** run `npm audit fix`, `npm audit fix --force`, or bump packages unless the user asks.

## Setup

**Prerequisites:** Node.js 22, npm.

**Env files** (get values from a maintainer):

- `.env` — frontend (`VITE_*`); worker URL defaults to `http://localhost:8788`
- `.dev.vars` — worker secrets (Clerk, Resend, archive keys, etc.)

**Run locally — both processes are required:**

```bash
npm install
npm run dev          # Vite on :5173
npm run worker:dev   # Wrangler remote worker on :8788
```

Without `worker:dev`, all API calls fail (`failed to fetch`).

**Before opening a PR:**

```bash
npm run lint
npm run format
npm run build
```

Other useful commands: `npm run email:dev` (preview emails), `npm run db:generate` / `npm run db:push` (schema — see boundaries below), `npm run worker:deploy` (API deploy).

## Architecture

```
src/
├── pages/              # Route-level components (lazy-loaded in App.tsx)
├── components/         # Shared UI
├── modals/             # Modal dialogs
├── worker/routes/      # Hono API handlers → mounted in worker/index.ts
├── worker/middleware/  # Clerk auth, moderator checks
├── db/schema/          # Drizzle table definitions
├── emails/             # react-email templates (+ separate tailwind.config.ts)
└── types/, utils/, hooks/, context/
```

- Frontend calls the worker via `VITE_CLOUDFLARE_WORKER_URL`.
- Worker must `export default app` (Hono) for Wrangler/D1 deploy.
- Production: SPA hosted on Cloudflare (dashboard); API worker deployed via GitHub Actions on push to `main`.
- Images served from R2 via `VITE_CLOUDFLARE_IMAGE_CDN_URL` (`store.miataregistry.com`).

## Code conventions

- AGPL-3.0 license header on every new `.ts` / `.tsx` file (copy from any `src/` file). Ambient `.d.ts` stubs are exempt.
- Tailwind CSS for styling; `react-router-dom` for routing.
- Prettier: tabs, single quotes, semicolons (`.prettierrc`).
- Prefix intentionally unused vars/args with `_` for ESLint. Use inline `eslint-disable` only when context warrants it (intentional `any`, hook dep tricks, etc.) — don't blindly "fix" lint.
- No section-divider comments. Only comment non-obvious business logic.

### Terminology (user-facing copy)

- **limited edition** — not "special edition"
- **edition** — not "model"
- **brg** — use `brg` Tailwind color tokens for UI; don't use `gray-*` classes. CSS `grayscale` filter on images is fine.

## Design (Impeccable)

UI/design work is guided by [Impeccable](https://impeccable.style/) — installed in `.cursor/skills/impeccable/`. Read these before changing frontend visuals or copy tone:

- **[PRODUCT.md](PRODUCT.md)** — audience, positioning, anti-references, strategic principles
- **[DESIGN.md](DESIGN.md)** — colors, typography, components, do's/don'ts (Google Stitch format)

Don't overwrite `PRODUCT.md` or `DESIGN.md` without asking. If design context is stale, suggest `/impeccable document` to refresh from code.

**Useful commands** (via `/impeccable` in Cursor):

- `polish <component/page>` — pre-ship design pass against DESIGN.md
- `craft <feature>` — shape-then-build for new UI
- `live` — iterate on elements in the running dev server (needs `npm run dev`)
- `audit <area>` — a11y / responsive checks

**Slop detector:** `npx impeccable detect src/` — deterministic anti-pattern rules; useful before UI PRs.

### Domain logic worth knowing

- **Moderation approval order:** owner → car → car_owner.
- **`cars.updated_date`** is set only when a **car_owner** submission is approved (initial claim or new ownership), not on field edits or car-only approvals. Backfill source: `car_owners_pending.created_at` (unix seconds → ISO).
- **Pending `created_at` fields** in `*_pending` tables are unix timestamps (integers), not ISO strings.
- **Registry default sort:** `updated_date` desc (newly verified first), then edition year/name/sequence.

## Testing

No automated E2E in CI — Cypress specs exist under `cypress/` but deps/scripts were removed. Don't reinstall or run Cypress unless explicitly asked.

**Manual verification checklist:**

1. `npm run lint && npm run build`
2. Both `dev` + `worker:dev` running; click through affected pages
3. Email changes → `npm run email:dev`
4. API changes → hit the route via curl or the UI

**Hard to test locally without prod data:** car edit PATCH (needs a Clerk account that owns a car), moderator flows (needs moderator role), some claim/register flows.

## Deployment

| Target | How |
|--------|-----|
| API worker | Auto on push to `main` → `.github/workflows/deploy.yml` (lint, build, `worker:deploy`) |
| Web frontend | Cloudflare dashboard (Pages/hosting), also auto-deploys from `main` |

After API changes that affect response shape, frontend may need a separate dashboard deploy. Coordinate with maintainer.

**Do not commit, push, deploy, or run `db:push` unless the user explicitly asks.**

## Boundaries — ask first

- **Database writes** — there is no local D1. `worker:dev --remote` and `db:push` hit **production**. Never run migrations, backfills, or destructive SQL without explicit approval.
- **Archive cron** — never POST to `/heartbeat/archive/cron` without `ARCHIVE_DRY_RUN=true` in worker env. Real runs upload to Internet Archive.
- **Secrets** — don't read, log, or commit `.env`, `.dev.vars`, or secret values. `.dev.vars.example` / `.env.example` are the safe references.
- **Generated / vendor paths** — don't edit `dist/`, `.wrangler/`, `node_modules/`.
- **Local-only docs** — don't commit scratch files like `MIGRATION-PLAN.md` unless asked.

## Gotchas

### Local dev uses production Cloudflare resources

`worker:dev` binds to production D1, KV, and R2. Local API calls read and write real data. Be careful with mutations, test submissions, and schema experiments.

### Weekly Internet Archive backup

- **Trigger:** [cron-job.org](https://cron-job.org) POSTs weekly to `https://miata-registry.miata-registry.workers.dev/heartbeat/archive/cron` with `Authorization: Bearer {ARCHIVE_ORG_CRON_SECRET}`.
- **Dry run:** set `ARCHIVE_DRY_RUN=true` in `.dev.vars` (default in `.dev.vars.example`). Exports CSVs and zips but skips IA upload; returns `{ dryRun: true }`.
- **Success KV:** `heartbeat:archive` → `{ timestamp, filename, url }` (7-day TTL). Readable via `GET /heartbeat/archive`.
- **Error KV:** `heartbeat:archive:error` → `{ timestamp, message }`. Cron-job.org often won't show response bodies; check KV or worker logs.
- **Pulse cache:** `heartbeat:pulse` — admin last-active from Clerk; skipped in dev (`NODE_ENV=development`).

### KV cache keys

Bump `CARS_LIST_CACHE_KEY_PREFIX` in `cars.ts` when changing list response shape (currently `cars:list:v5:`).

| Key pattern | Purpose |
|-------------|---------|
| `cars:list:v5:{params}` | Registry browse list |
| `cars:details:{id}` | Car profile |
| `cars:summary:{id}` | Car summary |
| `editions:all`, `editions:names` | Edition data |
| `stats:all` | Site stats |
| `news:*` | News list/detail/featured |

Moderation approvals invalidate relevant car/edition/stats keys. Stale registry data after deploy? suspect KV — list prefix above.

### CORS

`/webhooks` and `/heartbeat` allow `origin: *`. All other routes restrict to `https://miataregistry.com` (plus `localhost:5173` in development).

### Email

Worker renders templates via `@react-email/render` (`src/worker/utils/renderEmail.ts`). Email Tailwind config is separate from the app (`src/emails/tailwind.config.ts`) — react-email v6 uses its own Tailwind setup.

### Worker build

`npm run worker:deploy` runs esbuild → `dist/worker.js`, then `wrangler deploy --keep-vars`. CI builds frontend too (`npm run build`) as a sanity check but only deploys the worker.

### Cloudflare observability

Worker logs may require a paid Cloudflare plan. For cron debugging, prefer `ARCHIVE_DRY_RUN`, KV keys above, or local `worker:dev` with curl.

## Common mistakes from past sessions

- Forgetting `worker:dev` → all APIs 404/fail.
- Testing archive cron without dry run → spurious IA uploads.
- Assuming both web and API deploy the same way — they don't (both auto-deploy, but via different systems).
- Running `db:push` during local dev work — hits prod.
- Changing registry sort/filter behavior without bumping list cache version.
- Using ISO date helpers on pending `created_at` unix fields without `* 1000`.
- "Fixing" intentional lint suppressions or hook dependency patterns without reading context.
