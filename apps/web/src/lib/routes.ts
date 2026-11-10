/** Every storefront URL, grouped as in the PRD's information architecture. Build links from these, never by hand. */

export const shopRoutes = {
	HOME: "/",
	CATEGORY: (slug: string) => `/categories/${slug}`,
	/** new-in · on-demand · hot-deals · sustainability */
	COLLECTION: (slug: string) => `/collections/${slug}`,
	SEARCH: (q?: string) => (q ? `/search?${new URLSearchParams({ q })}` : "/search"),
	PRODUCT: (slug: string) => `/products/${slug}`,
	CART: "/cart",
};

export const checkoutRoutes = {
	CHECKOUT: "/checkout",
	CONFIRMATION: (orderId: string) => `/checkout/confirmation/${orderId}`,
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
};

export const accountRoutes = {
	DASHBOARD: "/account",
	/** Phones: My Account's cards (wide screens show them on DASHBOARD beside the menu). */
	OVERVIEW: "/account/overview",
	PROFILE: "/account/profile",
	/** Figma "Settings": personal info, photo and password. /account/profile leads here. */
	SETTINGS: "/account/settings",
	ORDERS: "/account/orders",
	ORDER: (orderId: string) => `/account/orders/${orderId}`,
	/** Figma "Wishlist": full width, outside the account menu. */
	WISHLIST: "/wishlist",
	PAYMENT: "/account/payment",
	INBOX: "/account/inbox",
	MESSAGES: "/account/messages",
	REVIEWS: "/account/reviews",
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
	/** Report a Problem with the order number filled in. */
	REPORT_ORDER: (orderNumber: string) => `/help/report?${new URLSearchParams({ order: orderNumber })}`,
	PRIVACY: "/legal/privacy",
	TERMS: "/legal/terms",
	LEGAL_NOTICE: "/legal/notice",
};

/** API paths (relative to /api/v1). */
export const backendRoutes = {
	SIGN_IN: "/auth/login",
	SIGN_UP: "/auth/signup",
	/** One-time code flow (Figma): placeholders until matched to the external API. */
	REQUEST_CODE: "/auth/otp/request",
	VERIFY_CODE: "/auth/otp/verify",
	PROFILE: "/profile",
	ME: "/profile/me",
	/** GET / PUT the saved delivery (billing) address. */
	ADDRESS: "/profile/address",
	/** POST multipart `photo` → the updated user. */
	AVATAR: "/profile/avatar",
	/** POST `{ current_password, new_password }`. */
	CHANGE_PASSWORD: "/auth/change-password",
	/** Inbox (C11): `page, limit`. */
	INBOX: "/inbox",
	/** GET the saved products; POST `{ product_id }` to save one. */
	WISHLIST: "/wishlist",
	WISHLIST_ITEM: (productId: string) => `/wishlist/${productId}`,
	/** Delivered products not reviewed yet: `page, limit`. */
	PENDING_REVIEWS: "/reviews/pending",
	CATEGORIES: "/categories",
	PRODUCTS: "/products",
	PRODUCT: (slug: string) => `/products/${slug}`,
	/** Customer reviews of one product (C9). */
	PRODUCT_REVIEWS: (slug: string) => `/products/${slug}/reviews`,
	NEWSLETTER: "/newsletter",
	/** Checkout (C5, C6, C15): price the cart (subtotal, coupon, shipping, total), then place the order. */
	/** Report a Product / Problem (C13). */
	SUPPORT_REPORTS: "/support/reports",
	CHECKOUT_QUOTE: "/checkout/quote",
	ORDERS: "/orders",
	ORDER: (id: string) => `/orders/${id}`,
	/** The customer confirms the parcel arrived: escrow releases the vendor payout (C8). */
	CONFIRM_DELIVERY: (id: string) => `/orders/${id}/confirm-delivery`,
};
