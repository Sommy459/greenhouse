import { STORE_URL } from "@/lib/site";

/** Every seller-centre URL. Build links from these, never by hand. */

export const authRoutes = {
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
};

/** Before the console: "Set up your shop", then wait for admin approval (V1). */
export const setupRoutes = {
	ONBOARDING: "/onboarding",
	PENDING: "/pending",
};

/**
 * Legal pages linked from the sign-up agreement. They live on the storefront; the seller contract and codes pages are
 * not written yet, so those point at the general terms until they are.
 */
export const legalLinks = {
	SELLER_CONTRACT: `${STORE_URL}/legal/terms`,
	SELLER_CODES: `${STORE_URL}/legal/terms`,
	SELLER_POLICIES: `${STORE_URL}/legal/terms`,
	PRIVACY: `${STORE_URL}/legal/privacy`,
	COOKIES: `${STORE_URL}/legal/notice`,
};

export const consoleRoutes = {
	OVERVIEW: "/",
	PRODUCTS: "/products",
	NEW_PRODUCT: "/products/new",
	PRODUCT: (productId: string) => `/products/${productId}`,
	/** The same page, opened at its edit form. */
	EDIT_PRODUCT: (productId: string) => `/products/${productId}?edit=1`,
	INVENTORY: "/inventory",
	ORDERS: "/orders",
	/** Figma "Track Orders": look up a package by tracking number or order ID; Active and My Shipping lists. */
	TRACK_ORDERS: "/orders/track",
	/** Track Orders with a lookup filled in. */
	TRACK: (id: string) => `/orders/track?id=${encodeURIComponent(id)}`,
	/** Order Details, a dialog over the order list (Figma). */
	ORDER: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}`,
	/** The same dialog, scrolled to Order Tracking. */
	TRACK_ORDER: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}&section=tracking`,
	/** The same dialog with Update status open (PRD V8: status, courier and tracking number). */
	ORDER_UPDATE: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}&section=update`,
	SHIPPING: "/shipping",
	PROMOTIONS: "/promotions",
	/** Not designed yet. */
	NEW_PROMOTION: "/promotions/new",
	/** Figma sidebar "Monitor Promotions"; not designed yet. */
	MONITOR_PROMOTIONS: "/promotions/monitor",
	PROMOTION: (promotionId: string) => `/promotions/monitor?promotion=${encodeURIComponent(promotionId)}`,
	EDIT_PROMOTION: (promotionId: string) => `/promotions/new?edit=${encodeURIComponent(promotionId)}`,
	CERTIFICATION: "/certification",
	ANALYTICS: "/analytics",
	MESSAGES: "/messages",
	TRAINING: "/training",
	/** Figma "Account Statements": the shop's wallet (PRD V5, V6). */
	STATEMENTS: "/statements",
	SETTINGS: "/settings",
	HELP: "/help",
};

/** API paths (relative to /api/v1). */
export const backendRoutes = {
	SIGN_IN: "/auth/login",
	SIGN_UP: "/auth/signup",
	MY_SHOP: "/vendor/me",
	ONBOARDING: "/vendor/onboarding",
	/** Seller sign-up steps 2–3: send a code to the e-mail, then check it. Placeholders until matched to the API. */
	EMAIL_CODE: "/auth/email/code",
	EMAIL_VERIFY: "/auth/email/verify",
	MY_PRODUCTS: "/vendor/products",
	/** One listing: PATCH `{ status }` to hide / show, DELETE to remove. */
	MY_PRODUCT: (productId: string) => `/vendor/products/${productId}`,
	/** Manage Products: the four totals above the list. */
	MY_PRODUCT_STATS: "/vendor/products/stats",
	/** The same filters as MY_PRODUCTS (or `ids`), answered as a CSV file. */
	MY_PRODUCTS_EXPORT: "/vendor/products/export",
	DASHBOARD: "/vendor/dashboard",
	/** Storefront categories, for the Add Products form. */
	CATEGORIES: "/categories",
	/** The shop's certificates (from onboarding and later uploads). */
	MY_CERTIFICATIONS: "/vendor/certifications",
	MY_ORDERS: "/vendor/orders",
	MY_ORDER: (orderId: string) => `/vendor/orders/${orderId}`,
	/** POST `{ status, courier?, tracking_number?, reason? }`. */
	MY_ORDER_STATUS: (orderId: string) => `/vendor/orders/${orderId}/status`,
	/** The same filters as MY_ORDERS (or `ids`), answered as a CSV file. */
	MY_ORDERS_EXPORT: "/vendor/orders/export",
	/** GET `?q=` a tracking number or order ID → that order's details (404 if none). */
	TRACK_ORDER: "/vendor/orders/track",
	/** Account Statements (PRD V5): `status, page, limit`. */
	STATEMENTS: "/vendor/statements",
	STATEMENT: (id: string) => `/vendor/statements/${id}`,
	/** GET the export list; POST `{ currency }` to ask for one (built in the background). */
	STATEMENT_EXPORTS: "/vendor/statements/exports",
	STATEMENT_EXPORT_FILE: (id: string) => `/vendor/statements/exports/${id}/file`,
	/** Promotion Management: `status, search, type, page, limit`. */
	PROMOTIONS: "/vendor/promotions",
	PROMOTION_CANCEL: (id: string) => `/vendor/promotions/${id}/cancel`,
	/** Monitor Promotions: `promotion, status, page, limit` → rows + summary. */
	PROMOTION_PERFORMANCE: "/vendor/promotions/performance",
	/** The same filters (or `ids`), answered as a CSV file. */
	PROMOTION_PERFORMANCE_EXPORT: "/vendor/promotions/performance/export",
};
