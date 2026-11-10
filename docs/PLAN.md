# Fysi — build plan

Source: **[docs/fysi-prd.pdf](fysi-prd.pdf)**, "Fysi Marketplace MVP on Stellar — Product Requirements Document"
(Nov 6, 2026). It replaces the earlier Greenhouse PRD (claude.ai artifact) completely: requirement ids below are the new
PRD's. Read it as text with `pdftotext -layout docs/fysi-prd.pdf -`.

This file maps every requirement to where it lives in the code and tracks status. Update the Status column as screens
are built.

Status: **Built** = real UI matching the PRD; **Rework** = built, but the new PRD changes it; **Data** = typed hooks
ready, no UI; **Scaffold** = route exists with `<PagePlaceholder>`; **Not started** = no route yet; **Backend** = no
frontend work.

## The MVP in one paragraph

A marketplace for certified eco-friendly products, every payment settled in **USDC on Stellar** (testnet for build,
mainnet for launch). Prices are set and shown in naira, with the USDC equivalent. Vendors sign up, pass business
verification, get a **custodial Stellar wallet** created by Fysi on approval, list products and fulfil orders.
Customers browse and fill a cart without an account, then sign up or log in to pay by **external wallet, Fysi wallet
(PIN), QR code or payment link**. Admins verify vendors and monitor activity and transactions. The loop to prove: a
verified vendor lists a product, a customer pays on Stellar, the vendor's wallet is credited within seconds.

**Out of scope for the MVP:** card or bank-transfer checkout, marketing tools, promotions, discount codes, reviews,
wishlist, messaging, in-app courier booking (vendors ship themselves and add tracking), advanced analytics, native apps,
automatic on-chain refunds (refunds are manual).

Launch categories (6): clothing, household items, beauty and personal care, eco-friendly gadgets, office supplies,
outdoor and travel.

## Vendor (seller centre, `apps/vendor`)

| ID | Requirement | Route(s) | Code | Status |
|---|---|---|---|---|
| V1 | Sign up with email and password; verify email | `/sign-up`, `/sign-in` | `features/auth`, `features/shop` | Built: Figma "Set up your shop" (country, e-mail, code, personal information). Sign-in unstyled |
| V2 | Onboarding wizard: business name, address, phone, category, ID / CAC registration, sustainability certificate upload | `/sign-up` (shop step), `/onboarding` | `SellerSetupWizard` | **Rework**: built with account type, shop name, shipping zone, referral, CAC ID + certificate. Missing: business address, category, sustainability certificate; KYB also wants director NIN or BVN. Shipping zone and referral are not in the PRD |
| V3 | "Pending verification" until admin approves; vendor sees status and rejection reasons | `/pending`, `ShopGate` | `features/shop` | **Rework**: gate built, page unstyled; add rejection reason and "fix and resubmit" |
| V4 | On approval a custodial wallet is created (USDC trustline, no seed phrase) | — | — | Backend (the wallet view shows it) |
| V5 | Wallet: available balance, pending (escrow) balance, incoming payment per order, history with explorer links | `/wallet` (new) | — | Not started |
| V6 | Withdraw USDC to an external Stellar address, or cash out to a Nigerian bank via an anchor (bank from the pilot) | `/wallet` (new) | — | Not started. Needs password + e-mail/SMS OTP; daily limits |
| V7 | Create, edit, hide, delete products: title, photos, description, price in NGN, stock, category, certification tag | `/products`, `/products/new`, `/products/[productId]` | `features/products` | `/products` built from Figma "Manage Products": four totals, All Products count, search (name or SKU), Select dates, status filter, sortable Name / Seller SKU / Quantity, pages, Export; status pill In Stock / Out of stock / Inactive (hidden by you) / Hidden by Fysi (with the admin's reason); tick rows to Hide from store / Show in store; delete with confirm. `/products/new` built from Figma "Add Products" (the admin Add Product form, reused): Certifications is a list of the shop's own certificates (verified or awaiting review; only verified ones give the eco badge), Warranty Type is Repair by Vendor / Replacement by Vendor / Service Centres; the header's Add Product submits the form, Export downloads the list. `POST /vendor/products` (multipart, as the admin's, plus `certification_id`); `GET /categories`; `GET /vendor/certifications` → `[{ id, name, badge, status }]`. Edit not built yet |
| V8 | Orders with status Paid, Processing, Shipped, Delivered, Cancelled; vendor adds tracking number | `/orders`, `/orders/[orderId]` | `features/orders` | `/orders` built from Figma: tabs All (count) / Shipped / Cancelled / Delivery Failed / Returned, search (ID or product), dates, status filter, Product sort, ⋮ View / Track Order / Update status (no delete: orders are paid), pages, Export, **Track Orders** (links to `/orders/track`). `/orders/track` built from Figma "Track Orders": tabs Tracking (look up by courier tracking number or order ID → Package Status: Order Placed, Pending Confirmation, Waiting to be shipped, Shipped, Delivered with dates; cancelled / failed / returned end in a red step; "Oops, No Shipping yet" when nothing matches or nothing has shipped), Active (paid, processing, shipped, delivery failed) and My Shipping (shipped, delivered, failed, returned; courier and tracking number); `GET /vendor/orders/track?q=` → the order detail or 404; rows carry `shipment: { courier, tracking_number } | null`. Sidebar Orders: All Orders, Track Orders. Order Details dialog (`?order=`, `&section=tracking|update`) from Figma plus PRD: status pill, tracking number and courier, cancel reason, Stellar transaction hash with a Stellar Expert link, Fysi commission (5%, "Waived" at 0%), You receive, payout status (held in escrow / released / refunded). **Update status** inside the dialog: Paid → Processing or Cancel; Processing → Shipped (courier + tracking number required) or Cancel; Shipped → Delivered or Delivery failed; Delivery failed → Shipped again or Cancel; cancelling needs a reason (Fysi refunds). `/orders/:id` redirects to the dialog. Statuses add the Figma's Delivery Failed and Returned to V8's five. `GET /vendor/orders` (`tab, search, from, to, status, sort, page, limit` → rows with `first_item, other_items, items_count`), `GET /vendor/orders/:id` (`features/orders/types.ts` `OrderDetail`), `POST /vendor/orders/:id/status { status, courier?, tracking_number?, reason? }`, `GET /vendor/orders/export` |
| V9 | E-mail on each paid order | — | — | Backend |

**Vendor Hub shell and Dashboard** (built from Figma): "Fysi Vendor Hub" sidebar with fold-out groups (Products: Manage /
Add; Orders; Discounts & Promotions; Account Statements; Settings; Help), top bar, `/` Dashboard (welcome with the shop
name and today's date; Total Revenue, Product SKUs, Avg. Order Value, Balance; Sales Report; Active Customers ring;
Recent Orders). Changes from Figma: naira not dollars; Sales Report plots Revenue vs Payouts (both naira; the design put
a count and money on one axis); "Pay on Delivery" and "Pending" replaced by the Stellar methods and V8 statuses.
"Account Statements" (`/statements`) is where the wallet (V5, V6) goes. `GET /vendor/dashboard`: `{ totals: { revenue,
skus, avg_order_value, balance, *_change }, sales_by_month: [{ month, revenue, payouts }], active_customers (0–100,
ordered in the last 90 days), recent_orders }`. `GET /vendor/products`: `search, state (in_stock,out_of_stock,inactive,
hidden_by_fysi), from, to, sort (name|sku|quantity _asc|_desc), page, limit` → `{ items: [{ id, name, variants_count,
sku, price, category, quantity, status (active|inactive), moderation: { reason, at } | null, image_url, created_at }],
meta }`; `GET /vendor/products/stats`; `GET /vendor/products/export`; `PATCH /vendor/products/:id { status }`;
`DELETE /vendor/products/:id`.

**Account Statements** (`/statements`, built from Figma; PRD V5): tabs All (count) / Open / Paid / Unpaid, amounts in USDC or NGN (the Figma's "USD" reads USDC: the wallet asset), table Period / Transaction ID / Status / Payout / View Details. View Details (Figma "Details"): the period, reference and status, Opening Balance, each line (sale per order, refund, Fysi commission; sales still in escrow are marked), CLOSING BALANCE and PAYOUT (what reached the wallet: zero until paid), then the payout transaction with a Stellar Expert link. `payout` in the list means the same. Export Transactions asks for a file built in the background; Transaction Exports lists it (Preparing… → Ready → Download CSV), checking back every 3 s while one is preparing. Open = period still running; Unpaid = closed, money in escrow; Paid = in the wallet. `GET /vendor/statements` (`status, page, limit` → `{ id, reference, period_start, period_end, status, payout: { ngn, usdc } }`), `GET /vendor/statements/:id` (adds `opening_balance`, `closing_balance`, `entries: { id, at, kind: sale|refund|commission, description, amount (signed), order }[]`, gross/commission/refunds, `payout_tx`), `GET|POST /vendor/statements/exports` (`{ currency }`), `GET /vendor/statements/exports/:id/file`. Still to design: the wallet balance and Withdraw (V6).

**Promotion Management** (`/promotions`, built from Figma; outside the MVP): tabs All (count) / Open / Ongoing / Cancelled / Expired, search by name, discount-type filter, table Promotion (with product count) / Registration Window / Period / Discount Criteria (the rule, e.g. "15% off · orders over ₦5,000"; the Figma showed a date) / Status, ⋮ Monitor / Edit (open) / Cancel (open or ongoing, confirmed). `GET /vendor/promotions`, `POST /vendor/promotions/:id/cancel`. Create (`/promotions/new`) is a placeholder: no Figma; to design ourselves.

**Monitor Promotions** (`/promotions/monitor`, built from Figma): Export (ticked rows, or all that match), cards Total Sales from Promotions / Avg. Sales before campaign / Uplift (each with change on the previous period), tabs All (count) / Ongoing / Cancelled / Expired (Ongoing added: the Figma showed only the other two, and live promotions are the ones worth watching; open ones have no sales), table Product (with its promotion and status) / Seller SKU / Item Sold / Revenue / Period. `?promotion=` (Monitor from Promotion Management) narrows it to one promotion, shown as a removable chip. `GET /vendor/promotions/performance` (`promotion, status, page, limit` → `{ summary: { sales, sales_change, baseline, baseline_change, uplift, uplift_change }, promotion, items, meta }`), `GET /vendor/promotions/performance/export` (same filters or `ids`, CSV).

Vendor routes outside the MVP (keep as placeholders, out of the nav): `/analytics`, `/certification` (the certificate is
part of onboarding), `/inventory` (stock is on the product), `/messages`, `/shipping`, `/training`. `/promotions` is in
the Figma nav (Discounts & Promotions). `/settings` will hold profile, 2FA and payout details.

## Customer (storefront, `apps/web`)

| ID | Requirement | Route(s) | Code | Status |
|---|---|---|---|---|
| C1a | My Account overview | `/account` | `features/account` | **Built from Figma**: wide screens show the profile card (initials until avatars exist; View Profile → `/account/profile`), Billing Address with a pencil (edit dialog, same rules as checkout; `GET|PUT /profile/address`), Recent Orders History (latest 5, See all). Phones show the menu page "Welcome, <name>" (My Account → `/account/overview`: the same cards stacked, with a back link and Log Out, Figma phone "Account"; Order History, Inbox, Reviews, Wishlist; Settings and Log Out at the bottom); the sidebar is wide-screen only. Checkout doesn't prefill from the saved address yet |
| C11 | Inbox: order updates and notes from Fysi | `/account/inbox` | `features/inbox` | **Built from Figma** ("Messages" / phone "Inbox"): date, title and text, View Details → the order, product card for parcel updates; pages of 10. `GET /inbox` (`page, limit` → `{ id, created_at, kind, title, body, order, product }`). The mock makes messages from the sample orders (payment received with tx, shipped, delivered with the 7-day report window, cancelled/failed/returned with refund). The Figma's "Pending Reviews" note is left out (reviews are outside the MVP). No unread state in the design |
| C9a | Reviews to write (outside the MVP, built because Figma exists) | `/account/reviews` | `features/reviews` | **Built from Figma** ("Reviews (49)" / phone "Reviews"): each product of a delivered order not yet reviewed, with Order no (→ order) and Delivered on; "Rate this Product" opens the product page's review form (`LeaveReviewDialog` now takes `renderTrigger` and `onReviewed`), and the product drops off once sent. `GET /reviews/pending` (`page, limit` → `{ id, product, order, delivered_at }`) |
| C1b | Settings: personal info, photo, password | `/account/settings` (`/account/profile` redirects here) | `features/account` | **Built from Figma**: Personal info (first/last name, email, photo by click or drag and drop: SVG/PNG/JPG/GIF up to 5 MB, previewed, sent on Save changes; Cancel restores) and Password (current, new with the sign-up rule, confirm; show/hide). `PUT /profile` `{ first_name, last_name, email }`, `POST /profile/avatar` (multipart `photo`), `POST /auth/change-password` `{ current_password, new_password }`. User gains `avatar_url` (shown on My Account). Figma's "max. 800×400px" replaced by a size limit; changing email has no re-verification step yet (ask the API) |
| C10 | Wishlist (outside the MVP, built because Figma exists) | `/wishlist` (`/account/wishlist` redirects) | `features/wishlist` | **Built from Figma**: full width (no account menu), saved products with Add to Cart (opens the cart; Sold out when no stock) and Remove, then Recently Viewed; phones get a back link. The heart on product cards and the product page now saves/removes (filled when saved; signed-out → sign in). `GET /wishlist` → products, `POST /wishlist` `{ product_id }`, `DELETE /wishlist/:product_id` |
| C1 | Browse home, categories and product pages with no account | `/`, `/categories/[slug]`, `/collections/[slug]`, `/products/[slug]` | `features/home`, `features/catalog` | Built from Figma. **Rework**: 8 categories in `lib/navigation.ts` and the mock (kitchen, accessories; beauty and personal care split) vs the PRD's 6 |
| C2 | Search by keyword; filter by category and price | `/search` | `useProducts({ q, … })` | **Built** (no Figma): `/search` uses the category grid (`ProductListing` with `{ q }`): "All products" when empty (Shop Now, Browse products), "Results for “…”" from the header search box; Filter and Sort by as on category pages. Price filter not in the toolbar yet |
| C3 | Product page: vendor, verified badge, certification, price in NGN with USDC equivalent | `/products/[slug]` | `ProductDetailView` | **Rework**: built from Figma; add the vendor, the USDC equivalent, and the two badges ("Certified" / "Fysi Reviewed", see Decisions). Reviews section is out of scope |
| C4 | Guest cart (add, remove, quantity), saved in the browser, merged into the account at sign-up | `/cart`, cart drawer | `features/cart` | Built in the browser. Merge at sign-up not started (needs an API cart) |
| C5 | Checkout asks the guest to sign up or log in (e-mail and password); delivery address required | `/auth/*`, `/checkout` | `features/auth`, `RequireAuth` | **Rework**: sign-in is e-mail + password (built); sign-up is e-mail-or-phone → code → password → personal details. Confirm with design whether to keep it. Delivery address built |
| C6 | Choose payment: connect external wallet, pay with Fysi wallet, scan QR, get a payment link | `/checkout`, `/pay/[orderId]` (new, hosted pay page) | `features/checkout` | **Rework**: built with card fields and Pay on Delivery, both out of scope. See "Payments on Stellar" |
| C7 | Order confirmation page and e-mail, with transaction hash | `/checkout/confirmation/[orderId]` | `features/checkout` | **Rework**: "Thank you!" built; add the transaction hash and explorer link |
| C8 | Order history and status; Confirm delivery (releases vendor payout); Report a problem within 7 days of delivery | `/account/orders`, `/account/orders/[orderId]`, `/help/report` | `features/support` | **Order Detail built from Figma** (`features/orders`): products with Buy Again (adds to cart at today's price), Delivery Details, Payment Details (Fysi wallet / external wallet / QR / payment link, USDC paid and the tx hash on Stellar Expert; the Figma's Pay on Delivery and bank transfer are out of scope), Status History (Order received → Processing → On the way → Delivered; vertical with dates on phones). Added: Confirm delivery while on the way (releases escrow), Report a problem link for 7 days after delivery (`/help/report?order=` fills the order number), cancelled notice with the refund tx. `GET /orders/:id`, `POST /orders/:id/confirm-delivery`. Account menu restyled to Figma (My Account, Order History, Inbox, Reviews, Settings → profile, Log Out); newsletter under every account page. **Order History built from Figma** (`/account/orders`): desktop table Order ID / Date / Price / Status / View Details, tabs All (added, for orders in progress) / Delivered / Cancelled / Delivery Failed / Returned; phones: cards (first product photo, Order ID, status, date) with tabs All / Delivered/Delivery Failed / Cancelled/Returned. `GET /orders` (`status` comma-separated, `page`, `limit`). Statuses now include `delivery_failed` and `returned`; `closed: { status, at, reason, refund_tx_hash }` replaces `cancelled`. Figma row checkboxes left out (no bulk action for customers) |
| C9 | Custodial wallet: balance, fund by deposit address or QR, history | `/account/wallet` (new; replaces `/account/payment`) | — | Not started. Create wallet, set PIN, fund via anchor (SEP-24) |

Also built and still in scope: About (`/about`, `features/about`), FAQ, Returns, Contact, Report a Problem
(`features/support`), the 404 page. **Rework**: FAQ answers mention card and pay on delivery; Returns says 14-day returns
and 7-day exchanges, the PRD says refunds within 7 days of delivery for non-delivery, damage or wrong item (personal care
only if unopened), paid manually in USDC. Help and legal pages are Scaffold; privacy must follow the Nigeria Data
Protection Act 2023.

Built but out of MVP scope (hide, don't delete, until decided): product reviews and "Leave a review"
(`ProductReviews`, `LeaveReviewDialog`), the discount code at checkout (mock coupons GREEN250, FYSI10), the card form.
Placeholders out of scope: `/account/wishlist`, `/account/messages`, `/account/reviews`, `/account/inbox`.

Site map (PRD): Home → Catalogue (categories, new in) → Search → Product → Cart → Checkout → Sign up / Log in → Account
(orders, wallet, profile) → About → Support (FAQs, contact, privacy, terms).

## Admin (console, `apps/admin`)

| ID | Requirement | Route(s) | Code | Status |
|---|---|---|---|---|
| A1 | Vendor verification queue: view documents, approve, reject with reason, suspend | `/vendors`, `/vendors/[vendorId]`, `/verification` | `features/vendors` (`useAdminVendors`, `useSetVendorStatus`, `useCertifications`) | `/vendors` built from Figma (All / New tabs, search, status filter with Pending / Active / Blocked / Rejected, CSV export, delete; filter Pending = the queue). `/vendors/[vendorId]` built without Figma, in the Customers Details layout: header decisions by status (pending: Reject with a required reason / Approve; active: Suspend with optional reason; blocked: Reactivate; rejected: Approve), shop card, wallet (available / escrow) and listings count, Business verification (CAC, director NIN/BVN last 4, certificates with Certified / Fysi Reviewed badge, Verify / Reject / Revoke each), recent listings. `/verification` redirects to the Pending filter |
| A2 | Dashboard: new vendors, new customers, orders, payment volume (USDC and NGN), failed payments, per day / week | `/` | `features/dashboard` | **Rework**: Overview built from Figma (revenue, sales progress, sales by month, best sellers, website health); swap in the PRD's figures |
| A3 | Activity log: sign-ups, logins, listings, orders, payments, withdrawals, admin actions | `/activity` (new) | — | Not started |
| A4 | Transaction monitor: every payment with order, payer, vendor wallet, amount, status, explorer link; flag unmatched payments | `/transactions` (new) | — | Not started. Flagged (over-, under- or unmatched) payments lead to a manual refund |
| A5 | Product moderation: hide or remove a listing | `/products`, `/products/[productId]` | `features/products` | List built from Figma; moderation built without Figma: the card ⋮ menu has View vendor, Hide from store / Show in store and Remove listing (hide and remove need a reason of 10+ characters, which the vendor sees); hidden cards are faded with a Hidden pill and the reason; a Visibility filter (Visible / Hidden); search also matches the shop name. Product details still Scaffold. "Add Product" and New Category are built but not in the PRD (admins don't sell) |
| A6 | User management: view, suspend or reactivate vendors and customers | `/customers`, `/customers/[customerId]`, `/vendors` | `features/customers` | Customers built from Figma (list, details, blacklist = suspend, order history, export, delete); vendor list built (A1), vendor details to come |
| A7 | Role-based admin accounts (super admin, admin); super admin creates admins | `/sign-in`, `/settings` (or `/team`, new) | `features/auth` | **Rework**: sign-in with admin check built (unstyled); roles and admin management not started. 2FA required |

`/settings` is built from Figma (`features/settings`): the signed-in admin's photo (upload PNG/JPG/WebP ≤ 2MB,
delete), first and last name, e-mail, phone, gender, read-only Admin Id, residential address; `GET/PUT /admin/profile`,
`POST/DELETE /admin/profile/avatar`, and Export (the profile as a CSV, built in the browser). `/settings/notifications`
is built from Figma ("Notification": e-mail switches for vendor onboarding, customer onboarding, comments; each saves at
once via `GET/PUT /admin/profile/notifications`; Export as CSV); reached from the bell and the account menu. A7 roles and
2FA still need a design. `/help` is built from Figma
(`features/support`): customer problem reports (product ID, customer ID, subject, status Open / In progress / Resolved,
item category), status filter, pages, Export; `GET /admin/support/tickets` (+ `/export`). The Figma status pill read
"Online" (placeholder). Opening a report and replying are not designed yet.

Orders (`/orders`, built from Figma) stays useful for monitoring, but its payment methods (Visa, Mastercard, Verve,
transfer, USSD, pay on delivery) and statuses must change to the Stellar methods and the V8 statuses. `/analytics` is built from Figma (`features/analytics`: Overall Sales by day / week / month, Sales Report by category, Product Best Sellers with dates, category filter and pages, Export CSV; endpoints `/admin/analytics`, `/admin/analytics/best-sellers`, `/admin/analytics/export`). It goes beyond the PRD (advanced analytics is out of MVP scope) but supports A2. `/campaigns` (marketing tools, outside the MVP) is built from Figma too (`features/campaigns`: All / New vendor tabs, search, ad-status filter, Impression & data chart, Traffic Statistics for today / week / month, New Ad table with dates, category filter and pages, Export CSV; endpoints `/admin/campaigns/stats`, `/traffic`, `/ads`, `/export`). The Figma copy was partly placeholder: the table shows Store, Impressions, Clicks, Category, Status (Online / Paused / Ended), and Traffic Statistics shows values instead of ⋮ menus.

## Payments on Stellar (what the frontend must do)

Every order is paid in USDC into a Fysi settlement account, matched by a unique memo, held in escrow, then paid out to
each vendor's wallet. Fysi pays the XLM reserves and network fees: users never need XLM.

| Method | Frontend |
|---|---|
| Connect external wallet | Wallet kit (Freighter, LOBSTR, xBull, Albedo, WalletConnect). The API builds the transaction (amount, USDC, memo); the customer signs; the API submits and confirms |
| Pay with Fysi wallet | One tap + PIN; the API signs. Blocked when the balance is too low, with a prompt to fund |
| Scan QR code | Show a QR encoding the SEP-7 payment request (destination, amount, asset, memo) |
| Payment link | The API creates a link to a hosted pay page for the order (open later, or send to someone else to pay) |

Rules that show in the UI:

1. At checkout the USDC amount is quoted and **locked for 15 minutes**; show a countdown. QR codes and links expire with
   the quote.
2. The order turns Paid when amount, asset and memo match (target: confirmed within 10 s). Show waiting, confirmed and
   expired states.
3. Underpaid: the order stays pending and asks for the balance. Overpaid or unmatched: flagged for admin, refunded
   manually.
4. Vendor payout = total minus commission, in escrow until the customer confirms delivery, or automatically 7 days after
   Shipped. Vendors see it as "pending" balance.
5. Every payment and payout shows its transaction hash and a Stellar explorer link (testnet or public network).

New shared components (PRD design system): wallet card, QR payment panel, payment-method picker, transaction row with
explorer link, verification status badge. They go in `packages/ui` once designed.

Never retry a payment submit automatically.

## Decisions in the PRD

| Topic | Decision |
|---|---|
| Settlement asset | USDC only. No XLM payments; a naira stablecoin may come later through the anchor |
| Vendor payout | Escrow; released on Confirm delivery or 7 days after Shipped |
| Commission | 5% per order, deducted at payout, shown on each order; 0% for founding vendors in their first 3 months |
| Custody | MPC wallet-infrastructure provider (e.g. DFNS) behind Fysi's wallet service |
| NGN on/off-ramp | One licensed SEP-24 anchor (shortlist: Yellow Card, Linkio, NGNC), live at the pilot |
| KYC | Vendors: full KYB before approval (CAC certificate, director NIN or BVN, address). Customers: external wallet needs e-mail only; custodial wallet Tier 1 (e-mail + phone) capped at ₦300,000 balance, Tier 2 (BVN or NIN via e.g. Smile ID or Dojah) lifts the cap |
| Refunds | Manual, by admin, in USDC to the paying address; non-delivery, damage or wrong item within 7 days of delivery; personal care only if unopened |
| Certifications | Recognised labels (GOTS, OEKO-TEX, FSC, Fairtrade, Rainforest Alliance, EU Ecolabel, USDA Organic) or SON certification → **"Certified"** badge. Vendors without labels submit evidence (materials, sourcing, photos) → **"Fysi Reviewed"** badge. Both come from admin decisions only |

Security the frontend touches: PIN for custodial payments; password + OTP for withdrawals; 2FA for vendors and admins;
session timeout; every admin action audited; WCAG 2.1 AA; pages under 3 s on 4G.

## Release plan

1. **Foundation**: auth, vendor onboarding, admin verification queue, product listings, storefront, guest cart.
2. **Wallets and payments on testnet**: custodial wallets, external wallet connect, QR and payment links, payouts, admin
   transaction monitor.
3. **Pilot**: security review, legal sign-off, NGN on/off-ramp via one anchor, mainnet with 10–20 founding vendors in
   Lagos and Abuja.
4. **Next**: marketing tools, reviews, courier integration.

Success metrics: 30 verified vendors with a live product in 3 months; verification decided within 72 h; 40% guest cart
→ sign-up; 60% checkout → confirmed payment; confirmation < 10 s; < 1% failed or unmatched payments; 100% of paid orders
credited correctly.

## API endpoints the frontend assumes

The backend is external (separate repo). These paths and shapes are **placeholders** in each app's `lib/routes.ts`
(`backendRoutes`) and `features/*/types.ts`; replace them with the external API's real contract. Assumed envelope:
success `{ status_code, message, data }`, errors `{ message }`, lists `{ items, meta }`.

They were written for the earlier PRD. Rows marked *(out of scope)* belong to features the new PRD drops; payment,
wallet, verification, activity and transaction endpoints are still to be agreed with the backend (Steven).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login`, `/auth/signup` | public | Session `{ access_token, expires_in, user }`; signup takes `role: customer \| vendor` |
| GET / PUT | `/profile/me`, `/profile` | user | Profile |
| GET | `/categories` | public | Launch categories |
| GET | `/products` | public | `category, collection, q, colors, availability, min_price, max_price, min_rating, verified, featured, sort, page, limit`. `category`, `colors` and `availability` take comma-separated lists (Filter ▾: `category=clothing,kitchen`, `colors=red,black,brown,green`, `availability=popular,sale`; "popular" and "sale" rules are the API's to define, the mock uses rating ≥ 4.7 or ≥ 40 reviews, and a `compare_at_price` above the price). Products need a `colors: string[]` field |
| GET | `/products/:slug` | public | Product + verified certifications. Products also need `sku`, `tags` (chips such as "Non toxic", "Biodegradable"), the vendor, the badge type and a USDC price |
| GET / POST | `/products/:slug/reviews` | public / customer | *(out of scope)* Reviews list; "Leave a review" (multipart: `name`, `email`, `rating`, `comment`, optional `photo`) |
| POST | `/auth/email/code`, `/auth/email/verify` | public | Seller sign-up: send a code `{ email, role: "vendor" }`; check it `{ email, code }` → `{ verification_token }` |
| POST | `/auth/signup` (seller) | public | `{ email, password, phone_number, country (ISO, e.g. "NG"), verification_token, role: "vendor" }` → session |
| GET / POST | `/vendor/me`, `/vendor/onboarding` | vendor | Own shop; create shop (pending). **multipart/form-data**: `account_type` (`business` \| `individual`), `shop_name`, `shipping_zone`, `referral_source`, `terms_accepted=true`, and for business only `cac_id` (e.g. `RC1234567`) and `cac_certificate` (SVG/PNG/JPG/GIF file, ≤ 10MB). Country and e-mail come from the account. Zone and referral values: `features/shop/options.ts` (placeholders). V2 adds address, category, sustainability certificate and director NIN/BVN |
| GET | `/vendor/products` | vendor | Own listings |
| GET | `/admin/stats` | admin | Counts |
| GET | `/admin/dashboard` | admin | Overview: `{ totals: { revenue, revenue_change, new_clients, visited_users, vendors, orders }, sales_progress: { target, revenue, today, yesterday, change }, sales_by_month: [{ month, sales }], best_sellers: [{ id, name, sold, price, profit }], website_health: { speed, error } }` (`features/dashboard/types.ts`). A2 changes the figures |
| GET | `/admin/products` | admin | All products: `search, sort (newest \| best_selling \| price_low \| price_high), from, to (ISO dates), visibility (visible,hidden), page, limit` → `{ items: [{ id, name, category, price, description, image_url, sold, quantity, created_at, visibility, hidden_reason, vendor: { id, shop_name } \| null }], meta }` |
| POST | `/admin/products/:id/visibility` | admin | A5: `{ visibility: "hidden" \| "visible", reason? }` (reason required to hide; the vendor sees it) → the product. Hidden products disappear from the storefront and its search |
| DELETE | `/admin/products/:id` | admin | A5: remove a listing for good; body `{ reason }` (the vendor is told). Paid orders for it still need fulfilling |
| GET | `/admin/orders` | admin | Order list: `period (12m \| 30d \| 7d \| 24h)` or `from, to` (ISO days), `status` and `payment` (comma-separated: `pending, processing, shipped, delivered, cancelled, failed, returned`; `visa, mastercard, verve, transfer, ussd, pay_on_delivery`; both to change for Stellar), `customer`, `sort (product_asc \| product_desc)`, `page, limit` → `{ items: [{ id, number, first_item: { name, image_url }, other_items, customer: { id, name }, created_at, total, payment_method, status }], meta }` |
| GET | `/admin/orders/export` | admin | The same filters, or `ids` (comma-separated), → a CSV file |
| GET | `/admin/orders/:id` | admin | Order Details dialog (`/orders?order=:id`, `&section=tracking` for Track Order): `{ id, number, created_at, recipient: { name, phone_number, email, address }, items: [{ id, name, image_url, quantity, price }], subtotal, vat_rate, vat, shipping, total, payment_method, shipping_method (door_delivery \| pickup), status, tracking: [{ label, state (done \| upcoming \| stopped), at }] }` (`features/orders/types.ts`) |
| DELETE | `/admin/orders/:id` | admin | Delete an order (Figma ⋮ menu). **Open question:** should paid orders be deletable at all, given payments are on-chain? |
| GET | `/admin/customers` | admin | Customer list: `tab (new = joined in the last 30 days)`, `search` (name, e-mail or phone), `status` (comma-separated: `active, blocked`), `page, limit` → `{ items: [{ id, first_name, last_name, email, phone_number, avatar_url, orders_count, balance, created_at, status }], meta }`. "Balance" is probably the custodial wallet balance: confirm |
| GET | `/admin/customers/export` | admin | The same filters, or `ids`, → a CSV file |
| GET | `/admin/customers/:id` | admin | Customers Details: the list fields plus `code` (e.g. ID-011221), `username`, `address`, `last_order_at`, `subscribed`, `rewards_points`, `changes: { balance, orders, rewards_points }` (% vs previous period) (`features/customers/types.ts`). Order History uses `GET /admin/orders?customer=:id`; Export uses `/admin/orders/export?customer=:id`. Orders need a `customer_id` |
| POST | `/admin/customers/:id/status` | admin | "Blacklist this customer" (A6 suspend): `{ status: "blocked" \| "active" }` → the customer |
| DELETE | `/admin/customers/:id` | admin | Delete a customer account (Figma 🗑) |
| GET / POST | `/admin/categories` | admin | Category list; New Category (multipart: `name`, optional `description` ≤ 300 chars, optional `thumbnail`) |
| POST | `/admin/products` | admin | *(not in the PRD)* Add Product (multipart: name, category, brand, colour, weight, description, 1–6 images, variants, specification, price, sale price and dates) |
| POST | `/support/reports` | public | Report a Product / Problem: `{ name, email, issue_type, order_number, product_name, description, preferred_resolution, comments }` → `{ id }`. Issue and resolution values: `features/support/report.ts` (placeholders) |
| POST | `/checkout/quote` | customer | `{ items: [{ product_id, quantity }], coupon_code? }` → `{ subtotal, discount, shipping, total, coupon, coupon_error? }`. The API prices the cart. C6 adds the locked USDC quote and its expiry; coupons are out of scope |
| POST | `/orders` | customer | `{ items, coupon_code?, delivery: { first_name, last_name, address, city, zip_code, phone_number, email }, payment_method: "card" \| "pay_on_delivery" }` → `{ order, payment_url }`. C6 replaces the payment methods. Never retried by the client |
| GET | `/admin/vendors` | admin | Vendor list: `tab (new = signed up in the last 30 days)`, `search` (shop, owner or e-mail), `status` (comma-separated: `pending, approved, suspended, rejected`), `page, limit` → `{ items: [{ id, shop_name, owner_name, email, avatar_url, first_product: { name, image_url } | null, other_products, sku_count, balance, created_at, status }], meta }` (`features/vendors/types.ts`). "Balance" = available wallet balance in naira |
| GET | `/admin/vendors/export` | admin | The same filters, or `ids`, → a CSV file |
| GET | `/admin/vendors/:id` | admin | Vendor details: the list row plus `code, phone_number, business_address, category, account_type, cac: { number, certificate_url } | null, director_id: { type: nin | bvn, last4 } | null, certifications[] (with `badge`: certified | fysi_reviewed), wallet: { available, pending } | null, products_count, recent_products[], submitted_at, decided_at, rejection_reason, suspension_reason` (`features/vendors/types.ts`). Never send full NIN/BVN to the client |
| POST | `/admin/vendors/:id/status` | admin | `{ status, reason? }` (reason required for `rejected`, min 10 chars; the vendor sees it) → the vendor detail |
| DELETE | `/admin/vendors/:id` | admin | Delete a vendor (Figma 🗑). **Open question:** allowed once a shop has paid orders or a wallet balance? |
| GET / POST | `/admin/certifications`, `/admin/certifications/:id/status` | admin | Verify or revoke; syncs product badges |

Customer auth (Figma: email-or-phone → 4-digit code → "Create your account" for new customers):
- `POST /auth/otp/request { identifier }` sends the code.
- `POST /auth/otp/verify { identifier, code }` returns either a session `{ access_token, expires_in, user }` (returning
  customer) or `{ is_new_user: true, verification_token }` (new customer).
- `POST /auth/signup { identifier, password, verification_token, role: "customer" }` returns the session.
- `PUT /profile { first_name, last_name, phone_number }` (Personal Details, step 4) returns the updated user.
Phones are sent as `+234…`, emails lower-cased.

Customer sign in (Figma "Welcome back", `/auth/sign-in`): `POST /auth/login { email, password, remember_me }` returns
the session; `remember_me` asks for a 30-day session. Not wired yet: "Sign in with Google" (shows a toast) and Forgot
password (placeholder page; screen not designed yet).

**Temporary mock:** with `NEXT_PUBLIC_MOCK_API=1` in `apps/web/.env.local`, `apps/web/src/lib/api/mock.ts` answers in
the browser: the auth endpoints above (demo account demo@fysi.ng / Password1, code 1234; new accounts in localStorage),
`GET /categories`, `GET /products` (all filters), `GET /products/:slug`, `GET /products/:slug/reviews`, `POST /checkout/quote` (coupons GREEN250 and FYSI10; shipping ₦1,500, free from ₦50,000), `POST /orders` (card orders count as paid; no provider) (81 sample products across all 8 categories in `mock-catalog.ts`, photos
in `public/images/products`) and `POST /newsletter`. All other requests still go to the API. Remove `mock.ts`,
`mock-catalog.ts`, `public/images/products` and the lines in `lib/api/client.ts` when the API is connected.

The vendor app has the same switch (`apps/vendor/.env.local`): `apps/vendor/src/lib/api/mock.ts` answers vendor sign in,
the sign-up flow (`/auth/email/*` with code 1234, `/auth/signup`), `GET /vendor/me`, `POST /vendor/onboarding` (new
shops stay pending) and `GET /vendor/products` (empty). Demo vendors: new@fysi.ng / Password1 (no shop, goes to
onboarding), vendor@fysi.ng / Password1 (approved shop).

The admin app too (`apps/admin/.env.local`): `apps/admin/src/lib/api/mock.ts` answers admin sign in (admin@fysi.ng /
Password1), the Overview, products (list, categories, Add Product), orders and customers (lists, details, export, delete,
blacklist).

Also assumed by the home page: `POST /newsletter { email }`. Category slugs in `lib/navigation.ts` follow the Figma
catalogue dropdown and must match the API's.

## Open items

Still open after the PRD:

- Wallet kit for external wallets (Stellar Wallets Kit covers Freighter, LOBSTR, xBull, Albedo and WalletConnect), and
  whether QR / payment-link pages poll or stream the payment status.
- Which anchor (Yellow Card, Linkio or NGNC) and which KYC provider (Smile ID or Dojah); their SEP-24 flows open in a
  hosted window.
- Designs for the new screens: wallets (customer and vendor), payment-method picker, QR panel, hosted pay page,
  withdrawal, rejection reason, activity log, transaction monitor, admin roles.
- Customer sign-up: keep the designed e-mail-or-phone + code flow, or switch to the PRD's e-mail + password with e-mail
  verification?
- Categories: move to the PRD's 6, or keep the Figma's 8?
- Built features the PRD drops (reviews, discount codes, admin Add Product, card form): hide, or remove?
- Should paid orders and customers be deletable by admins, given on-chain records and the audit log?
- Production domains and hosting (then add `vercel.json` and Open Graph images).
- Backend: external. Need its base URL and API docs (Swagger/OpenAPI) to replace the assumed endpoints above.
- **Design guide** (Figma file `bZyjk8YaY7ZjyNh4NqqvpY`): colour scales applied (Forest Green, Grey, Lime Yellow, 5 of 6
  brand swatches). Still to read: Forest Green brand swatch, buttons, typography, icons, logo, Hi-Fi screens. Blocked by
  the Figma Starter plan's AI-tool call limit. Body text colour (`ink`, black) is an assumption.
