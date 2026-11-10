/**
 * TEMPORARY mock, until the external API is connected. On only when NEXT_PUBLIC_MOCK_API=1 (apps/web/.env.local).
 * Delete this file, mock-catalog.ts and the two lines in client.ts when the API is ready.
 *
 * It answers in the browser (no server):
 *   - customer auth: sign in, the one-time code, create account, personal details;
 *   - the catalogue: categories, product lists and product pages (sample data in mock-catalog.ts);
 *   - the newsletter sign-up;
 *   - the demo customer's orders (mock-orders.ts) and Confirm delivery.
 * Every other request goes to the real API as usual. Accounts created here are kept in this browser's localStorage.
 *
 *   Demo account: demo@fysi.ng / Password1
 *   One-time code: 1234
 */
import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { AuthSession, User } from "@/features/auth/types";
import type { DeliveryAddress } from "@/features/checkout/types";
import {
	addReview,
	findProduct,
	listProducts,
	MOCK_CATEGORIES,
	MOCK_PRODUCTS,
	quoteCheckout,
	reviewsFor,
} from "@/lib/api/mock-catalog";
import {
	confirmDelivery,
	findCustomerOrder,
	listCustomerOrders,
	listInbox,
	listPendingReviews,
	markReviewed,
} from "@/lib/api/mock-orders";
import { backendRoutes } from "@/lib/routes";

export const MOCK_CODE = "1234";
const STORE_KEY = "fysi-mock-accounts";
const DELAY_MS = 600;

interface MockAccount {
	user: User;
	password: string;
	address?: DeliveryAddress | null;
	/** Saved product ids, newest first. */
	wishlist?: string[];
}

const now = () => new Date().toISOString();

function makeUser(id: string, identifier: string, fields: Partial<User> = {}): User {
	const isEmail = identifier.includes("@");
	return {
		id,
		email: isEmail ? identifier : "",
		first_name: "",
		last_name: "",
		phone_number: isEmail ? "" : identifier,
		role: "customer",
		email_verified: true,
		is_active: true,
		created_at: now(),
		updated_at: now(),
		...fields,
	};
}

const DEMO: MockAccount = {
	user: makeUser("mock-demo", "demo@fysi.ng", { first_name: "Ada", last_name: "Okafor", phone_number: "+2348012345678" }),
	password: "Password1",
	address: {
		first_name: "Ada",
		last_name: "Okafor",
		address: "50 Togo Street, Victoria Island",
		city: "Lagos",
		zip_code: "101241",
		phone_number: "+2348012345678",
		email: "demo@fysi.ng",
	},
	wishlist: ["prod-1", "prod-6", "prod-11"],
};

function loadAccounts(): MockAccount[] {
	try {
		const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as MockAccount[];
		return [DEMO, ...saved];
	} catch {
		return [DEMO];
	}
}

function saveAccounts(accounts: MockAccount[]) {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(accounts.filter((a) => a.user.id !== DEMO.user.id)));
	} catch {
		// Storage blocked: accounts last until the page reloads.
	}
}

const findByIdentifier = (accounts: MockAccount[], identifier: string) =>
	accounts.find((a) => a.user.email === identifier || a.user.phone_number === identifier);

/** Tokens are "mock-token.<user id>", so the profile endpoints can tell who is calling. */
function sessionFor(user: User, remember = false): AuthSession {
	const days = remember ? 30 : 1;
	return { access_token: `mock-token.${user.id}`, expires_in: Math.floor(Date.now() / 1000) + days * 86400, user };
}

function userFromToken(config: InternalAxiosRequestConfig, accounts: MockAccount[]) {
	const token = String(config.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
	return accounts.find((a) => token === `mock-token.${a.user.id}`);
}

/** JSON and multipart (FormData) bodies alike. Files become their names: nothing is uploaded in mock mode. */
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

/** Returns a reply for the auth requests it knows, or undefined to send the request to the real API. */
function handle(config: InternalAxiosRequestConfig): Reply | undefined {
	const method = (config.method ?? "get").toLowerCase();
	const path = (config.url ?? "").split("?")[0];
	const body = readBody(config.data);
	const accounts = loadAccounts();

	if (method === "post" && path === backendRoutes.SIGN_IN) {
		const account = findByIdentifier(accounts, String(body.email ?? "").toLowerCase());
		if (!account || account.password !== body.password) return fail(401, "That email and password don't match.");
		return ok(sessionFor(account.user, Boolean(body.remember_me)), "Signed in");
	}

	if (method === "post" && path === backendRoutes.REQUEST_CODE) {
		return ok(null, `Mock mode: your code is ${MOCK_CODE}`);
	}

	if (method === "post" && path === backendRoutes.VERIFY_CODE) {
		if (body.code !== MOCK_CODE) return fail(400, `That code didn't work. (Mock mode: use ${MOCK_CODE}.)`);
		const account = findByIdentifier(accounts, body.identifier);
		if (account) return ok({ is_new_user: false, ...sessionFor(account.user) });
		return ok({ is_new_user: true, verification_token: `mock-verify.${body.identifier}` });
	}

	if (method === "post" && path === backendRoutes.SIGN_UP) {
		const identifier = body.identifier;
		if (body.verification_token !== `mock-verify.${identifier}`) return fail(400, "Your code has expired. Start again.");
		if (findByIdentifier(accounts, identifier)) return fail(409, "An account with this email or phone already exists.");
		const account: MockAccount = { user: makeUser(`mock-${Date.now()}`, identifier), password: body.password };
		saveAccounts([...accounts, account]);
		return ok(sessionFor(account.user), "Account created");
	}

	if (path === backendRoutes.PROFILE && method === "put") {
		const account = userFromToken(config, accounts);
		if (!account) return fail(401, "Sign in again.");
		const email = body.email?.trim().toLowerCase();
		if (email && email !== account.user.email && accounts.some((a) => a !== account && a.user.email === email))
			return fail(409, "Another account already uses that email address.");
		account.user = { ...account.user, ...body, ...(email ? { email } : {}), updated_at: now() };
		saveAccounts(accounts);
		return ok(account.user, "Profile updated");
	}

	// The photo lives in this tab only (an object URL); the real API stores the file.
	if (path === backendRoutes.AVATAR && method === "post") {
		const account = userFromToken(config, accounts);
		if (!account) return fail(401, "Sign in again.");
		const photo = config.data instanceof FormData ? config.data.get("photo") : null;
		if (!(photo instanceof File)) return fail(400, "Choose a photo to upload.");
		account.user = { ...account.user, avatar_url: URL.createObjectURL(photo), updated_at: now() };
		saveAccounts(accounts);
		return ok(account.user, "Photo updated");
	}

	if (path === backendRoutes.CHANGE_PASSWORD && method === "post") {
		const account = userFromToken(config, accounts);
		if (!account) return fail(401, "Sign in again.");
		if (body.current_password !== account.password) return fail(400, "Your current password isn't right.");
		account.password = body.new_password;
		saveAccounts(accounts);
		return ok(null, "Password updated");
	}

	// Wishlist (C10).
	const wishItem = path.match(/^\/wishlist\/([^/]+)$/);
	if (path === backendRoutes.WISHLIST || wishItem) {
		const account = userFromToken(config, accounts);
		if (!account) return fail(401, "Sign in to use your wishlist.");
		const ids = account.wishlist ?? [];
		if (method === "get" && !wishItem) {
			const products = ids.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter((p) => p !== undefined);
			return ok(products);
		}
		if (method === "post" && !wishItem) {
			const id = String(body.product_id ?? "");
			if (!MOCK_PRODUCTS.some((p) => p.id === id)) return fail(404, "That product isn't available.");
			account.wishlist = [id, ...ids.filter((x) => x !== id)];
			saveAccounts(accounts);
			return ok(null, "Saved to your wishlist");
		}
		if (method === "delete" && wishItem) {
			account.wishlist = ids.filter((x) => x !== decodeURIComponent(wishItem[1]));
			saveAccounts(accounts);
			return ok(null, "Removed from your wishlist");
		}
	}

	if (path === backendRoutes.ADDRESS && (method === "get" || method === "put")) {
		const account = userFromToken(config, accounts);
		if (!account) return fail(401, "Sign in again.");
		if (method === "get") return ok(account.address ?? null);
		account.address = body as unknown as DeliveryAddress;
		saveAccounts(accounts);
		return ok(account.address, "Address saved");
	}

	if (path === backendRoutes.ME && method === "get") {
		const account = userFromToken(config, accounts);
		return account ? ok(account.user) : fail(401, "Sign in again.");
	}

	// Catalogue.
	if (method === "get" && path === backendRoutes.CATEGORIES) return ok(MOCK_CATEGORIES);
	if (method === "get" && path === backendRoutes.PRODUCTS)
		return ok(listProducts((config.params ?? {}) as Record<string, unknown>));
	const reviewsMatch = path.match(/^\/products\/([^/]+)\/reviews$/);
	if (reviewsMatch && method === "get") {
		const reviews = reviewsFor(decodeURIComponent(reviewsMatch[1]));
		return reviews ? ok(reviews) : fail(404, "We couldn't find that product.");
	}
	if (reviewsMatch && method === "post") {
		const account = userFromToken(config, accounts);
		if (!account) return fail(401, "Sign in to leave a review.");
		const review = body as unknown as { rating?: string; comment?: string; name?: string };
		const author =
			review.name?.trim() ||
			[account.user.first_name, account.user.last_name].filter(Boolean).join(" ") ||
			account.user.email ||
			"Fysi shopper";
		const added = addReview(
			decodeURIComponent(reviewsMatch[1]),
			author,
			Number(review.rating) || 5,
			String(review.comment ?? ""),
		);
		if (added) markReviewed(decodeURIComponent(reviewsMatch[1]));
		return added ? ok(added, "Thanks for your review") : fail(404, "We couldn't find that product.");
	}
	if (method === "get" && path === backendRoutes.PENDING_REVIEWS) {
		if (!userFromToken(config, accounts)) return fail(401, "Sign in again.");
		return ok(listPendingReviews((config.params ?? {}) as Record<string, unknown>));
	}
	if (method === "get" && path.startsWith(`${backendRoutes.PRODUCTS}/`)) {
		const product = findProduct(decodeURIComponent(path.slice(backendRoutes.PRODUCTS.length + 1)));
		return product ? ok(product) : fail(404, "We couldn't find that product.");
	}

	if (method === "post" && path === backendRoutes.NEWSLETTER)
		return ok(null, "You're subscribed. (Mock mode: nothing was sent.)");
	if (method === "post" && path === backendRoutes.SUPPORT_REPORTS)
		return ok({ id: `RP${Date.now().toString().slice(-6)}` }, "Report received (mock mode: nothing was sent)");

	// Checkout: price the cart, then place the order (signed-in customers only).
	const order = body as unknown as Parameters<typeof quoteCheckout>[0] & { payment_method?: string };
	if (method === "post" && path === backendRoutes.CHECKOUT_QUOTE) return ok(quoteCheckout(order));
	if (method === "post" && path === backendRoutes.ORDERS) {
		if (!userFromToken(config, accounts)) return fail(401, "Sign in again to place your order.");
		const quote = quoteCheckout(order);
		if (quote.subtotal === 0) return fail(400, "Your cart is empty.");
		const paymentMethod = order.payment_method === "pay_on_delivery" ? "pay_on_delivery" : "card";
		const placed = {
			id: `FY${Date.now().toString().slice(-8)}`,
			// Mock mode skips the payment provider: card orders count as paid straight away.
			status: paymentMethod === "card" ? "paid" : "processing",
			total: quote.total,
			payment_method: paymentMethod,
			created_at: now(),
		};
		return ok({ order: placed, payment_url: null }, "Order placed");
	}

	// Orders (C7, C8): the demo customer's sample orders.
	const confirmMatch = path.match(/^\/orders\/([^/]+)\/confirm-delivery$/);
	if (confirmMatch && method === "post") {
		if (!userFromToken(config, accounts)) return fail(401, "Sign in again.");
		const result = confirmDelivery(decodeURIComponent(confirmMatch[1]));
		return typeof result === "string" ? fail(422, result) : ok(result, "Delivery confirmed");
	}
	if (method === "get" && path === backendRoutes.INBOX) {
		if (!userFromToken(config, accounts)) return fail(401, "Sign in again.");
		return ok(listInbox((config.params ?? {}) as Record<string, unknown>));
	}

	if (method === "get" && path === backendRoutes.ORDERS) {
		if (!userFromToken(config, accounts)) return fail(401, "Sign in again.");
		return ok(listCustomerOrders((config.params ?? {}) as Record<string, unknown>));
	}
	const orderMatch = path.match(/^\/orders\/([^/]+)$/);
	if (orderMatch && method === "get") {
		if (!userFromToken(config, accounts)) return fail(401, "Sign in again.");
		const found = findCustomerOrder(decodeURIComponent(orderMatch[1]));
		return found ? ok(found) : fail(404, "We couldn't find that order.");
	}

	return undefined;
}

/** An axios adapter: mocked replies for auth, the normal network adapter for everything else. */
export function mockAdapter(): AxiosAdapter {
	const network = axios.getAdapter(axios.defaults.adapter);

	return async (config) => {
		const reply = handle(config);
		if (!reply) return network(config);

		// Auth replies wait a little so loading states show; catalogue reads come back quickly.
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
