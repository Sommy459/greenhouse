/** Every admin console URL. Build links from these, never by hand. */

export const authRoutes = {
	SIGN_IN: "/sign-in",
};

export const consoleRoutes = {
	OVERVIEW: "/",
	PRODUCTS: "/products",
	NEW_PRODUCT: "/products/new",
	PRODUCT: (productId: string) => `/products/${productId}`,
	ORDERS: "/orders",
	/** The Order Details dialog, over the order list (Figma). */
	ORDER: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}`,
	/** The same dialog, scrolled to Order Tracking. */
	TRACK_ORDER: (orderId: string) => `/orders?order=${encodeURIComponent(orderId)}&section=tracking`,
	CUSTOMERS: "/customers",
	CUSTOMER: (customerId: string) => `/customers/${customerId}`,
	VENDORS: "/vendors",
	VENDOR: (vendorId: string) => `/vendors/${vendorId}`,
	/** Old link to the verification queue; redirects to VENDOR_QUEUE. */
	VERIFICATION: "/verification",
	/** The verification queue (PRD A1): the vendor list filtered to Pending. */
	VENDOR_QUEUE: "/vendors?status=pending",
	ANALYTICS: "/analytics",
	CAMPAIGNS: "/campaigns",
	SETTINGS: "/settings",
	/** E-mail notification switches (Figma "Notification"); reached from the bell and the account menu. */
	NOTIFICATION_SETTINGS: "/settings/notifications",
	HELP: "/help",
};

/** API paths (relative to /api/v1). */
export const backendRoutes = {
	SIGN_IN: "/auth/login",
	STATS: "/admin/stats",
	/** The Overview dashboard: totals, sales by month, sales progress, best sellers, site health. */
	DASHBOARD: "/admin/dashboard",
	PRODUCTS: "/admin/products",
	/** DELETE with `{ reason }`: remove a listing for good (PRD A5). */
	PRODUCT: (productId: string) => `/admin/products/${productId}`,
	/** POST `{ visibility: "visible" | "hidden", reason? }`: hide from the store or show again. */
	PRODUCT_VISIBILITY: (productId: string) => `/admin/products/${productId}/visibility`,
	CATEGORIES: "/admin/categories",
	ORDERS: "/admin/orders",
	ORDER: (orderId: string) => `/admin/orders/${orderId}`,
	/** The same filters as ORDERS (or `ids`), answered as a CSV file. */
	ORDERS_EXPORT: "/admin/orders/export",
	CUSTOMERS: "/admin/customers",
	CUSTOMER: (customerId: string) => `/admin/customers/${customerId}`,
	/** Blacklist (blocked) or restore (active). */
	CUSTOMER_STATUS: (customerId: string) => `/admin/customers/${customerId}/status`,
	/** The same filters as CUSTOMERS (or `ids`), answered as a CSV file. */
	CUSTOMERS_EXPORT: "/admin/customers/export",
	VENDORS: "/admin/vendors",
	VENDOR: (vendorId: string) => `/admin/vendors/${vendorId}`,
	/** Approve, reject (with `reason`), suspend or reactivate. */
	VENDOR_STATUS: (vendorId: string) => `/admin/vendors/${vendorId}/status`,
	/** The same filters as VENDORS (or `ids`), answered as a CSV file. */
	VENDORS_EXPORT: "/admin/vendors/export",
	/** Overall Sales and Sales Report: `period` = daily | weekly | monthly. */
	ANALYTICS: "/admin/analytics",
	ANALYTICS_BEST_SELLERS: "/admin/analytics/best-sellers",
	/** The same `period`, answered as a CSV file. */
	ANALYTICS_EXPORT: "/admin/analytics/export",
	/** Campaign page: impressions per period (`period`, `tab`, `search`, `status`). */
	CAMPAIGN_STATS: "/admin/campaigns/stats",
	/** `range` = today | week | month. */
	CAMPAIGN_TRAFFIC: "/admin/campaigns/traffic",
	CAMPAIGN_ADS: "/admin/campaigns/ads",
	/** The same filters as CAMPAIGN_ADS, answered as a CSV file. */
	CAMPAIGNS_EXPORT: "/admin/campaigns/export",
	/** The signed-in admin's own details (Settings): GET, PUT. */
	PROFILE: "/admin/profile",
	/** POST (multipart `avatar`) to replace, DELETE to remove. */
	PROFILE_AVATAR: "/admin/profile/avatar",
	/** GET, PUT `{ vendor_onboarding, customer_onboarding, comments }`. */
	NOTIFICATION_PREFS: "/admin/profile/notifications",
	/** Customer problem reports (Help); the storefront's Report a Problem creates them. */
	SUPPORT_TICKETS: "/admin/support/tickets",
	/** The same list, answered as a CSV file. */
	SUPPORT_TICKETS_EXPORT: "/admin/support/tickets/export",
	CERTIFICATIONS: "/admin/certifications",
	CERTIFICATION_STATUS: (certificationId: string) => `/admin/certifications/${certificationId}/status`,
};
