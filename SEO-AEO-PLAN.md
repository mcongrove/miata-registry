# SEO + AEO Plan — Miata Registry

Living plan for search engines (SEO) and answer engines (GEO/AEO). Last updated: 2026-07-12.

**Status:** Implemented on `feature/seo-aeo`. Phasing was delivery order only.

## Deploy notes (manual)

**Cloudflare Pages** (miataregistry.com frontend):
- Build: `npm run build`, output `dist` (dashboard settings)
- **Cannot** share `wrangler.toml` with the API Worker — Pages skips worker config automatically
- **Required:** bind D1 `DB` → `registry` and KV `CACHE` in Pages → Settings → Functions (see `wrangler.pages.toml` for IDs)
- Pages Functions serve `/sitemap.xml`, `/data/editions.json`, and bot HTML injection via `_middleware.ts`
- Pages Functions serve `/sitemap.xml`, `/data/editions.json`, and bot HTML injection via `_middleware.ts`

**API worker** (optional fallback for SEO routes on workers.dev):
- `/sitemap.xml`, `/data/editions.json` also on API worker
- Production site should use Pages Functions paths above

**After deploy, verify:**
```bash
curl -A "facebookexternalhit/1.1" https://miataregistry.com/registry/{uuid}
curl https://miataregistry.com/sitemap.xml
curl https://miataregistry.com/data/editions.json
```

## Goals

1. **Rank** for registry, edition, and brand queries — not 27k individual car UUIDs.
2. **Share well** — correct title/description previews; brand `og:image` on all pages.
3. **Get cited accurately** by LLMs (Perplexity, ChatGPT, Google AI Overviews, etc.).
4. **Don't dilute quality** by indexing thin, near-duplicate unclaimed car stubs.

## Constraints (decided)

| Decision | Rationale |
|----------|-----------|
| Car URLs stay UUID (`/registry/{uuid}`) | Deduping 27k human-readable slugs is too hard |
| Brand `og:image` everywhere | `store.miataregistry.com/app/open-graph.jpg` — not owner car photos |
| Selective car indexing | ~4k claimed substantive profiles, not 27k stubs |
| News URLs stay UUID | No new articles in years; slug migration not worth it |
| `llms.txt` | Short file at `/llms.txt` ✅ |

## Out of scope (not doing)

- Human-readable car URL slugs
- News slug URLs
- Per-car `og:image` (user photos)
- 27k-entry sitemap (ungated)
- Full SSR / prerender of the React app
- `llms-full.txt`

## Current gaps

- **SPA shell** — crawlers and LLM bots get the same static `index.html` for every URL. Body is empty until JS runs.
- **Sitemap** — 7 static URLs; no indexable cars despite ~27k profiles in DB.
- **Registry table** — car rows use `onClick` + `navigate()`, not `<a href>`. Weak internal discovery.
- **Edition facts** — richest dataset loads via JS API; invisible to non-JS crawlers.
- **About stats** — loaded via `fetch`; invisible to non-JS crawlers.
- **Soft 404s** — all routes return HTTP 200.
- **Heading hygiene** — car page uses `h2` not `h1`; registry has no `h1`; home has duplicate `h1`.
- **Moderation** — indexable; should be `noindex`.
- **No JSON-LD** — missing structured data for rich results and entity signals.
- **Registry pagination** — no `rel="prev"` / `rel="next"`.
- **Render-blocking fonts** — Google Fonts + Font Awesome in `<head>`.

---

## Indexing policy

### Always index

- `/`
- `/registry`
- `/registry/editions`
- `/news` (+ individual articles)
- `/rarity`
- `/about`
- `/legal`

### Index cars selectively

```
index if: claimed AND (has car photo OR has story OR has owner history)
else:     noindex, follow
```

~4k pages, not 27k. Unclaimed edition-template stubs are near-duplicate content.

### Always noindex

- `/moderation`
- Registry pagination (`?page=N`) and filter URLs (`?filter=...`) — canonical to `/registry` with `noindex` on non-default views

---

## Social / preview meta

Per-page variation is **title + description only**:

- Car: `1991 Special Edition #182 – Miata Registry` + edition description first line
- News: article title + excerpt
- Static pages: existing `usePageMeta` copy

`og:image` and `twitter:image` stay the brand image on every page. Bot injection must not override image tags.

---

## Phase 1 — Frontend

| # | Task |
|---|------|
| 1.1 | Extend `usePageMeta` with `noindex` prop |
| 1.2 | Car page indexing gate: `claimed AND (photo OR story OR owner history)` |
| 1.3 | Registry table `<Link>` on edition name / primary cell |
| 1.4 | `noindex` on `/moderation` |
| 1.5 | Heading fixes: car title → `h1`; registry browse → `h1`; demote duplicate home `h1` |
| 1.6 | Clean `index.html` meta: remove `keywords`, `revisit-after`, duplicate `og:type` |
| 1.7 | Registry pagination/filter views: `noindex` + canonical to `/registry` |
| 1.8 | `rel="prev"` / `rel="next"` on registry pagination via `usePageMeta` |

**Done:** `public/llms.txt`

---

## Phase 2 — Worker / static assets

Depends on Phase 1 indexing gate so bot injection respects `noindex`.

### 2.1 Bot HTML injection

Cloudflare Worker or Pages Function detects preview/search bots (`Googlebot`, `facebookexternalhit`, `Twitterbot`, `Slackbot`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.).

For matching requests, fetch record from D1 and inject into `index.html` before returning:

**Meta (all bot-targeted pages):**
- `<title>`, `meta[name=description]`
- `og:title`, `og:description`, `og:url`
- `twitter:title`, `twitter:description`, `twitter:url`
- `link[rel=canonical]`
- `meta[name=robots]` when `noindex`

Do **not** change `og:image` / `twitter:image`.

**Factual HTML content:**

| Route | Inject |
|-------|--------|
| `/registry/{uuid}` | Edition name, year, sequence, production total, color, rarity score, claimed status |
| `/registry/editions` | Edition list as plain text or `<table>` |
| `/rarity` | Scoring methodology summary |
| `/about` | Live stats (cars, claimed, editions, countries) |

Use `<article id="bot-content">` or `<noscript>`. Answer engines need extractable facts, not just meta tags.

### 2.2 Dynamic sitemap

Replace static `public/sitemap.xml` with worker route (KV-cached; regenerate on moderation approval or cron).

**Include:**
- All always-index pages
- Indexable cars only (same gate as 1.2)
- News articles

**`lastmod` sources:**

| Content | Field |
|---------|-------|
| Cars | `cars.updated_date` (set on owner-claim approval) |
| News | `news.publish_date` |
| Static pages | Deploy date or manual bump when copy changes |

Sitemap index when indexable cars exceed ~5k URLs.

### 2.3 `editions.json`

Machine-readable edition reference at `/data/editions.json`:

```json
[
  {
    "year": 1991,
    "name": "Special Edition",
    "generation": "NA",
    "color": "British Racing Green",
    "total_produced": 3999,
    "in_registry": 1234,
    "claimed": 890
  }
]
```

Generated from D1 on deploy or weekly cron. Linked from `llms.txt`.

### 2.4 `robots.txt` update

```
# LLM context: https://miataregistry.com/llms.txt
```

Keep `User-agent: *` open. Do not block GPTBot, Claude-Web, PerplexityBot, etc. Only `Disallow: /claim/`.

### 2.5 Real HTTP 404s

Invalid car UUIDs and unknown routes return HTTP 404 for bots (and users where appropriate). SPA soft-404 problem goes away for crawlers.

---

## Phase 3 — Content & markup

| # | Task |
|---|------|
| 3.1 | FAQ section on `/about` — 3–5 Q&A blocks in plain prose |
| 3.2 | Semantic HTML: `<time datetime>` on dates; `<dl>` for edition specs; real `<table>` on rarity scoring |
| 3.3 | Edition card descriptions in DOM — surface `edition.description` where available |
| 3.4 | JSON-LD: `Organization` + `WebSite` site-wide; `Vehicle` on indexable cars; `NewsArticle` on news |
| 3.5 | Self-host fonts or add `font-display: swap`; defer Font Awesome |

---

## Implementation order

```
✅ llms.txt
Phase 1  →  usePageMeta, indexing gate, registry links, headings, meta cleanup, pagination rel/noindex
Phase 2a →  bot meta + factual HTML injection
Phase 2b →  editions.json
Phase 2c →  dynamic gated sitemap with lastmod
Phase 2d →  real HTTP 404s
Phase 3  →  FAQ, semantic markup, JSON-LD, font perf
```

Phase 1 can ship independently. Phase 2a unblocks social previews and AEO extraction. Remaining phases follow in order.

---

## Success signals

| Signal | How to check |
|--------|--------------|
| Social previews | Share a claimed car URL in iMessage/Slack — edition-specific title, brand OG image |
| Bot HTML | `curl -A "facebookexternalhit/1.1" https://miataregistry.com/registry/{uuid}` — car facts in HTML, not empty `<div id="root">` |
| Sitemap | `/sitemap.xml` lists static pages + indexable cars with correct `lastmod` |
| LLM citation | Ask Perplexity "how many limited edition Miatas are in the Miata Registry?" — cites miataregistry.com |
| Index coverage | Google Search Console: indexed pages ~hundreds/low thousands, not 27k thin duplicates |
| 404s | `curl -I https://miataregistry.com/registry/00000000-0000-0000-0000-000000000000` → 404 |
| Rich results | Google Rich Results Test passes on indexable car + news pages |

---

## Files touched

| File | Phase |
|------|-------|
| `public/llms.txt` | ✅ |
| `src/hooks/usePageMeta.ts` | 1 |
| `src/pages/Car.tsx` | 1, 3 |
| `src/components/registry/RegistryTable.tsx` | 1 |
| `src/pages/Registry.tsx` | 1 |
| `src/pages/Moderation.tsx` | 1 |
| `src/pages/Home.tsx` | 1 |
| `index.html` | 1, 3 |
| `src/worker/` (bot, sitemap, editions, 404 routes) | 2 |
| `public/robots.txt` | 2 |
| `public/sitemap.xml` | 2 (replaced by worker) |
| `public/data/editions.json` | 2 (generated) |
| `src/pages/About.tsx` | 3 |
| `src/pages/Rarity.tsx` | 3 |
| `src/pages/NewsArticle.tsx` | 3 |
| `src/components/edition/Card.tsx` | 3 |
| `src/components/registry/PaginationControls.tsx` | 1 |
