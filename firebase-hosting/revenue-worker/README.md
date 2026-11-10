# Private Klaviyo reporting on Workers Free

Firebase Spark continues to serve JimDesigns and its existing account login. This Worker performs the secret-bearing Klaviyo calls. Nothing in this directory is served by Firebase Hosting.

## Current state

Published Worker: `https://jimdesigns-revenue.revenue-worker.workers.dev/revenue`. Firebase Hosting has the exact origin in its private-page CSP and browser configuration. A dedicated read-only Klaviyo reporting key is installed as a Worker secret, with Shopify Placed Order metric `ShpU4z` and welcome flow `UxqPvf` (Added to E-maillijst).

Real October 1–31, 2026 flow values were compared against Klaviyo's Flows UI using Shopify Placed Order: welcome €1,678.24 and browse abandonment €33.45 matched to the cent. The API also returned eight campaign message rows. Private reconciliation files stay outside Git. Recent results can still change due to attribution. Final end-to-end production verification through the actual private Firebase login remains to be completed.

## Deploy

1. Use the owner's Cloudflare account on **Workers Free**; do not enable paid Workers, R2, or Firebase Blaze. Authenticate the official Wrangler CLI.
2. In this directory run `npx wrangler@4 deploy`. Store `KLAVIYO_REPORTING_KEY` using `npx wrangler@4 secret put KLAVIYO_REPORTING_KEY`. Enter it privately, never commit it. Required read scopes: accounts, metrics, campaigns, flows.
3. If multiple Shopify Placed Order metrics exist, set `KLAVIYO_ORDER_METRIC_ID` explicitly. Set `KLAVIYO_WELCOME_FLOW_IDS` to the comma-separated IDs of all welcome-flow versions; the dashboard also allows manual selection. Do not infer flow type from its name.
4. Put the exact deployed HTTPS `/revenue` URL in `free/src/revenue/config.json`. Add only that exact origin to the `/notas/**` CSP `connect-src` in `firebase.json`. Build and deploy Firebase Hosting only.
5. Check `/revenue` without authentication returns 401/no-store. Sign in with the existing private JimDesigns account. Confirm fresh and cached reports, expired sessions, and all pages. Never publish a public financial endpoint or disable authentication to test it.

## Accuracy

Uses Klaviyo campaign/flow values reports with the same conversion metric, email channel and account time zone. Date ranges include the last second of the final day (the API rounds an end instant up to the current hour). Long ranges split into contiguous blocks under a year. Every message and result page must load before displaying any total; duplicate or missing message data causes a visible error. Welcome exclusions remove the selected actual flow IDs without reallocating attribution. Currency is the account's configured currency. These are attributed values based on send date, not net sales or profit.

Before calling actual revenue verified, reconcile a closed historical period against Klaviyo's campaign and flow performance reports using identical metric, channel, time zone and attribution settings. Verify welcome flows individually, including archived versions. Record actual compared values privately, outside Git. Recent results can change with later attribution; the private report cache lasts at most 15 minutes. An error never becomes a zero or partial total.

## Security and limits

Every request verifies Google's RS256 Firebase JWT signature, project issuer/audience, immutable owner UID, expiry and eight-hour authentication limit, then checks the existing Firestore session heartbeat (30 minutes). The browser's App Check token is forwarded to Firestore. Checks run before private cache access. CORS allows only JimDesigns origins. API links cannot forward credentials to other origins. Klaviyo response bodies and keys are never exposed in errors. Logs are disabled. List pagination is bounded to stay inside the free Worker subrequest budget; unsupported oversized accounts fail visibly rather than showing incomplete data.

Free Workers has daily request/CPU limits. On exhaustion the service stops working until quota resets; it does not require enabling billing. Check the actual Cloudflare account remains on Free before deployment.

Sources: [Klaviyo reporting](https://developers.klaviyo.com/en/reference/reporting_api_overview), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

Tests: from `firebase-hosting/`, start Firebase auth/Firestore emulators and run `npm test --prefix free`. `free/tests/revenue.test.mjs` uses signed synthetic JWTs and isolated upstream fixtures; no private data or real API key is involved.
