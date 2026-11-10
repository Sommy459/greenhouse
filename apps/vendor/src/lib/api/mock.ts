/**
 * TEMPORARY mock for the seller centre, until the external API is connected. On only when NEXT_PUBLIC_MOCK_API=1
 * (apps/vendor/.env.local). Delete this file and its two lines in client.ts when the API is ready.
 *
 * It answers in the browser (no server): vendor sign in; sign-up ("Set up your shop": the e-mail code — always 1234 —
 * and account creation); the vendor's shop (GET /vendor/me, POST /vendor/onboarding); and, for an approved shop, the
 * Dashboard, Manage Products (list, totals, hide / show, delete, export) and Add Products (categories, the shop's
 * certificates, create), Orders (list, tabs, details, status updates, tracking, export), Account Statements (list,
 * details, background exports) and Promotions (list, cancel) from mock-shop.ts.
 * Every other request goes to the real API. Accounts and shops created here are kept in this browser's localStorage.
 *
 *   /sign-up with any new e-mail, code 1234    the full "Set up your shop" flow
 *   new@fysi.ng / Password1     a vendor with no shop yet → /onboarding (shop details only)
 *   vendor@fysi.ng / Password1  a vendor with an approved shop → the seller centre
 *   New shops stay "pending" (the approval page) until an admin approves them; there is no admin here.
 */
import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { AuthSession, User } from "@/features/auth/types";
import type { Shop } from "@/features/shop/types";
import { backendRoutes } from "@/lib/routes";
import {
	cancelPromotion,
	createListing,
	exportCsv,
	findStatement,
	listExports,
	listPromotions,
	promotionPerformance,
	promotionSalesCsv,
	listStatements,
	requestExport,
	DASHBOARD,
	findOrder,
	listOrders,
	listProducts,
	matchOrders,
	orderRows,
	ordersCsv,
	trackOrder,
	updateOrderStatus,
	matchProducts,
	PRODUCT_STATS,
	productsCsv,
	SHOP_CATEGORIES,
	SHOP_CERTIFICATIONS,
	SHOP_PRODUCTS,
} from "@/lib/api/mock-shop";

const STORE_KEY = "fysi-mock-vendors";
/** The sign-up e-mail verification code in mock mode. */
const MOCK_CODE = "1234";
const DELAY_MS = 600;

interface MockVendor {
	user: User;
	password: string;
	shop: Shop | null;
}

const now = () => new Date().toISOString();

function makeUser(id: string, email: string, first_name = "", last_name = ""): User {
	return {
		id,
		email,
		first_name,
		last_name,
		phone_number: "",
		role: "vendor",
		email_verified: true,
		is_active: true,
		created_at: now(),
		updated_at: now(),
	};
}

const DEMOS: MockVendor[] = [
	{ user: makeUser("mock-vendor-new", "new@fysi.ng", "Tolu", "Adebayo"), password: "Password1", shop: null },
	{
		user: makeUser("mock-vendor-approved", "vendor@fysi.ng", "Chidi", "Okeke"),
		password: "Password1",
		shop: {
			id: "mock-shop-1",
			user_id: "mock-vendor-approved",
			shop_name: "GreenLeaf Home",
			slug: "greenleaf-home",
			account_type: "business",
			shipping_zone: "lagos",
			cac_id: "RC1234567",
			cac_certificate_url: null,
			description: "Reusable kitchen and home essentials made from bamboo, steel and organic cotton.",
			country: "NG",
			email: "vendor@fysi.ng",
			city: "Ikeja",
			state: "Lagos",
			status: "approved",
			logo_url: null,
			created_at: now(),
		},
	},
];

/** Demo accounts plus anything saved in this browser (saved copies win, so a demo's new shop survives a reload). */
function loadVendors(): MockVendor[] {
	let saved: MockVendor[] = [];
	try {
		saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as MockVendor[];
	} catch {
		// Storage blocked or corrupt: demos only.
	}
	const ids = new Set(saved.map((v) => v.user.id));
	return [...DEMOS.filter((d) => !ids.has(d.user.id)), ...saved];
}

function saveVendors(vendors: MockVendor[]) {
	try {
		// Keep demos only when they changed (e.g. the new@ demo set up a shop).
		const changed = vendors.filter((v) => {
			const demo = DEMOS.find((d) => d.user.id === v.user.id);
			return !demo || JSON.stringify(demo.shop) !== JSON.stringify(v.shop);
		});
		localStorage.setItem(STORE_KEY, JSON.stringify(changed));
	} catch {
		// Storage blocked: changes last until the page reloads.
	}
}

function sessionFor(user: User): AuthSession {
	return { access_token: `mock-vendor-token.${user.id}`, expires_in: Math.floor(Date.now() / 1000) + 86400, user };
}

function vendorFromToken(config: InternalAxiosRequestConfig, vendors: MockVendor[]) {
	const token = String(config.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
	return vendors.find((v) => token === `mock-vendor-token.${v.user.id}`);
}

const slugify = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

/** JSON bodies and multipart (FormData) bodies alike. Files become their names: nothing is uploaded in mock mode. */
function readBody(data: unknown): Record<string, string> {
	if (typeof FormData !== "undefined" && data instanceof FormData) {
		return Object.fromEntries([...data.entries()].map(([k, v]) => [k, typeof v === "string" ? v : v.name]));
	}
	if (typeof data === "string") return JSON.parse(data || "{}");
	return (data ?? {}) as Record<string, string>;
}

type Reply = { status: number; body: unknown };
const ok = (data: unknown, message = "OK"): Reply => ({ status: 200, body: { status_code: 200, message, data } });
const fail = (status: number, message: string): Reply => ({ status, body: { message } });

function handle(config: InternalAxiosRequestConfig): Reply | undefined {
	const method = (config.method ?? "get").toLowerCase();
	const path = (config.url ?? "").split("?")[0];
	const body = readBody(config.data);
	const vendors = loadVendors();

	if (method === "post" && path === backendRoutes.SIGN_IN) {
		const vendor = vendors.find(
			(v) =>
				v.user.email ===
				String(body.email ?? "")
					.trim()
					.toLowerCase(),
		);
		if (!vendor || vendor.password !== body.password) return fail(401, "That email and password don't match.");
		return ok(sessionFor(vendor.user), "Signed in");
	}

	// Sign-up steps 2–3 (public). Nothing is sent; the code is always MOCK_CODE.
	if (method === "post" && path === backendRoutes.EMAIL_CODE) {
		const email = String(body.email ?? "")
			.trim()
			.toLowerCase();
		if (vendors.some((v) => v.user.email === email))
			return fail(409, "An account with this e-mail already exists. Sign in instead.");
		return ok(null, `Mock mode: your code is ${MOCK_CODE}`);
	}

	if (method === "post" && path === backendRoutes.EMAIL_VERIFY) {
		if (String(body.code) !== MOCK_CODE) return fail(400, `That code didn't work. (Mock mode: use ${MOCK_CODE}.)`);
		return ok({ verification_token: `mock-verify.${String(body.email).toLowerCase()}` }, "E-mail verified");
	}

	// Sign-up step 4: needs the token from the verified code.
	if (method === "post" && path === backendRoutes.SIGN_UP) {
		const email = String(body.email ?? "")
			.trim()
			.toLowerCase();
		if (body.verification_token !== `mock-verify.${email}`) return fail(400, "Your code has expired. Start again.");
		if (vendors.some((v) => v.user.email === email)) return fail(409, "An account with this e-mail already exists.");
		const user = { ...makeUser(`mock-vendor-${Date.now()}`, email), phone_number: body.phone_number, country: body.country };
		const vendor: MockVendor = { user, password: body.password, shop: null };
		saveVendors([...vendors, vendor]);
		return ok(sessionFor(vendor.user), "Account created");
	}

	if (method === "get" && path === backendRoutes.MY_SHOP) {
		const vendor = vendorFromToken(config, vendors);
		return vendor ? ok(vendor.shop) : fail(401, "Sign in again.");
	}

	if (method === "post" && path === backendRoutes.ONBOARDING) {
		const vendor = vendorFromToken(config, vendors);
		if (!vendor) return fail(401, "Sign in again.");
		if (vendor.shop) return fail(409, "You already have a shop.");
		vendor.shop = {
			id: `mock-shop-${Date.now()}`,
			user_id: vendor.user.id,
			shop_name: body.shop_name,
			slug: slugify(body.shop_name),
			account_type: body.account_type === "individual" ? "individual" : "business",
			shipping_zone: body.shipping_zone,
			cac_id: body.cac_id ?? null,
			// The real API returns a link to the stored file; the mock keeps only the file name.
			cac_certificate_url: body.cac_certificate ? `mock-upload://${body.cac_certificate}` : null,
			description: null,
			// The shop takes the country and e-mail given at sign-up.
			country: vendor.user.country ?? "NG",
			email: vendor.user.email,
			city: null,
			state: null,
			status: "pending",
			logo_url: null,
			created_at: now(),
		};
		saveVendors(vendors);
		return ok(vendor.shop, "Shop submitted for approval");
	}

	// The seller centre itself: sample data for a shop that's been approved (see mock-shop.ts).
	const seller = vendorFromToken(config, vendors);
	const selling = seller?.shop?.status === "approved";
	const params = (config.params ?? {}) as Record<string, unknown>;

	if (method === "get" && path === backendRoutes.DASHBOARD) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(
			selling
				? { ...DASHBOARD, recent_orders: orderRows().slice(0, 5) }
				: {
						...DASHBOARD,
						totals: Object.fromEntries(Object.keys(DASHBOARD.totals).map((k) => [k, 0])),
						sales_by_month: DASHBOARD.sales_by_month.map((m) => ({ ...m, revenue: 0, payouts: 0 })),
						active_customers: 0,
						recent_orders: [],
					},
		);
	}

	if (method === "get" && path === backendRoutes.MY_PRODUCT_STATS) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(selling ? PRODUCT_STATS : Object.fromEntries(Object.keys(PRODUCT_STATS).map((k) => [k, 0])));
	}

	if (method === "get" && path === backendRoutes.MY_PRODUCTS) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(selling ? listProducts(params) : { items: [], meta: { page: 1, total_pages: 1, total: 0 } });
	}

	if (method === "get" && path === backendRoutes.MY_ORDERS) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(selling ? listOrders(params) : { items: [], meta: { page: 1, total_pages: 1, total: 0 } });
	}

	if (method === "get" && path === backendRoutes.TRACK_ORDER) {
		if (!seller) return fail(401, "Sign in again.");
		const found = selling ? trackOrder(String(params.q ?? "")) : undefined;
		return found ? ok(found) : fail(404, "No shipment with that ID.");
	}

	if (method === "get" && path === backendRoutes.MY_ORDERS_EXPORT) {
		if (!seller) return fail(401, "Sign in again.");
		return { status: 200, body: ordersCsv(selling ? matchOrders(params) : []) };
	}

	const orderStatus = method === "post" && /^\/vendor\/orders\/([^/]+)\/status$/.exec(path ?? "");
	if (orderStatus) {
		if (!seller) return fail(401, "Sign in again.");
		const updated = updateOrderStatus(decodeURIComponent(orderStatus[1]!), readBody(config.data) as never);
		return typeof updated === "string" ? fail(422, updated) : ok(updated, "Order updated");
	}

	const orderMatch = method === "get" && /^\/vendor\/orders\/([^/]+)$/.exec(path ?? "");
	if (orderMatch && orderMatch[1] !== "export") {
		if (!seller) return fail(401, "Sign in again.");
		const order = findOrder(decodeURIComponent(orderMatch[1]!));
		return order ? ok(order) : fail(404, "That order no longer exists.");
	}

	if (method === "get" && path === backendRoutes.STATEMENTS) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(selling ? listStatements(params) : { items: [], meta: { page: 1, total_pages: 1, total: 0 } });
	}

	if (path === backendRoutes.STATEMENT_EXPORTS && (method === "get" || method === "post")) {
		if (!seller) return fail(401, "Sign in again.");
		if (method === "post")
			return ok(requestExport(readBody(config.data).currency === "usdc" ? "usdc" : "ngn"), "Export requested");
		return ok(listExports(params));
	}

	const exportFile = method === "get" && /^\/vendor\/statements\/exports\/([^/]+)\/file$/.exec(path ?? "");
	if (exportFile) {
		if (!seller) return fail(401, "Sign in again.");
		const csv = exportCsv(decodeURIComponent(exportFile[1]!));
		return csv ? { status: 200, body: csv } : fail(404, "That export isn't ready.");
	}

	const statement = method === "get" && /^\/vendor\/statements\/([^/]+)$/.exec(path ?? "");
	if (statement && statement[1] !== "exports") {
		if (!seller) return fail(401, "Sign in again.");
		const found = findStatement(decodeURIComponent(statement[1]!));
		return found ? ok(found) : fail(404, "That statement doesn't exist.");
	}

	if (method === "get" && path === backendRoutes.PROMOTIONS) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(selling ? listPromotions(params) : { items: [], meta: { page: 1, total_pages: 1, total: 0 } });
	}

	if (method === "get" && path === backendRoutes.PROMOTION_PERFORMANCE) {
		if (!seller) return fail(401, "Sign in again.");
		return ok(selling ? promotionPerformance(params) : promotionPerformance({ ids: "none" }));
	}

	if (method === "get" && path === backendRoutes.PROMOTION_PERFORMANCE_EXPORT) {
		if (!seller) return fail(401, "Sign in again.");
		return { status: 200, body: promotionSalesCsv(selling ? params : { ids: "none" }) };
	}

	const promoCancel = method === "post" && /^\/vendor\/promotions\/([^/]+)\/cancel$/.exec(path ?? "");
	if (promoCancel) {
		if (!seller) return fail(401, "Sign in again.");
		const result = cancelPromotion(decodeURIComponent(promoCancel[1]!));
		return typeof result === "string" ? fail(422, result) : ok(result, "Promotion cancelled");
	}

	if (method === "get" && path === backendRoutes.CATEGORIES) return ok(SHOP_CATEGORIES);

	if (method === "get" && path === backendRoutes.MY_CERTIFICATIONS) {
		return seller ? ok(SHOP_CERTIFICATIONS) : fail(401, "Sign in again.");
	}

	if (method === "post" && path === backendRoutes.MY_PRODUCTS) {
		if (!seller) return fail(401, "Sign in again.");
		if (!selling) return fail(403, "Your shop needs approval before you can list products.");
		if (!(config.data instanceof FormData)) return fail(400, "Send the product as multipart/form-data.");
		const created = createListing(config.data);
		return typeof created === "string" ? fail(422, created) : ok(created, "Product created");
	}

	if (method === "get" && path === backendRoutes.MY_PRODUCTS_EXPORT) {
		if (!seller) return fail(401, "Sign in again.");
		return { status: 200, body: productsCsv(selling ? matchProducts(params) : []) };
	}

	const listing = /^\/vendor\/products\/([^/]+)$/.exec(path ?? "");
	if (listing && listing[1] !== "stats" && listing[1] !== "export" && (method === "patch" || method === "delete")) {
		if (!seller) return fail(401, "Sign in again.");
		const index = SHOP_PRODUCTS.findIndex((p) => p.id === decodeURIComponent(listing[1]!));
		if (index === -1) return fail(404, "That product no longer exists.");
		if (method === "delete") {
			SHOP_PRODUCTS.splice(index, 1);
			return ok(null, "Product deleted");
		}
		const status = readBody(config.data).status;
		if (status !== "active" && status !== "inactive") return fail(422, "Unknown status.");
		SHOP_PRODUCTS[index]!.status = status;
		return ok(SHOP_PRODUCTS[index], "Product updated");
	}

	return undefined;
}

/** An axios adapter: mocked replies for the routes above, the normal network adapter for everything else. */
export function mockAdapter(): AxiosAdapter {
	const network = axios.getAdapter(axios.defaults.adapter);

	return async (config) => {
		const reply = handle(config);
		if (!reply) return network(config);

		await new Promise((resolve) => setTimeout(resolve, config.method === "get" ? 150 : DELAY_MS));
		const response: AxiosResponse = {
			data: reply.body,
			status: reply.status,
			statusText: String(reply.status),
			headers: {},
			config,
		};
		if (reply.status >= 400) {
			throw new AxiosError(`Request failed with status code ${reply.status}`, AxiosError.ERR_BAD_REQUEST, config, null, response);
		}
		return response;
	};
}
