import { STORE_URL } from "@/lib/site";

/** Every seller-centre URL. Build links from these, never by hand. */

export const authRoutes = {
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
	/** Turn on two-factor sign-in (required for vendors before anything else works). */
	TWO_FACTOR: "/two-factor",
};

/** Before the console: the business profile and documents (V2), then wait for admin approval (V3). */
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
	ORDERS: "/orders",
	/** Order Details, a dialog over the order list (Figma). */
	ORDER: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}`,
	/** The same dialog with Update status open (PRD V8: status, courier and tracking number). */
	ORDER_UPDATE: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}&section=update`,
	/** The shop's wallet (PRD V5, V6): balances, payouts, withdrawals. Was Figma "Account Statements". */
	WALLET: "/wallet",
	/** Figma "Account Statements": earnings and withdrawals with a running balance. */
	STATEMENTS: "/statements",
	/** Sales analytics and how each product performs. */
	ANALYTICS: "/analytics",
	/** Figma "Promotion Management": percentage-off promotions. */
	PROMOTIONS: "/promotions",
	NEW_PROMOTION: "/promotions/new",
	PROMOTION: (id: string) => `/promotions/${id}`,
	REVIEWS: "/reviews",
	SETTINGS: "/settings",
	HELP: "/help",
};

/** Fysi API paths, relative to /api/v1 (https://fysi-backend-production.up.railway.app/docs). */
export const backendRoutes = {
	// Auth
	REGISTER: "/auth/register",
	VERIFY_EMAIL: "/auth/verify-email",
	RESEND_CODE: "/auth/resend-otp",
	SIGN_IN: "/auth/login",
	LOGIN_2FA: "/auth/login/2fa",
	SETUP_2FA: "/auth/2fa/setup",
	ENABLE_2FA: "/auth/2fa/enable",
	REFRESH: "/auth/refresh",
	LOGOUT: "/auth/logout",
	CHANGE_PASSWORD: "/auth/change-password",
	ME: "/auth/me",
	AVATAR: "/auth/me/avatar",
	// Onboarding (V2, V3)
	PROFILE: "/vendor/profile",
	LOGO: "/vendor/profile/logo",
	DOCUMENTS: "/vendor/documents",
	DOCUMENT: (id: string) => `/vendor/documents/${id}`,
	SUBMIT: "/vendor/submit",
	CATEGORIES: "/categories",
	// Products (V7)
	MY_PRODUCTS: "/vendor/products",
	MY_PRODUCT: (id: string) => `/vendor/products/${id}`,
	PRODUCT_IMAGES: (id: string) => `/vendor/products/${id}/images`,
	PRODUCT_IMAGE_ORDER: (id: string) => `/vendor/products/${id}/images/order`,
	PRODUCT_IMAGE: (id: string, imageId: string) => `/vendor/products/${id}/images/${imageId}`,
	// Orders (V8)
	MY_ORDERS: "/vendor/orders",
	MY_ORDER: (id: string) => `/vendor/orders/${id}`,
	MY_ORDER_STATUS: (id: string) => `/vendor/orders/${id}/status`,
	// Wallet (V5, V6)
	WALLET: "/vendor/wallet",
	WITHDRAWALS: "/vendor/wallet/withdrawals",
	WITHDRAWAL: (id: string) => `/vendor/wallet/withdrawals/${id}`,
	CONFIRM_WITHDRAWAL: (id: string) => `/vendor/wallet/withdrawals/${id}/confirm`,
	// Insights and money
	DASHBOARD: "/vendor/dashboard",
	ANALYTICS: "/vendor/analytics",
	PRODUCT_STATS: "/vendor/product-stats",
	STATEMENT: "/vendor/statements",
	STATEMENT_CSV: "/vendor/statements/export.csv",
	ORDERS_CSV: "/vendor/exports/orders.csv",
	PRODUCTS_CSV: "/vendor/exports/products.csv",
	CANCEL_ORDER: (id: string) => `/vendor/orders/${id}/cancel`,
	// Promotions
	PROMOTIONS: "/vendor/promotions",
	PROMOTION: (id: string) => `/vendor/promotions/${id}`,
	PROMOTION_ACTION: (id: string, action: "pause" | "resume" | "end") => `/vendor/promotions/${id}/${action}`,
	REVIEWS: "/vendor/reviews",
	/** Prefix of CONFIRM_WITHDRAWAL, for the client's "wrong password isn't an expired session" rule. */
	CONFIRM_WITHDRAWAL_PATTERN: "/vendor/wallet/withdrawals/",
};
