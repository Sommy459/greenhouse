/** Every storefront URL, grouped as in the PRD's information architecture. Build links from these, never by hand. */

export const shopRoutes = {
	HOME: "/",
	CATEGORY: (slug: string) => `/categories/${slug}`,
	/** new-in · on-demand · hot-deals · sustainability */
	COLLECTION: (slug: string) => `/collections/${slug}`,
	SEARCH: (q?: string) => (q ? `/search?${new URLSearchParams({ q })}` : "/search"),
	PRODUCT: (slug: string) => `/products/${slug}`,
	/** A verified vendor's store page. */
	STORE: (slug: string) => `/stores/${slug}`,
	CART: "/cart",
};

export const checkoutRoutes = {
	CHECKOUT: "/checkout",
	/** Choose how to pay for a placed order, then wait for the payment (C6). */
	PAY: (orderId: string) => `/checkout/pay/${orderId}`,
	CONFIRMATION: (orderId: string) => `/checkout/confirmation/${orderId}`,
	/** The shareable payment link's page (anyone can pay it). */
	PAY_LINK: (token: string) => `/pay/${token}`,
};

export const authRoutes = {
	/** "Welcome back": email and password. */
	SIGN_IN: (next?: string) => (next ? `/auth/sign-in?${new URLSearchParams({ next })}` : "/auth/sign-in"),
	/** "Welcome to Fysi": step 1 of sign up (email or phone, then a one-time code). */
	SIGN_UP: (next?: string | null) => (next ? `/auth/sign-up?${new URLSearchParams({ next })}` : "/auth/sign-up"),
	/** Step 2 after "Welcome to Fysi": enter the code sent to the email or phone. */
	VERIFY: (identifier: string, next?: string | null) =>
		`/auth/verify?${new URLSearchParams({ identifier, ...(next ? { next } : {}) })}`,
	/** Step 3, new customers only: set a password. */
	CREATE_ACCOUNT: (identifier: string, next?: string | null) =>
		`/auth/create-account?${new URLSearchParams({ identifier, ...(next ? { next } : {}) })}`,
	/** Step 4, new customers only: name and phone, saved to the profile. */
	PERSONAL_DETAILS: (next?: string | null) => `/auth/personal-details${next ? `?${new URLSearchParams({ next })}` : ""}`,
	/** "Edit" on Create your account: back to step 1 with the email or phone filled in. */
	EDIT_IDENTIFIER: (identifier: string, next?: string | null) =>
		`/auth/sign-up?${new URLSearchParams({ identifier, ...(next ? { next } : {}) })}`,
	/** "Forgot password" on Welcome back (screen not designed yet). */
	FORGOT_PASSWORD: "/auth/forgot-password",
	RESET_PASSWORD: "/auth/reset-password",
	/** The reset screen, after the code was emailed. */
	RESET_PASSWORD_FOR: (email: string) => `/auth/reset-password?${new URLSearchParams({ email })}`,
};

export const accountRoutes = {
	DASHBOARD: "/account",
	/** Phones: My Account's cards (wide screens show them on DASHBOARD beside the menu). */
	OVERVIEW: "/account/overview",
	/** Figma "Settings": name, phone, photo and password. /account/profile leads here. */
	SETTINGS: "/account/settings",
	PROFILE: "/account/profile",
	ORDERS: "/account/orders",
	ORDER: (orderId: string) => `/account/orders/${orderId}`,
	/** The Fysi wallet (C9): balance, deposit address, activity, PIN. */
	WALLET: "/account/wallet",
	/** Saved products: full width, outside the account menu (Figma). */
	WISHLIST: "/wishlist",
	INBOX: "/account/inbox",
	/** Saved delivery addresses. */
	ADDRESSES: "/account/addresses",
	/** Products waiting for a review, and the customer's reviews. */
	REVIEWS: "/account/reviews",
	/** Support requests (tickets) and their replies. */
	SUPPORT: "/account/support",
	SUPPORT_TICKET: (id: string) => `/account/support/${id}`,
};

export const aboutRoutes = {
	ABOUT: "/about",
	MISSION: "/about/mission",
	SUSTAINABILITY: "/about/sustainability",
	CERTIFICATIONS: "/about/certifications",
};

export const supportRoutes = {
	HELP: "/help",
	FAQS: "/help/faqs",
	CONTACT: "/contact",
	RETURNS: "/help/returns",
	REPORT: "/help/report",
	PRIVACY: "/legal/privacy",
	TERMS: "/legal/terms",
	LEGAL_NOTICE: "/legal/notice",
};

/** Fysi API paths, relative to /api/v1 (https://fysi-backend-production.up.railway.app/docs). */
export const backendRoutes = {
	// Auth
	REGISTER: "/auth/register",
	VERIFY_EMAIL: "/auth/verify-email",
	RESEND_CODE: "/auth/resend-otp",
	FORGOT_PASSWORD: "/auth/forgot-password",
	RESET_PASSWORD: "/auth/reset-password",
	SIGN_IN: "/auth/login",
	LOGIN_2FA: "/auth/login/2fa",
	REFRESH: "/auth/refresh",
	LOGOUT: "/auth/logout",
	CHANGE_PASSWORD: "/auth/change-password",
	ME: "/auth/me",
	AVATAR: "/auth/me/avatar",
	// Catalogue
	CATEGORIES: "/categories",
	PRODUCTS: "/products",
	PRODUCT: (slug: string) => `/products/${slug}`,
	STORE: (slug: string) => `/vendors/${slug}`,
	STELLAR_NETWORK: "/stellar/network",
	// Cart: guests price theirs with PREVIEW; signed in, the cart lives on the server.
	CART_PREVIEW: "/cart/preview",
	CART: "/cart",
	CART_MERGE: "/cart/merge",
	CART_ITEM: (productId: string) => `/cart/items/${productId}`,
	// Checkout and orders
	CHECKOUT: "/checkout",
	ORDERS: "/orders",
	ORDER: (id: string) => `/orders/${id}`,
	PAY_EXTERNAL: (id: string) => `/orders/${id}/pay/external`,
	PAY_EXTERNAL_SUBMIT: (id: string) => `/orders/${id}/pay/external/submit`,
	PAY_WALLET: (id: string) => `/orders/${id}/pay/wallet`,
	CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
	CONFIRM_DELIVERY: (id: string, vendorOrderId: string) => `/orders/${id}/vendor-orders/${vendorOrderId}/confirm-delivery`,
	REPORT_PROBLEM: (id: string, vendorOrderId: string) => `/orders/${id}/vendor-orders/${vendorOrderId}/problem`,
	PAY_LINK: (token: string) => `/pay/${token}`,
	// Fysi wallet (custodial)
	WALLET: "/wallet",
	WALLET_PIN: "/wallet/pin",
	// Wishlist (PUT saves, DELETE removes)
	WISHLIST: "/wishlist",
	WISHLIST_ITEM: (productId: string) => `/wishlist/${productId}`,
	// Reviews
	PRODUCT_REVIEWS: (slug: string) => `/products/${slug}/reviews`,
	PRODUCT_REVIEW_SUMMARY: (slug: string) => `/products/${slug}/reviews/summary`,
	PENDING_REVIEWS: "/reviews/pending",
	MY_REVIEWS: "/reviews",
	MY_REVIEW: (id: string) => `/reviews/${id}`,
	// Inbox
	INBOX: "/inbox",
	INBOX_UNREAD: "/inbox/unread-count",
	INBOX_READ_ALL: "/inbox/read-all",
	INBOX_READ: (id: string) => `/inbox/${id}/read`,
	INBOX_ITEM: (id: string) => `/inbox/${id}`,
	// Saved addresses
	ADDRESSES: "/addresses",
	ADDRESS: (id: string) => `/addresses/${id}`,
	ADDRESS_DEFAULT: (id: string) => `/addresses/${id}/default`,
	// Support tickets
	TICKETS: "/support/tickets",
	TICKET: (id: string) => `/support/tickets/${id}`,
	TICKET_MESSAGES: (id: string) => `/support/tickets/${id}/messages`,
	TICKET_CLOSE: (id: string) => `/support/tickets/${id}/close`,
	// Newsletter
	NEWSLETTER: "/newsletter/subscribe",
	NEWSLETTER_ME: "/newsletter/me",
};
