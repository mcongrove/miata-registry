# Cypress E2E Tests (disabled)

Cypress tests are **not currently run**. The specs, support file, and config files are kept in the repo in case we want to bring them back.

## Why they're off

- Tests were flaky in CI (timing, auth, live data).
- The app is stable enough that post-deploy E2E wasn't worth the maintenance.
- Running Cypress Cloud on every deploy added cost without enough signal.

Disabled in two places:

1. **CI** — removed from `.github/workflows/deploy.yml` (June 2026). Previously ran against production after deploy with Cypress Cloud recording.
2. **Local tooling** — `cypress`, `@testing-library/cypress`, `cypress-real-events`, and `start-server-and-test` were removed from `package.json` during the React 19 upgrade.

## What's here

| File | Purpose |
|------|---------|
| `e2e/*.cy.ts` | Specs for home, header, footer, about, news, article, editions, car, forms |
| `support/e2e.ts` | Testing Library commands, real-events, network error logging |
| `cypress.config.js` | Production (`https://miataregistry.com`) |
| `cypress.config.dev.js` | Local dev (`localhost:5173` + worker on `8787`) |

Cypress project ID: `ygesqc`

## Re-enabling locally

```bash
npm i -D cypress @testing-library/cypress cypress-real-events start-server-and-test
```

Add scripts back to `package.json`:

```json
"cypress:open": "cypress open",
"cypress:run": "cypress run",
"cypress:open:dev": "cypress open --config-file cypress.config.dev.js",
"cypress:run:dev": "cypress run --config-file cypress.config.dev.js",
"test:e2e": "start-server-and-test 'npm run dev' http://localhost:5173 'npm run worker:dev' http://localhost:8787 'cypress open --config-file cypress.config.dev.js'",
"test:e2e:headless": "start-server-and-test 'npm run dev' http://localhost:5173 'npm run worker:dev' http://localhost:8787 'cypress run --config-file cypress.config.dev.js'"
```

Then run against local stack (`npm run test:e2e`) or production (`npx cypress run --config-file cypress.config.js`).

## Re-enabling in CI

After restoring the npm deps, add post-deploy steps to `.github/workflows/deploy.yml`:

- Wait ~2 minutes for the deploy to propagate
- `npx cypress run --config-file cypress.config.js --record --key ${{ secrets.CYPRESS_RECORD_KEY }}`
- Optional failure notification via Resend

Requires `CYPRESS_RECORD_KEY` (and optionally `RESEND_API_KEY`) in GitHub secrets.
