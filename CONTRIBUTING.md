# Contributing to the Miata Registry

Thanks for your interest in contributing. This guide covers how to get involved, how the codebase is organized, and what we expect from contributions.

For setup, stack, and deployment details, see [README.md](README.md).

## Ways to contribute

### Bug reports

Open a [GitHub issue](https://github.com/mcongrove/miata-registry/issues) or email support@miataregistry.com. Include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots, if helpful
- Browser and OS

### Feature requests

Use the issue tracker. Describe the feature, who it helps, and any implementation ideas you have. Discussion before a large PR saves everyone time.

### Documentation

README improvements, clarifications, and typo fixes are welcome. Keep docs accurate to how the project actually works.

### Code

Bug fixes, UI polish, and well-scoped features are all fair game. If you're unsure whether something fits, open an issue first.

## Development setup

1. Fork and clone the repo
2. `npm install`
3. Add `.dev.vars` and `.env` (reach out to a maintainer for values)
4. Run both processes locally:

    ```bash
    npm run dev
    npm run worker:dev
    ```

**Important:** local `worker:dev` uses the production D1, KV, and R2 bindings. Don't run destructive tests or schema experiments against prod.

## Project structure

```
src/
├── pages/           # Route-level page components
├── components/      # Shared UI (forms, registry, car, etc.)
├── modals/          # Modal dialogs
├── context/         # React context providers
├── hooks/           # Custom hooks
├── types/           # Shared TypeScript types
├── utils/           # Frontend utilities
├── db/
│   └── schema/      # Drizzle table definitions
├── worker/
│   ├── routes/      # Hono API route handlers
│   ├── middleware/  # Auth, Clerk integration
│   └── webhooks/    # Incoming webhooks
└── emails/          # react-email templates
```

- **Frontend** talks to the worker via `VITE_CLOUDFLARE_WORKER_URL`
- **API routes** live under `src/worker/routes/` and are mounted in `src/worker/index.ts`
- **Database schema** changes start in `src/db/schema/`

## Code style

Run these before opening a PR:

```bash
npm run lint
npm run format
npm run build
```

### Formatting

Prettier config (`.prettierrc`): tabs, single quotes, semicolons, trailing commas (ES5).

### TypeScript / React

- TypeScript throughout; avoid `any` unless there's a good reason
- Functional components with hooks
- Lazy-load page components (see `App.tsx`)
- Tailwind CSS for styling — no separate CSS files for components
- `react-router-dom` for routing
- Prefix unused variables/args with `_` to satisfy ESLint

### License header

New `.ts` and `.tsx` files must include the AGPL-3.0 header block at the top. Copy it from any existing file in `src/`.

### Comments

Don't add section-divider comments (`// --- handlers ---`). Only comment non-obvious business logic.

### Terminology

When referring to registry cars in user-facing copy or docs:

- **limited edition** — not "special edition"
- **edition** — not "model" (e.g. "M Edition", not "M model")
- **brg** — use the project's `brg` color tokens; don't use `gray` Tailwind classes for UI colors

## Database changes

Schema lives in `src/db/schema/`. After editing:

```bash
npm run db:generate   # create migration in migrations/
npm run db:push       # apply to remote D1
```

Coordinate schema changes with a maintainer — `db:push` targets production. Include migration files in your PR.

## Email templates

Templates are in `src/emails/`. Preview locally:

```bash
npm run email:dev
```

Worker-side rendering uses `@react-email/render` via `src/worker/utils/renderEmail.ts`.

## Pull requests

1. Branch from `main` with a descriptive name (`fix/registry-pagination`, `feat/edition-filter`)
2. Keep PRs focused — one concern per PR when possible
3. Run `lint`, `format`, and `build` locally
4. Describe what changed and why in the PR body
5. Link any related issues

### What happens after merge

- **API worker** — auto-deploys via GitHub Actions on push to `main`
- **Web frontend** — deployed separately via the Cloudflare dashboard (not automated in CI)

Maintainers handle frontend deploys after worker changes land.

## License

By contributing, you agree that your contributions will be licensed under the [GNU Affero General Public License v3.0](LICENSE), same as the rest of the project.
