# Implementation Summary — 2026-11-20

## Completed

- Added API coverage for menu create, edit, and delete; customer order placement; admin order-status changes; and customer-token rejection on admin-only routes.
- Replaced client-trusted payment confirmation with server-side Paystack transaction verification, matching the stored reference, amount, and order metadata.
- Added a Paystack webhook endpoint with raw-body HMAC signature validation and idempotent handling of successful charges. Verification and webhook tests use JSON fixtures and cover invalid or mismatched payments.
- Added three Chromium Playwright flows: customer checkout using Paystack's test card, admin menu editing, and moving an order from processing through delivery to delivered.
- Added CI and documentation support for the Playwright suite.

## Run lint, tests, and builds

From the repository root, install dependencies and the Playwright browser:

```powershell
npm ci
npm ci --prefix backend
npm ci --prefix frontend
npm ci --prefix admin
npx playwright install chromium
```

Run the same validation command used in GitHub Actions:

```powershell
$env:PAYSTACK_E2E_SECRET_KEY = "sk_test_..."
npm run check
```

`npm run check` runs frontend/admin lint, backend and frontend tests, Playwright
E2E tests, and frontend/admin builds. The customer checkout E2E requires a
Paystack **test-mode** secret and is skipped when `PAYSTACK_E2E_SECRET_KEY` is
unset. The admin browser tests use API fixtures; the checkout test creates a
real Paystack test transaction, while the restaurant API responses around the
browser flow are mocked. The frontend and admin lint checks are clean. Without
the test-mode key, the checkout flow is skipped while the remaining checks run.

To run only the test suites, use `npm run test:all`.
