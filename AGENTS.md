# Miata Registry — Agent Instructions

Community registry for limited edition Mazda Miatas. React 19 SPA (Vite 6, Tailwind 4) + Hono API on Cloudflare Workers, D1/Drizzle, KV, R2, Clerk, Resend.

Human-oriented docs: [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md).

## Keeping this file current

When the user corrects you on something that is likely to come up again in future sessions, update this file in the same turn (don't wait to be asked):

- Prefer folding into an existing section if one fits.
- Otherwise add a bullet under **Common mistakes**, or a short dedicated section/subsection if the topic needs more room.
- Keep entries terse and actionable — same tone as the rest of this file.

## Plan vs build

If the user asks to **plan**, **discuss**, **design**, **weigh options**, or “how would you go about…”, **do not implement**. Stay in planning: research, propose, ask clarifying questions, write/update a plan. Wait for an explicit build/implement go-ahead (or Plan-mode acceptance that clearly means “build this”) before writing product code, schema, or migrations.

Same bar for irreversible/prod steps (`db:push`, seed, deploy, push) — ask even after a build go-ahead unless they already said to do that step.

## Setup

**Prerequisites:** Node.js 22, npm.

**Env files** (get values from a maintainer):

- `.env` — frontend (`VITE_*`); worker URL defaults to `http://localhost:8788`
- `.dev.vars` — worker secrets (Clerk, Resend, archive keys, etc.)

**Run locally — both processes are required:**

```bash
npm install
npm run dev # Vite on :5173
npm run worker:dev # Wrangler remote worker on :8788
```

Without `worker:dev`, all API calls fail (`failed to fetch`).

**Before opening a PR:**

```bash
npm run lint
npm run format
npm run build
```

Other useful commands: `npm run email:dev` (preview emails), `npm run db:push` (apply schema to remote D1 — see Boundaries), `npm run worker:deploy` (API deploy).

## Architecture

```
src/
├── pages/ # Route-level components (lazy-loaded in App.tsx)
├── components/ # Shared UI
├── modals/ # Modal dialogs
├── worker/routes/ # Hono API handlers → mounted in worker/index.ts
├── worker/middleware/ # Clerk auth, moderator checks
├── db/schema/ # Drizzle table definitions
├── emails/ # react-email templates (+ separate tailwind.config.ts)
└── types/, utils/, hooks/, context/
```

- Frontend calls the worker via `VITE_CLOUDFLARE_WORKER_URL`.
- Worker must `export default app` (Hono) for Wrangler/D1 deploy.
- Production: SPA and API both auto-deploy on push to `main` (see Deployment).
- Images served from R2 via `VITE_CLOUDFLARE_IMAGE_CDN_URL` (`store.miataregistry.com`).

## Code conventions

- AGPL-3.0 license header on every new `.ts` / `.tsx` file (copy from any `src/` file). Ambient `.d.ts` stubs are exempt.
- Tailwind CSS for styling; `react-router-dom` for routing.
- Prettier: tabs, single quotes, semicolons (`.prettierrc`).
- Prefix intentionally unused vars/args with `_` for ESLint. Use inline `eslint-disable` only when context warrants it (intentional `any`, hook dep tricks, etc.) — don't blindly "fix" lint.
- No section-divider comments. Only comment non-obvious business logic.
- New D1 tables: order columns for human scanning (identity → discriminators → content → payload → housekeeping), not alphabetical. Match that order in `CREATE TABLE` and the Drizzle schema object — the console shows declaration order.

### Terminology (user-facing copy)

- **limited edition** — not "special edition"
- **edition** — not "model"
- **brg** — use `brg` Tailwind color tokens for UI; don't use `gray-*` classes. CSS `grayscale` filter on images is fine.

### Before commit

**Do not** run these mid-task as routine wrap-up. Only when preparing a **commit** (or when the user explicitly asks).

**Prettier / format**

1. Format touched files (prefer scoped write so you don't rewrite unrelated `src/`):

```bash
npx prettier --write path/to/changed.ts path/to/other.tsx
```

`npm run format` rewrites all of `src/**/*.{js,jsx,ts,tsx}` — fine right before a PR/commit if you intend a full pass.

2. Confirm it applied: `npx prettier --check` on those same paths (or `git diff` looks like formatting-only where expected). Fix anything still failing check before committing.

Mid-task: match existing file style by hand; don't kick off format/lint/build just to say you're done unless the user asked or you're about to commit.

**npm audit**

```bash
npm audit
```

Cross-reference findings against **direct** dependencies only (`dependencies` and `devDependencies` in `package.json`). If a direct package has an advisory, mention it briefly so the user can decide whether to upgrade before/with the commit.

- **Do** flag direct-dependency vulnerabilities to the user.
- **Don't** report or act on transitive-only findings.
- **Don't** run `npm audit fix`, `npm audit fix --force`, or bump packages unless the user asks.

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

## Domain logic

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

**Hard to test locally without prod data:** car edit PATCH (local Clerk `user_id` often differs from prod — see **Local car edit bypass** below), moderator flows (needs moderator role), some claim/register flows.

### Local car edit bypass

Local Clerk users usually have a different `user_id` than production, so the UI and `PATCH /cars/:id` deny edit even for your real car. For one-car testing against remote D1 (`worker:dev`), uncomment the matching `/* LOCAL DEV … */` blocks in:

- `src/utils/carEditAccess.ts` (show Edit + `/registry/:id/settings`)
- `src/worker/utils/carEditAccess.ts` (allow `PATCH /cars/:id` and `POST /photos/:id`)

Car UUID: `src/constants/local.ts` or optional `VITE_LOCAL_DEV_EDIT_CAR_ID` in `.env`. Re-comment before merge unless you intend to ship the bypass (don't). Submissions still hit **production** data and moderation queues.

## Deployment

Both targets **auto-deploy on push to `main`**. No manual dashboard deploy is required for normal releases.

| Target       | How                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------- |
| API worker   | GitHub Actions → `.github/workflows/deploy.yml` (lint, build, `worker:deploy`)              |
| Web frontend | Cloudflare dashboard **GitHub integration** (connected repo; builds/deploys `main` like CI) |

Systems differ (Actions vs dashboard Git integration), but agents should assume **push to `main` ships API + web** unless the user says otherwise.

**Do not commit, push, deploy, or run `db:push` unless the user explicitly asks.**

## Boundaries — ask first

- **Database writes** — there is no local D1. `worker:dev --remote` and `db:push` hit **production**. Never run schema pushes, backfills, or destructive SQL without explicit approval. Weekly [Internet Archive backups](https://archive.org/details/@miataregistry) include full registry CSV exports for offline study; they are not a substitute for `worker:dev` against live D1.
- **Archive cron** — never POST to `/heartbeat/archive/cron` without `ARCHIVE_DRY_RUN=true` in worker env. Real runs upload to Internet Archive.
- **Secrets** — don't read, log, or commit `.env`, `.dev.vars`, or secret values. `.dev.vars.example` / `.env.example` are the safe references.
- **Generated / vendor paths** — don't edit `dist/`, `.wrangler/`, `node_modules/`.
- **Local-only docs** — don't commit scratch files like `MIGRATION-PLAN.md` unless asked. Gitignored `/local` is for personal dev utilities (same idea as `/backups`); see [local/AGENTS.md](local/AGENTS.md).

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

Bump `CARS_LIST_CACHE_KEY_PREFIX` in `cars.ts` when changing list response shape (currently `cars:list:v7:`).

| Key pattern                                       | Purpose                   |
| ------------------------------------------------- | ------------------------- |
| `cars:list:v7:{params}`                           | Registry browse list      |
| `cars:details:{id}`                               | Car profile               |
| `cars:summary:{id}`                               | Car summary               |
| `editions:all:v2`, `editions:names`               | Edition data              |
| `stats:all`                                       | Site stats                |
| `news:*`                                          | News list/detail/featured |
| `resources:list:v4:…`, `resources:detail:v2:{id}` | Resources catalog         |
| `seo:sitemap:v9`                                  | Sitemap XML               |

Moderation approvals invalidate relevant car/edition/stats keys. Stale registry data after deploy? suspect KV — list prefix above.

### Resources catalog

Public catalog at `/resources` (D1 `resources` + `resource_associations`). Kinds: `link` (external `href`), `registry` (owner/community registries — external `href`), `file` (R2 via `file_key`), `page` (internal path in `href`). Associations are mainly `edition` + edition UUID (junction kept open for other types later — don't invent tag taxonomies unless needed).

**Naming:** descriptive `id` doubles as the public path (`/resources/{id}`) — e.g. `factory-colors-by-model-year`, `m-edition-field-guide`, `miata-registry-data-archive`. Prefer consistent patterns; don’t repeat `miata` in every id (the whole site is Miata). Keep `miata-registry-*` for this product, and proper names (`miatas-in-america`, `yellow-miata-registry`). Avoid hostnames (`github`) and pointless prefixes (`res_`). No separate `slug` column.

**sort_order shelves:** 100 Miata Registry, 200 registries, 300 VINs, 800 historic, 900 FAQ. List API: `sort_order` → `kind` → `title`.

**R2:** binding `RESOURCES` → bucket `miata-registry-resources` (not `IMAGES`). Public CDN: `https://resources.miataregistry.com` (`VITE_CLOUDFLARE_RESOURCES_CDN_URL`). Object keys: `{id}/{filename}` (no host) in `file_key`.

**SEO/AEO:** every published `/resources/:id` is sitemap’d / bot-bodied / JSON-LD’d (indexes our catalog page). Bot HTML for `link`/`registry` states the destination is third-party / not operated by us. Outbound CTAs (external `href` + R2 downloads) use `rel="nofollow noopener noreferrer"`; bot HTML and JSON-LD must not emit those URLs (`relatedLink` / `contentUrl` omitted).

**Editorial writes:** no in-app CMS — insert D1 rows + upload to `RESOURCES` offline (ask before prod writes).

### CORS

`/webhooks` and `/heartbeat` allow `origin: *`. All other routes restrict to `https://miataregistry.com` (plus `localhost:5173` in development).

### Email

Worker renders templates via `@react-email/render` (`src/worker/utils/renderEmail.ts`). Email Tailwind config is separate from the app (`src/emails/tailwind.config.ts`) — react-email v6 uses its own Tailwind setup.

### Worker build

`npm run worker:deploy` runs esbuild → `dist/worker.js`, then `wrangler deploy --keep-vars`. CI builds frontend too (`npm run build`) as a sanity check but only deploys the worker.

### Cloudflare observability

Worker logs may require a paid Cloudflare plan. For cron debugging, prefer `ARCHIVE_DRY_RUN`, KV keys above, or local `worker:dev` with curl.

## Common mistakes from past sessions

- Jumping from plan/discuss language into implementation without an explicit build go-ahead.
- Forgetting `worker:dev` → all APIs 404/fail.
- Testing archive cron without dry run → spurious IA uploads.
- Assuming web needs a manual Cloudflare deploy — it auto-deploys from `main` via dashboard Git integration (API via Actions).
- Running `db:push` during local dev work — hits prod.
- Changing registry sort/filter behavior without bumping list cache version.
- Using ISO date helpers on pending `created_at` unix fields without `* 1000`.
- "Fixing" intentional lint suppressions or hook dependency patterns without reading context.
- Treat news articles as D1 records; `body` may use Markdown, but don't create root Markdown source files.
