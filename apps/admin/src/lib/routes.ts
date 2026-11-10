/** Every admin console URL. Build links from these, never by hand. */

export const authRoutes = {
	SIGN_IN: "/sign-in",
	/** Turn on two-factor sign-in (required for admins before anything else works). */
	TWO_FACTOR: "/two-factor",
};

export const consoleRoutes = {
	OVERVIEW: "/",
	/** Vendor verification queue and every vendor (PRD A1–A2). */
	VENDORS: "/vendors",
	VENDOR: (vendorId: string) => `/vendors/${vendorId}`,
	/** The queue: the vendor list filtered to Pending. */
	VENDOR_QUEUE: "/vendors?status=pending",
	/** Old link to the queue; redirects to VENDOR_QUEUE. */
	VERIFICATION: "/verification",
	/** Catalogue moderation and categories (PRD A5). */
	PRODUCTS: "/products",
	CATEGORIES: "/products?tab=categories",
	/** Vendor orders, escrow and disputes. */
	ORDERS: "/orders",
	/** Transaction monitor (PRD A4): incoming payments, and payouts, refunds and withdrawals. */
	PAYMENTS: "/payments",
	/** Every account (customers, vendors, admins). */
	USERS: "/customers",
	USER: (userId: string) => `/customers/${userId}`,
	/** The append-only audit log (PRD A3). */
	AUDIT: "/audit",
	/** Admin accounts; super admins add admins (PRD A7). */
	TEAM: "/team",
	/** Sales, commission and growth over a range. */
	ANALYTICS: "/analytics",
	/** Help desk: tickets from customers and vendors. */
	SUPPORT: "/support",
	TICKET: (id: string) => `/support/${id}`,
	/** Review moderation. */
	REVIEWS: "/reviews",
	/** In-app announcements to customers, vendors or staff. */
	ANNOUNCEMENTS: "/announcements",
	/** Newsletter subscribers and email campaigns. */
	NEWSLETTER: "/newsletter",
	CAMPAIGNS: "/newsletter?tab=campaigns",
	NEW_CAMPAIGN: "/newsletter/campaigns/new",
	CAMPAIGN: (id: string) => `/newsletter/campaigns/${id}`,
	SETTINGS: "/settings",
};

/** Fysi API paths, relative to /api/v1 (https://fysi-backend-production.up.railway.app/docs). */
export const backendRoutes = {
	// Auth
	SIGN_IN: "/auth/login",
	LOGIN_2FA: "/auth/login/2fa",
	SETUP_2FA: "/auth/2fa/setup",
	ENABLE_2FA: "/auth/2fa/enable",
	REFRESH: "/auth/refresh",
	LOGOUT: "/auth/logout",
	CHANGE_PASSWORD: "/auth/change-password",
	VERIFY_EMAIL: "/auth/verify-email",
	ME: "/auth/me",
	AVATAR: "/auth/me/avatar",
	// Dashboard and money
	DASHBOARD: "/admin/dashboard",
	PAYMENTS: "/admin/payments",
	REFUND_PAYMENT: (id: string) => `/admin/payments/${id}/refund`,
	VENDOR_ORDERS: "/admin/vendor-orders",
	RELEASE_ESCROW: (id: string) => `/admin/vendor-orders/${id}/release`,
	REFUND_VENDOR_ORDER: (id: string) => `/admin/vendor-orders/${id}/refund`,
	/** The tabs say "payouts"; the API's path takes the singular (`payout`, `refund`, `withdrawal`). */
	TRANSFERS: (kind: "payouts" | "refunds" | "withdrawals") => `/admin/transfers/${kind.slice(0, -1)}`,
	RETRY_TRANSFER: (kind: "payouts" | "refunds" | "withdrawals", id: string) =>
		`/admin/transfers/${kind.slice(0, -1)}/${id}/retry`,
	// Vendors
	VENDORS: "/admin/vendors",
	VENDOR: (id: string) => `/admin/vendors/${id}`,
	APPROVE_VENDOR: (id: string) => `/admin/vendors/${id}/approve`,
	REJECT_VENDOR: (id: string) => `/admin/vendors/${id}/reject`,
	SUSPEND_VENDOR: (id: string) => `/admin/vendors/${id}/suspend`,
	REINSTATE_VENDOR: (id: string) => `/admin/vendors/${id}/reinstate`,
	// Catalogue
	PRODUCTS: "/admin/products",
	HIDE_PRODUCT: (id: string) => `/admin/products/${id}/hide`,
	UNHIDE_PRODUCT: (id: string) => `/admin/products/${id}/unhide`,
	REMOVE_PRODUCT: (id: string) => `/admin/products/${id}/remove`,
	CATEGORIES: "/admin/categories",
	CATEGORY: (id: string) => `/admin/categories/${id}`,
	// Accounts and audit
	USERS: "/admin/users",
	USER: (id: string) => `/admin/users/${id}`,
	SUSPENSION: (id: string) => `/admin/users/${id}/suspension`,
	RESET_2FA: (id: string) => `/admin/users/${id}/2fa/reset`,
	AUDIT_LOGS: "/audit-logs",
	// Products for a vendor
	PRODUCT: (id: string) => `/admin/products/${id}`,
	PRODUCT_IMAGES: (id: string) => `/admin/products/${id}/images`,
	PRODUCT_IMAGE: (id: string, imageId: string) => `/admin/products/${id}/images/${imageId}`,
	// Insight, outreach and support
	ANALYTICS: "/admin/analytics",
	EXPORT: (what: ExportKind) => `/admin/exports/${what}.csv`,
	NOTIFICATIONS: "/admin/notifications",
	REVIEWS: "/admin/reviews",
	HIDE_REVIEW: (id: string) => `/admin/reviews/${id}/hide`,
	UNHIDE_REVIEW: (id: string) => `/admin/reviews/${id}/unhide`,
	SUBSCRIBERS: "/admin/newsletter/subscribers",
	CAMPAIGNS: "/admin/campaigns",
	CAMPAIGN: (id: string) => `/admin/campaigns/${id}`,
	CAMPAIGN_ACTION: (id: string, action: "test" | "send" | "cancel") => `/admin/campaigns/${id}/${action}`,
	TICKETS: "/admin/tickets",
	TICKET: (id: string) => `/admin/tickets/${id}`,
	TICKET_MESSAGES: (id: string) => `/admin/tickets/${id}/messages`,
};

export type ExportKind = "users" | "customers" | "vendors" | "orders" | "payments" | "products" | "newsletter" | "tickets";
