# Fysi

A marketplace for certified eco-friendly products in Nigeria, with every payment settled in USDC on the Stellar
network. Verified vendors sell and get a custodial Stellar wallet; customers browse and fill a cart without an account,
then pay by their own wallet, a Fysi wallet, QR code or payment link; admins verify vendors and monitor payments.
Product requirements: [Fysi Marketplace MVP on Stellar — PRD](docs/fysi-prd.pdf).

Turborepo + pnpm monorepo:

| Path | What | Dev URL |
|---|---|---|
| `apps/web` | Storefront: home, catalogue, search, product, cart, checkout, customer account and wallet | http://localhost:3000 |
| `apps/vendor` | Seller centre: onboarding and verification, listings, orders, wallet and withdrawals | http://localhost:3001 |
| `apps/admin` | Admin console: vendor verification, dashboard, activity log, transactions, moderation, users | http://localhost:3002 |
| `packages/ui` | `@repo/ui`: design tokens, shadcn components, motion | — |
| `packages/eslint-config`, `packages/typescript-config` | Shared configs | — |

## Getting started

Requires Node ≥ 22 and pnpm 12 (`corepack enable` picks the version from `package.json`).

```bash
pnpm install
pnpm dev               # all three apps
pnpm --filter web dev  # one app
```

The backend is external (separate repo). Copy each app's `.env.example` to `.env.local` and set `API_PROXY_TARGET`
to the API's base URL.

```bash
pnpm check-types
pnpm lint
pnpm build
pnpm format
```

Conventions and data flow: [CLAUDE.md](CLAUDE.md). Requirement → route map, status and open questions:
[docs/PLAN.md](docs/PLAN.md).
