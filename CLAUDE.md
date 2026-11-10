# Fysi

Two-sided marketplace for certified eco-friendly products in Nigeria (customers, vendors, admins), with every payment
settled in USDC on Stellar. PRD: `docs/fysi-prd.pdf` ("Fysi Marketplace MVP on Stellar", Nov 2026; read it with
`pdftotext -layout docs/fysi-prd.pdf -`). It replaces the old Greenhouse PRD artifact completely. **Requirement → route
map, status and open questions: `docs/PLAN.md`.** The repo folder and storage keys still say "greenhouse"; the product
is Fysi. Structure mirrors https://github.com/usestellance/stellance-v3; when in doubt about a convention,
check how stellance did it.

## Monorepo

Turborepo + pnpm 12 (`packageManager`), Node ≥ 22.

```
apps/web/          (:3000) storefront: (shop) pages, /account, /checkout, /auth. Public and indexable.
apps/vendor/       (:3001/vendor) seller centre: /sign-in, /sign-up, /onboarding, /pending, (console) pages
apps/admin/        (:3002/admin) admin console: /sign-in, (console) pages (admins only)
packages/ui/       @repo/ui — design tokens, shadcn components, motion, PagePlaceholder
packages/eslint-config, packages/typescript-config
```

`pnpm dev` (all) · `pnpm build` · `pnpm check-types` · `pnpm lint` (UI package: `--max-warnings 0`)
· `pnpm format` (prettier: tabs, width 130).

Deployment: one Vercel project with services (root `vercel.json`): `web` at the domain root, `vendor` under `/vendor`,
`admin` under `/admin`. Vendor and admin set that prefix as Next `basePath` (`next.config.ts`), locally too, so dev URLs
are http://localhost:3001/vendor and http://localhost:3002/admin. Links, redirects and `/_next` get it automatically;
plain paths to `public/` files (incl. next/image `src`) must use `asset()` from `lib/site.ts`, and the API proxy is
`<basePath>/api/v1`. `NEXT_PUBLIC_SITE_URL` is the shared domain origin (previews use the deployment URL); cross-app
links (`VENDOR_URL`, `STORE_URL`) derive from it, or `NEXT_PUBLIC_VENDOR_URL` / `NEXT_PUBLIC_STORE_URL` override. The apps
never call each other server-side (only the external API), so the services have no bindings.

## Stack

Next.js 16 (App Router, React Compiler, Turbopack), React 19, Tailwind v4, shadcn/ui (Radix) in `@repo/ui`, TanStack
Query, zustand, react-hook-form + zod 4, axios, lucide, sonner toasts, recharts 2 (vendor analytics, admin reports).

## Data

- **The backend is external** (separate repo). Do not add a backend, API routes or a mock server here: this repo is
  frontend only. One agreed exception, temporary: `apps/web/src/lib/api/mock.ts` fakes customer auth, the catalogue
  (sample products in `mock-catalog.ts`, photos in `public/images/products`) and the newsletter in the browser when
  `NEXT_PUBLIC_MOCK_API=1` (demo@fysi.ng / Password1, code 1234). The vendor app has the same switch:
  `apps/vendor/src/lib/api/mock.ts` fakes sign in/up, the shop and onboarding (new@fysi.ng and vendor@fysi.ng, both
  Password1). The admin app too: `apps/admin/src/lib/api/mock.ts` fakes sign in (admin@fysi.ng / Password1), the
  Overview dashboard, products (list, New Category, Add Product), orders and customers (lists, details, export, delete,
  blacklist). Delete them once the API is connected.
- The browser calls `/api/v1/*` on its own origin, rewritten in each app's `next.config.ts` to `API_PROXY_TARGET` (the
  external API's base URL). `NEXT_PUBLIC_API_URL` forces direct calls.
- API paths (`backendRoutes` in `lib/routes.ts`) and shapes (`features/*/types.ts`) are placeholders until matched to the
  external API's contract (docs/PLAN.md). Assumed envelope: `{ status_code, message, data }`; errors `{ message }`.
  Prices are whole naira.
- One client per app: `lib/api/client.ts` (`api`, `getData`, `errorMessage`) adds the session token and signs out on 401.
- Sessions: zustand `persist` per app (`greenhouse-session`, `greenhouse-vendor-session`, `greenhouse-admin-session`).
  Guards: web `RequireAuth` (/account, /checkout; returns via `?next=`), vendor `RequireVendor` + `ShopGate`
  (no shop → /onboarding; not approved → /pending), admin `RequireAdmin` (sign-in refuses non-admin roles).
- Cart (`apps/web/src/features/cart/store.ts`) lives in the browser and works signed out; the API reprices at checkout.
- Mutations never auto-retry (`retry: false`): a retried order or payment could go through twice.

## Domain rules

- Trust is the product. Badges ("Certified" for recognised labels, "Fysi Reviewed" for evidence-based review; today
  the code has one `eco_verified` flag) and `sustainability_score` come from admin-verified data only; the client never
  infers them. Show them the same way everywhere.
- A vendor sells only after admin approval; customers only see active products from approved shops.
- Payments: USDC on Stellar only (external wallet, Fysi custodial wallet + PIN, SEP-7 QR, payment link). Prices are set
  in naira and show the USDC equivalent; the USDC quote locks for 15 minutes. The API builds every transaction and
  matches it by memo; the client never builds amounts, memos or destinations itself, and never handles private keys.
  Show the transaction hash with a Stellar explorer link (testnet vs public network) for every payment and payout.
- Out of MVP scope: card/bank checkout, discount codes, reviews, wishlist, messaging, promotions, courier booking. Don't
  build new screens for them; existing ones stay hidden until decided (docs/PLAN.md).
- Never retry a payment or order submit automatically.

## Design system (`packages/ui`)

Tokens in `src/styles/globals.css`: `primary-50…900` (Forest Green), `grey-50…900`, `lime-50…900` (Lime Yellow accent),
plus `success-*`, `error-*`, `warning-*`, `info-*`, and `swatch-red|black|brown|green` (product colour filter). **The hex values are placeholders until the Figma style guide is
applied.** Use tokens, never hex. Font: DM Sans via `next/font/google` in each root layout (`--font-dm-sans` → `font-sans`).
Shared classes: `shop-container` (storefront), `custom-container` (dashboards), `h2-auth`, `h2-app`, `hide-scroll`.
Motion (all off for reduced motion): `.animate-rise` (stagger with `style={{ "--i": n }}`), `.animate-page` (every
`template.tsx`), `.animate-pop` (key it on a value to replay, e.g. the cart count), `.animate-reveal` (hidden until it
scrolls into view, then rises in: `RevealObserver` in the web root layout adds `.is-visible`; only hides when `html.js`
is set; stagger with `--i`), `.animate-float` (404 face, FAQ bag), `.animate-zoom` (big
photos settle from a slight zoom; inside overflow-hidden), `.animate-slide` (a new step; key it on the step),
`.hover-lift` (cards; pointer
devices only). Buttons press in slightly (`active:scale`). These are plain classes: no `lg:`/`hover:` prefixes.

Import as `@repo/ui/<file>` (`@repo/ui/button`, `@repo/ui/form`, `@repo/ui/lib/utils`). New shadcn components go in
`packages/ui/src` (`components.json` there). Toasts go through `useToast()` (`lib/use-toast.ts`).

`<PagePlaceholder>` marks a screen not built yet, with its PRD requirement ids. Replace it when building the screen.

## Conventions

- Feature folders: `src/features/<domain>/{hooks.ts, components/, store.ts, schema.ts, types.ts}`. `src/app/**` pages
  stay thin; layout pieces live in `src/components/layouts` (web) or `src/components` (vendor, admin).
- URLs come from `lib/routes.ts` (pages and `backendRoutes`), never hand-built strings.
- Imports use `@/…` inside an app and `@repo/ui/…` for shared UI.
- Named exports for components; route files keep default exports.
- Every `<form>` using `form.handleSubmit` needs `noValidate`.
- A component using `useSearchParams` needs a `<Suspense>` boundary above it.
- Persisted zustand stores differ between server and client: gate what they render on hydration
  (`useSyncExternalStore` + `persist.hasHydrated()`, as in `StoreHeader` and the guards).
- Never `setState` synchronously in `useEffect`, and never read `ref.current` during render.
- Flex children that hold tables or long text need `min-w-0`.
- Nested and route-group layouts type `children` as `React.ReactNode`; route params are Promises.

## Landmines

1. pnpm strict linking: a package imported in a file must be a dependency of _that_ workspace package. `next/*` imports
   stay in the apps, never in `@repo/ui`.
2. Restart the dev server after `pnpm install`.
3. New dependency with build scripts → list it under `allowBuilds` in `pnpm-workspace.yaml`.
4. Never run `next build` into `.next` while `pnpm dev` runs. Use `NEXT_DIST_DIR=.next-verify npx next build`.
5. Next 16 error boundaries get `retry()` (not `reset()`).
6. Keep all `@radix-ui/*` packages on the same release; `recharts` stays on 2.x (shadcn `chart.tsx`).
