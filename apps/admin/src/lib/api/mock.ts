/**
 * TEMPORARY mock for the admin console, until the external API is connected. On only when NEXT_PUBLIC_MOCK_API=1
 * (apps/admin/.env.local). Delete this file and its two lines in client.ts when the API is ready.
 *
 * It answers in the browser (no server): admin sign in, the Overview dashboard, the product list, categories and
 * "Add Product" (kept until the page reloads; the first photo shows on the card), and orders (list, filters, CSV
 * export, delete, one customer's orders), customers (list, tabs, search, filter, CSV export, delete, details,
 * blacklist), vendors (list, tabs, search, filter, CSV export, status, delete), Analytics, Campaign, Settings
 * (profile and photo) and Help (problem reports). Every other
 * request goes to the real API.
 *
 *   admin@fysi.ng / Password1   an admin → the console
 *   vendor@fysi.ng / Password1  not an admin → refused at sign in
 */
import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { AuthSession, User } from "@/features/auth/types";
import type { AdminCustomer, CustomerDetail } from "@/features/customers/types";
import type { Dashboard } from "@/features/dashboard/types";
import { PAYMENT_LABEL, PERIOD_MS, STATUS_LABEL } from "@/features/orders/options";
import type { AdminOrder, OrderDetail, OrderStatus, PaymentMethod, TrackingStep } from "@/features/orders/types";
import type { AdminProduct } from "@/features/products/types";
import type {
	AdminVendor,
	BadgeType,
	Certification,
	CertificationStatus,
	VendorDetail,
	VendorStatus,
} from "@/features/vendors/types";
import { backendRoutes } from "@/lib/routes";

const DELAY_MS = 600;
const now = () => new Date().toISOString();

function makeUser(id: string, email: string, first_name: string, last_name: string, role: User["role"]): User {
	return {
		id,
		email,
		first_name,
		last_name,
		phone_number: "",
		role,
		email_verified: true,
		is_active: true,
		created_at: now(),
		updated_at: now(),
	};
}

const ACCOUNTS = [
	{ user: makeUser("mock-admin-1", "admin@fysi.ng", "Alison", "Eyo", "admin"), password: "Password1" },
	{ user: makeUser("mock-vendor-approved", "vendor@fysi.ng", "Chidi", "Okeke", "vendor"), password: "Password1" },
];

const sessionFor = (user: User): AuthSession => ({
	access_token: `mock-admin-token.${user.id}`,
	expires_in: Math.floor(Date.now() / 1000) + 86400,
	user,
});

const isAdmin = (config: InternalAxiosRequestConfig) =>
	String(config.headers.get("Authorization") ?? "") === `Bearer mock-admin-token.${ACCOUNTS[0]!.user.id}`;

const DASHBOARD: Dashboard = {
	totals: { revenue: 75500, revenue_change: 10, new_clients: 1500, visited_users: 31500, vendors: 247, orders: 24500 },
	sales_progress: { target: 20000, revenue: 15110, today: 1500, yesterday: 1260, change: 10 },
	sales_by_month: [
		["Jan", 570],
		["Feb", 300],
		["Mar", 680],
		["Apr", 460],
		["May", 570],
		["Jun", 475],
		["Jul", 460],
		["Aug", 850],
		["Sep", 625],
		["Oct", 385],
		["Nov", 570],
		["Dec", 395],
	].map(([month, sales]) => ({ month: month as string, sales: sales as number })),
	best_sellers: [
		{ id: "p1", name: "Bamboo Soap Dish", sold: 20, price: 900, profit: 12900 },
		{ id: "p2", name: "Eco-friendly Pen", sold: 10, price: 900, profit: 12900 },
		{ id: "p3", name: "Eco Tote Bag", sold: 10, price: 900, profit: 12900 },
		{ id: "p4", name: "Dish Scrubbers", sold: 8, price: 700, profit: 9800 },
	],
	website_health: { speed: 30, error: 70 },
};

const BASE_PRODUCTS: Omit<AdminProduct, "id" | "created_at" | "visibility" | "hidden_reason" | "vendor">[] = [
	{
		name: "Bamboo Soap Dish",
		category: "Health and Beauty",
		price: 2500,
		image_url: "/images/products/black-soap.jpg",
		sold: 1269,
		quantity: 2000,
		description: "An ecofriendly soap that can cleanse your body and give that fragrant smell on your body all day long.",
	},
	{
		name: "Eco Tote Bag",
		category: "Fashion",
		price: 2500,
		image_url: "/images/products/canvas-tote.jpg",
		sold: 1269,
		quantity: 2000,
		description: "An eco-friendly tote bag to cater for all your shopping needs",
	},
	{
		name: "Dish Scrubbers",
		category: "Home & Office",
		price: 2500,
		image_url: "/images/products/bamboo-dish-brush.jpg",
		sold: 1269,
		quantity: 2000,
		description: "Want to give your cookwares a sparkling scent, get this dish scrubber for your home and keep it clean.",
	},
	{
		name: "Bamboo Toothbrush",
		category: "Health and Beauty",
		price: 1200,
		image_url: "/images/products/bamboo-toothbrush.jpg",
		sold: 860,
		quantity: 1500,
		description: "A biodegradable bamboo handle with soft charcoal bristles.",
	},
	{
		name: "Steel Water Bottle",
		category: "Kitchen",
		price: 6500,
		image_url: "/images/products/steel-bottle.jpg",
		sold: 412,
		quantity: 600,
		description: "Keeps drinks cold for a day and replaces hundreds of plastic bottles.",
	},
	{
		name: "Beeswax Wraps",
		category: "Kitchen",
		price: 4000,
		image_url: "/images/products/beeswax-wraps.jpg",
		sold: 530,
		quantity: 900,
		description: "Washable food wraps that replace cling film.",
	},
	{
		name: "Soy Wax Candle",
		category: "Household",
		price: 5500,
		image_url: "/images/products/soy-candle.jpg",
		sold: 220,
		quantity: 450,
		description: "Hand-poured soy candle with a cotton wick and a clean burn.",
	},
	{
		name: "Eco-friendly Pen",
		category: "Home & Office",
		price: 900,
		image_url: "/images/products/pen-notebook.jpg",
		sold: 1840,
		quantity: 2600,
		description: "A refillable pen with a recycled-paper barrel.",
	},
	{
		name: "Coconut Bowl",
		category: "Kitchen",
		price: 3000,
		image_url: "/images/products/coconut-bowl.jpg",
		sold: 310,
		quantity: 700,
		description: "Polished coconut shell bowls, each one unique.",
	},
	{
		name: "Mesh Produce Bags",
		category: "Household",
		price: 2000,
		image_url: "/images/products/produce-bags.jpg",
		sold: 975,
		quantity: 1200,
		description: "Reusable cotton mesh bags for fruit and vegetables.",
	},
	{
		name: "Raw Shea Butter",
		category: "Health and Beauty",
		price: 3500,
		image_url: "/images/products/shea-butter.jpg",
		sold: 1105,
		quantity: 1300,
		description: "Unrefined shea butter from women's cooperatives in the north.",
	},
	{
		name: "Wooden Spoon Set",
		category: "Kitchen",
		price: 4500,
		image_url: "/images/products/wooden-spoons.jpg",
		sold: 268,
		quantity: 500,
		description: "Three hand-carved spoons from sustainably felled wood.",
	},
];

/** 60 products a day apart (newest first). Page 1 repeats the Figma's three; later pages cycle all twelve. */
const PRODUCTS: AdminProduct[] = Array.from({ length: 60 }, (_, i) => {
	const base = i < 9 ? BASE_PRODUCTS[i % 3]! : BASE_PRODUCTS[i % BASE_PRODUCTS.length]!;
	return {
		...base,
		id: `mock-product-${i + 1}`,
		created_at: new Date(Date.now() - i * 86400000).toISOString(),
		// Every eleventh is hidden by an admin; shops are attached once the sample vendors exist (below).
		visibility: i % 11 === 7 ? "hidden" : "visible",
		hidden_reason: i % 11 === 7 ? "The eco claim on this listing isn't backed by a certificate yet." : null,
		vendor: null,
	};
});

const FIRST_NAMES = [
	"John",
	"Amaka",
	"Tunde",
	"Zainab",
	"Chinedu",
	"Funmi",
	"Ibrahim",
	"Ngozi",
	"Kemi",
	"Emeka",
	"Halima",
	"Segun",
	"Blessing",
	"Uche",
	"Aisha",
	"Femi",
];
const LAST_NAMES = [
	"Bushmill",
	"Obi",
	"Bakare",
	"Musa",
	"Eze",
	"Adeyemi",
	"Sani",
	"Okafor",
	"Alabi",
	"Nwosu",
	"Bello",
	"Ogunleye",
	"Okon",
	"Danjuma",
];
const CUSTOMER_COUNT = 180;
const DAY = 86400000;

/** Sample customer k (0 = newest): the same name, e-mail and phone on the customer list, their page and their orders. */
function customerIdentity(k: number) {
	const first_name = FIRST_NAMES[k % FIRST_NAMES.length]!;
	const last_name = LAST_NAMES[(k * 3) % LAST_NAMES.length]!;
	return {
		id: `mock-customer-${k + 1}`,
		first_name,
		last_name,
		email: `${first_name}${last_name[0]}${k > 15 ? k : ""}@gmail.com`.toLowerCase(),
		phone_number: `+23481${String(79731772 - k * 4127).padStart(8, "0")}`,
	};
}

/** How long ago customer k signed up: about twenty in the last 30 days (the "New Customers" tab), then every four days. */
const accountAgeDays = (k: number) => (k < 20 ? 0.5 + k * 1.4 : 30 + (k - 19) * 4);

/**
 * Who placed an order of this age: someone whose account is older than the order. Orders go to the 30 oldest-enough
 * customers in turn, so regulars have pages of history while many others have none yet.
 */
function customerForOrder(i: number, ageDays: number) {
	let first = 0;
	while (first < CUSTOMER_COUNT - 1 && accountAgeDays(first) < ageDays) first++;
	return first + ((i * 7) % Math.min(30, CUSTOMER_COUNT - first));
}

const PAYMENTS: PaymentMethod[] = [
	"visa",
	"transfer",
	"mastercard",
	"ussd",
	"mastercard",
	"transfer",
	"visa",
	"mastercard",
	"verve",
	"pay_on_delivery",
];
/** Mostly delivered, as a real shop would be; the first eight follow the Figma. */
const STATUSES: OrderStatus[] = [
	"shipped",
	"delivered",
	"cancelled",
	"shipped",
	"failed",
	"returned",
	"delivered",
	"failed",
	"delivered",
	"delivered",
	"processing",
	"pending",
	"delivered",
	"shipped",
];

const ADDRESSES = [
	"124, Magodo Estate, Lekki, Lagos, Nigeria, 5432",
	"7 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria, 900288",
	"22 Ogui Road, Enugu, Nigeria, 400001",
	"15 Bodija Road, Ibadan, Oyo, Nigeria, 200284",
];
const MIN = 60000;

/** Order Tracking for a status: the steps so far are done, the rest upcoming; cancelled and failed orders stop. */
function trackingFor(status: OrderStatus, placed: number): TrackingStep[] {
	const at = (minutes: number) => new Date(placed + minutes * MIN).toISOString();
	const steps: [string, number][] = [
		["Your order has been received", 0],
		["Order accepted by vendor", 20],
		["Rider is on his way", 140],
		["Order in transit", 180],
		["Order delivered successfully", 200],
	];
	const doneCount = { pending: 1, processing: 2, shipped: 4, delivered: 5, returned: 5, cancelled: 1, failed: 1 }[status];
	const tracking: TrackingStep[] = steps.map(([label, minutes], i) => ({
		label,
		state: i < doneCount ? "done" : "upcoming",
		at: at(minutes),
	}));
	if (status === "cancelled") return [tracking[0]!, { label: "Order cancelled", state: "stopped", at: at(45) }];
	if (status === "failed") return [tracking[0]!, { label: "Payment failed", state: "stopped", at: at(2) }];
	if (status === "returned") return [...tracking, { label: "Order returned", state: "done", at: at(3 * 24 * 60) }];
	return tracking;
}

/** 240 orders, newest first: the first few inside the last day, then spread over about sixteen months. */
const ORDER_DETAILS: OrderDetail[] = Array.from({ length: 240 }, (_, i) => {
	// The newest are placed a few hours ago, so their finished tracking steps are in the past.
	const age = i < 3 ? (5 + i * 4) * 3600000 : (i - 2) * 2 * 86400000 + ((i * 37) % 24) * 3600000;
	const placed = Date.now() - age;
	const items = Array.from({ length: ((i * 7) % 5) + 1 }, (_, k) => {
		const product = BASE_PRODUCTS[(i * 5 + k * 5) % BASE_PRODUCTS.length]!;
		return {
			id: `item-${i}-${k}`,
			name: product.name,
			image_url: product.image_url,
			quantity: ((i + k) % 3) + 1,
			price: product.price,
		};
	});
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const shipping = i % 4 === 3 ? 0 : 250 + ((i * 50) % 1000);
	const status = STATUSES[i % STATUSES.length]!;
	const k = customerForOrder(i, age / DAY);
	const who = customerIdentity(k);
	return {
		id: `mock-order-${i + 1}`,
		number: String(3020123495 - i * 17),
		created_at: new Date(placed).toISOString(),
		customer_id: who.id,
		recipient: {
			name: `${who.first_name} ${who.last_name}`,
			phone_number: who.phone_number,
			email: who.email,
			address: ADDRESSES[k % ADDRESSES.length]!,
		},
		items,
		subtotal,
		vat_rate: 0,
		vat: 0,
		shipping,
		total: subtotal + shipping,
		payment_method: PAYMENTS[i % PAYMENTS.length]!,
		shipping_method: shipping === 0 ? "pickup" : "door_delivery",
		status,
		tracking: trackingFor(status, placed),
	};
});

const toListItem = (o: OrderDetail): AdminOrder => ({
	id: o.id,
	number: o.number,
	first_item: { name: o.items[0]!.name, image_url: o.items[0]!.image_url },
	other_items: o.items.length - 1,
	customer: { id: o.customer_id, name: o.recipient.name },
	created_at: o.created_at,
	total: o.total,
	payment_method: o.payment_method,
	status: o.status,
});

const ORDERS: AdminOrder[] = ORDER_DETAILS.map(toListItem);

function matchOrders(params: Record<string, unknown>) {
	const ids = String(params.ids ?? "")
		.split(",")
		.filter(Boolean);
	if (ids.length) return ORDERS.filter((o) => ids.includes(o.id));
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	const payments = String(params.payment ?? "")
		.split(",")
		.filter(Boolean);
	const customer = params.customer ? String(params.customer) : null;
	const period = String(params.period ?? "all");
	let from = params.from ? new Date(`${String(params.from)}T00:00:00`).getTime() : -Infinity;
	const to = params.to ? new Date(`${String(params.to)}T00:00:00`).getTime() + 86400000 : Infinity;
	if (!params.from && !params.to && period in PERIOD_MS) from = Date.now() - PERIOD_MS[period as keyof typeof PERIOD_MS];
	const matches = ORDERS.filter((o) => {
		const t = new Date(o.created_at).getTime();
		return (
			t >= from &&
			t < to &&
			(!customer || o.customer.id === customer) &&
			(!statuses.length || statuses.includes(o.status)) &&
			(!payments.length || payments.includes(o.payment_method))
		);
	});
	if (params.sort === "product_asc") matches.sort((a, b) => a.first_item.name.localeCompare(b.first_item.name));
	if (params.sort === "product_desc") matches.sort((a, b) => b.first_item.name.localeCompare(a.first_item.name));
	return matches;
}

function ordersCsv(orders: AdminOrder[]) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const rows = orders.map((o) =>
		[
			o.number,
			o.first_item.name,
			o.other_items,
			o.customer.name,
			o.created_at.slice(0, 10),
			o.total,
			PAYMENT_LABEL[o.payment_method],
			STATUS_LABEL[o.status],
		]
			.map(cell)
			.join(","),
	);
	return ["Order ID,Product,Other items,Customer,Date,Total (NGN),Payment method,Status", ...rows].join("\r\n");
}

/** 180 customers, newest first; one in four is blocked. Their order counts come from the sample orders above. */
const CUSTOMER_ACCOUNTS: AdminCustomer[] = Array.from({ length: CUSTOMER_COUNT }, (_, i) => {
	const who = customerIdentity(i);
	return {
		...who,
		avatar_url: null,
		orders_count: ORDERS.filter((o) => o.customer.id === who.id).length,
		balance: ((i * 2900) % 30000) + (i % 3 === 0 ? 0 : 900),
		created_at: new Date(Date.now() - accountAgeDays(i) * DAY).toISOString(),
		status: i % 4 === 0 ? "blocked" : "active",
	};
});

/** The customer details page: the list fields plus the profile card and the three totals. */
function customerDetail(c: AdminCustomer): CustomerDetail {
	const k = Number(c.id.replace("mock-customer-", "")) - 1;
	const orders = ORDERS.filter((o) => o.customer.id === c.id);
	return {
		...c,
		// Counted live, so a deleted order drops out.
		orders_count: orders.length,
		code: `ID-${String(11221 + k).padStart(6, "0")}`,
		username: `${c.first_name}${c.last_name}${k}`,
		address: ADDRESSES[k % ADDRESSES.length]!,
		last_order_at: orders[0]?.created_at ?? null,
		subscribed: k % 3 !== 1,
		rewards_points: orders.reduce((sum, o) => sum + Math.floor(o.total / 100), 0),
		changes: { balance: k % 2 ? -25 : 12, orders: 10, rewards_points: 10 },
	};
}

function matchCustomers(params: Record<string, unknown>) {
	const ids = String(params.ids ?? "")
		.split(",")
		.filter(Boolean);
	if (ids.length) return CUSTOMER_ACCOUNTS.filter((c) => ids.includes(c.id));
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	const newSince = params.tab === "new" ? Date.now() - 30 * 86400000 : -Infinity;
	return CUSTOMER_ACCOUNTS.filter(
		(c) =>
			new Date(c.created_at).getTime() >= newSince &&
			(!statuses.length || statuses.includes(c.status)) &&
			(!search || `${c.first_name} ${c.last_name} ${c.email} ${c.phone_number}`.toLowerCase().includes(search)),
	);
}

function customersCsv(customers: AdminCustomer[]) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const rows = customers.map((c) =>
		[`${c.first_name} ${c.last_name}`, c.email, c.phone_number, c.orders_count, c.balance, c.created_at.slice(0, 10), c.status]
			.map(cell)
			.join(","),
	);
	return ["Name,Email,Phone,Orders,Balance (NGN),Date created,Status", ...rows].join("\r\n");
}

const SHOP_WORDS = ["Green", "Eco", "Leaf", "Bamboo", "Earth", "Kora", "Ankara", "Shea", "Palm", "Sabi", "Oasis", "Calabash"];
const SHOP_KINDS = ["Living", "Naturals", "Threads", "Home", "Goods", "Craft", "Essentials", "Studio"];
const VENDOR_COUNT = 64;

/**
 * 64 vendors, newest first. The six newest await verification, every ninth is rejected, one in four of the rest is
 * blocked (suspended). Only approved or suspended shops have listings and a balance.
 */
const VENDOR_ACCOUNTS: AdminVendor[] = Array.from({ length: VENDOR_COUNT }, (_, i) => {
	const first = FIRST_NAMES[(i * 5 + 3) % FIRST_NAMES.length]!;
	const last = LAST_NAMES[(i * 7 + 2) % LAST_NAMES.length]!;
	const status: VendorStatus = i < 6 ? "pending" : i % 9 === 0 ? "rejected" : i % 4 === 1 ? "suspended" : "approved";
	const selling = status === "approved" || status === "suspended";
	const product = BASE_PRODUCTS[(i * 3) % BASE_PRODUCTS.length]!;
	const listings = selling ? 1 + ((i * 7) % 18) : 0;
	return {
		id: `mock-vendor-${i + 1}`,
		shop_name: `${SHOP_WORDS[i % SHOP_WORDS.length]} ${SHOP_KINDS[(i * 3) % SHOP_KINDS.length]}`,
		owner_name: `${first} ${last}`,
		email: `${first}${last[0]}${i > 11 ? i : ""}@gmail.com`.toLowerCase(),
		avatar_url: null,
		first_product: selling ? { name: product.name, image_url: product.image_url } : null,
		other_products: Math.max(0, listings - 1),
		sku_count: listings * (2 + (i % 5)),
		balance: selling ? ((i * 12900) % 250000) + 4500 : 0,
		created_at: new Date(Date.now() - (i < 10 ? 0.6 + i * 2.7 : 30 + (i - 9) * 6) * DAY).toISOString(),
		status,
	};
});

// The sample products belong to approved sample shops.
PRODUCTS.forEach((p, i) => {
	const shops = VENDOR_ACCOUNTS.filter((v) => v.status === "approved");
	const shop = shops[(i * 3) % shops.length]!;
	p.vendor = { id: shop.id, shop_name: shop.shop_name };
});

function matchVendors(params: Record<string, unknown>) {
	const ids = String(params.ids ?? "")
		.split(",")
		.filter(Boolean);
	if (ids.length) return VENDOR_ACCOUNTS.filter((v) => ids.includes(v.id));
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	const newSince = params.tab === "new" ? Date.now() - 30 * DAY : -Infinity;
	return VENDOR_ACCOUNTS.filter(
		(v) =>
			new Date(v.created_at).getTime() >= newSince &&
			(!statuses.length || statuses.includes(v.status)) &&
			(!search || `${v.shop_name} ${v.owner_name} ${v.email}`.toLowerCase().includes(search)),
	);
}

function vendorsCsv(vendors: AdminVendor[]) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const rows = vendors.map((v) =>
		[
			v.shop_name,
			v.owner_name,
			v.email,
			v.other_products + (v.first_product ? 1 : 0),
			v.sku_count,
			v.balance,
			v.created_at.slice(0, 10),
			v.status,
		]
			.map(cell)
			.join(","),
	);
	return ["Shop,Owner,Email,Products,SKUs,Balance (NGN),Date created,Status", ...rows].join("\r\n");
}

/** Vendor details: what each sample vendor submitted, plus decisions made here (kept until the page reloads). */
const CERT_SOURCES: { name: string; issuer: string; badge: BadgeType }[] = [
	{ name: "GOTS organic textile", issuer: "Global Organic Textile Standard", badge: "certified" },
	{ name: "FSC chain of custody", issuer: "Forest Stewardship Council", badge: "certified" },
	{ name: "SON product certificate", issuer: "Standards Organisation of Nigeria", badge: "certified" },
	{ name: "Sourcing and materials evidence", issuer: "Submitted by the vendor", badge: "fysi_reviewed" },
	{ name: "OEKO-TEX Standard 100", issuer: "OEKO-TEX", badge: "certified" },
];
const VENDOR_CATEGORIES = ["Clothing", "Household items", "Beauty and personal care", "Office supplies", "Outdoor and travel"];
const VENDOR_DECISIONS = new Map<
	string,
	{ decided_at: string; rejection_reason: string | null; suspension_reason: string | null }
>();
const VENDOR_CERTS = new Map<string, Certification[]>();

function vendorCerts(v: AdminVendor, k: number): Certification[] {
	let certs = VENDOR_CERTS.get(v.id);
	if (!certs) {
		const howMany = k % 5 === 2 ? 0 : 1 + (k % 2);
		certs = Array.from({ length: howMany }, (_, j) => {
			const source = CERT_SOURCES[(k + j * 2) % CERT_SOURCES.length]!;
			const status: CertificationStatus =
				v.status === "pending" ? "pending" : v.status === "rejected" ? "rejected" : j === 0 ? "verified" : "pending";
			return {
				id: `${v.id}-cert-${j + 1}`,
				vendor_id: v.id,
				product_id: null,
				...source,
				document_url: null,
				status,
				reviewed_at: status === "pending" ? null : v.created_at,
				created_at: v.created_at,
			};
		});
		VENDOR_CERTS.set(v.id, certs);
	}
	return certs;
}

function vendorDetail(v: AdminVendor): VendorDetail {
	const k = Number(v.id.replace("mock-vendor-", "")) - 1;
	const selling = v.status === "approved" || v.status === "suspended";
	const business = k % 3 !== 1;
	const listed = selling ? v.other_products + (v.first_product ? 1 : 0) : 0;
	const decision = VENDOR_DECISIONS.get(v.id);
	return {
		...v,
		code: `VND-${String(231 + k).padStart(6, "0")}`,
		phone_number: `+23480${String(31144270 + k * 7919).slice(0, 8)}`,
		business_address: ADDRESSES[(k * 2) % ADDRESSES.length]!,
		category: VENDOR_CATEGORIES[k % VENDOR_CATEGORIES.length]!,
		account_type: business ? "business" : "individual",
		cac: business ? { number: `RC${1234567 + k * 311}`, certificate_url: null } : null,
		director_id: k % 7 === 3 ? null : { type: k % 2 ? "bvn" : "nin", last4: String(4821 + k * 13).slice(-4) },
		certifications: vendorCerts(v, k),
		// The wallet exists from the first approval (PRD V4), so suspended shops keep theirs.
		wallet: selling ? { available: v.balance, pending: Math.round(v.balance * 0.35) } : null,
		products_count: listed,
		recent_products: Array.from({ length: Math.min(5, listed) }, (_, j) => {
			const p = BASE_PRODUCTS[(k * 3 + j) % BASE_PRODUCTS.length]!;
			return { id: `${v.id}-p${j + 1}`, name: p.name, image_url: p.image_url, price: p.price, stock: (k * 7 + j * 11) % 40 };
		}),
		submitted_at: v.created_at,
		decided_at: decision?.decided_at ?? (v.status === "pending" ? null : v.created_at),
		rejection_reason:
			decision?.rejection_reason ??
			(v.status === "rejected" ? "The CAC certificate is unreadable. Upload a clearer scan and resubmit." : null),
		suspension_reason: decision?.suspension_reason ?? null,
	};
}

/** The Analytics page: sales per bar for a period, its split by category (Figma legend), and the best sellers. */
const ANALYTICS_CATEGORIES = ["Household items", "Office supplies", "Personal Care", "Kitchen supplies", "Clothing"];
const CATEGORY_WEIGHTS = [0.24, 0.12, 0.17, 0.09, 0.38];
const MONTHLY_SALES = [28500, 14600, 33800, 22600, 28500, 23200, 22600, 42300, 31100, 19300, 28500, 19800];

function salesAnalytics(period: string) {
	const today = new Date();
	let sales: { label: string; amount: number }[];
	if (period === "daily") {
		sales = Array.from({ length: 14 }, (_, i) => {
			const day = new Date(today.getTime() - (13 - i) * DAY);
			return {
				label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
				amount: 600 + ((i * 2731 + 900) % 3400),
			};
		});
	} else if (period === "weekly") {
		sales = Array.from({ length: 12 }, (_, i) => {
			const start = new Date(today.getTime() - (11 - i) * 7 * DAY);
			return {
				label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
				amount: 4200 + ((i * 5113 + 1700) % 9800),
			};
		});
	} else {
		sales = MONTHLY_SALES.map((amount, i) => ({
			label: new Date(2000, i, 1).toLocaleDateString("en-GB", { month: "short" }),
			amount,
		}));
	}
	const total = sales.reduce((sum, s) => sum + s.amount, 0);
	const by_category = ANALYTICS_CATEGORIES.map((category, i) => ({
		category,
		amount: Math.round(total * CATEGORY_WEIGHTS[i]!),
	})).sort((a, b) => b.amount - a.amount);
	return { period, total, sales, by_category };
}

const LOCATIONS = ["Ikorodu, Lagos", "Yaba, Lagos", "Wuse, Abuja", "Lekki, Lagos", "Garki, Abuja", "Ibadan, Oyo", "Enugu"];

/** 40 best-selling products, most sold first; each from an approved sample vendor. */
const BEST_SELLERS = Array.from({ length: 40 }, (_, i) => {
	const product = BASE_PRODUCTS[i % BASE_PRODUCTS.length]!;
	const vendor = VENDOR_ACCOUNTS.filter((v) => v.status === "approved")[(i * 5) % 20]!;
	return {
		id: `mock-best-${i + 1}`,
		name: product.name,
		image_url: product.image_url,
		category: ANALYTICS_CATEGORIES[(i * 3) % ANALYTICS_CATEGORIES.length]!,
		sold: 980 - i * 21,
		rating: Math.max(3, 5 - (i % 7) * 0.3),
		vendor: { id: vendor.id, shop_name: vendor.shop_name, location: LOCATIONS[i % LOCATIONS.length]!, avatar_url: null },
		// Spread over the last ~4 months, for the date filter.
		sold_at: new Date(Date.now() - ((i * 3) % 120) * DAY).toISOString(),
	};
});

function listBestSellers(params: Record<string, unknown>) {
	const categories = String(params.category ?? "")
		.split(",")
		.filter(Boolean);
	const from = params.from ? new Date(String(params.from)).getTime() : -Infinity;
	const to = params.to ? new Date(String(params.to)).getTime() + DAY : Infinity;
	const matches = BEST_SELLERS.filter((p) => {
		const t = new Date(p.sold_at).getTime();
		return (!categories.length || categories.includes(p.category)) && t >= from && t < to;
	});
	const limit = Number(params.limit) || 6;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

function analyticsCsv(period: string) {
	const report = salesAnalytics(period);
	const rows = [
		"Period,Amount (NGN)",
		...report.sales.map((s) => `"${s.label}",${s.amount}`),
		`"Total",${report.total}`,
		"",
		"Category,Amount (NGN)",
		...report.by_category.map((c) => `"${c.category}",${c.amount}`),
	];
	return rows.join("\r\n");
}

/** The Campaign page: 48 vendor ads, newest first, from approved or suspended sample vendors. */
const SELLING_VENDORS = VENDOR_ACCOUNTS.filter((v) => v.status === "approved" || v.status === "suspended");
const ADS = Array.from({ length: 48 }, (_, i) => {
	const vendor = SELLING_VENDORS[(i * 7) % SELLING_VENDORS.length]!;
	const impressions = 60 + ((i * 397) % 940);
	return {
		id: `mock-ad-${i + 1}`,
		vendor: { id: vendor.id, shop_name: vendor.shop_name, location: LOCATIONS[i % LOCATIONS.length]! },
		impressions,
		clicks: Math.round(impressions * (0.03 + (i % 6) * 0.012)),
		category: ANALYTICS_CATEGORIES[(i * 2) % ANALYTICS_CATEGORIES.length]!,
		status: (i < 30 ? (i % 7 === 3 ? "paused" : "online") : "ended") as "online" | "paused" | "ended",
		created_at: new Date(Date.now() - (0.4 + i * 2.5) * DAY).toISOString(),
		vendor_created_at: vendor.created_at,
	};
});

function matchAds(params: Record<string, unknown>) {
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	const categories = String(params.category ?? "")
		.split(",")
		.filter(Boolean);
	const newSince = params.tab === "new" ? Date.now() - 30 * DAY : -Infinity;
	const from = params.from ? new Date(String(params.from)).getTime() : -Infinity;
	const to = params.to ? new Date(String(params.to)).getTime() + DAY : Infinity;
	return ADS.filter((ad) => {
		const t = new Date(ad.created_at).getTime();
		return (
			new Date(ad.vendor_created_at).getTime() >= newSince &&
			(!statuses.length || statuses.includes(ad.status)) &&
			(!categories.length || categories.includes(ad.category)) &&
			(!search || ad.vendor.shop_name.toLowerCase().includes(search)) &&
			t >= from &&
			t < to
		);
	});
}

/** Impressions per bar: the sales chart's shape, scaled to the share of ads that match. */
function campaignStats(params: Record<string, unknown>) {
	const period = String(params.period ?? "monthly");
	const matches = matchAds(params);
	const share = matches.length / ADS.length;
	const shape = salesAnalytics(period).sales;
	const peak = Math.max(...shape.map((s) => s.amount));
	return {
		period,
		impressions: matches.length ? shape.map((s) => ({ label: s.label, value: Math.round((s.amount / peak) * 43 * share) })) : [],
		change_today: matches.length ? 2 : 0,
		advertisers: new Set(matches.map((ad) => ad.vendor.id)).size,
	};
}

const TRAFFIC = {
	today: { new_vendors: 3, conversion_rate: 4.2, bounce_rate: 38.5 },
	week: { new_vendors: 14, conversion_rate: 3.8, bounce_rate: 41.2 },
	month: { new_vendors: 55, conversion_rate: 3.5, bounce_rate: 43.9 },
};

function adsCsv(ads: typeof ADS) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const rows = ads.map((ad) =>
		[ad.vendor.shop_name, ad.vendor.location, ad.impressions, ad.clicks, ad.category, ad.status, ad.created_at.slice(0, 10)]
			.map(cell)
			.join(","),
	);
	return ["Store,Location,Impressions,Clicks,Category,Status,Started", ...rows].join("\r\n");
}

/** Settings: the demo admin's own details; changes last until the page reloads. */
const PROFILE = {
	id: "mock-admin-1",
	first_name: "Alison",
	last_name: "Eyo",
	email: "admin@fysi.ng",
	phone_number: "+2348179731772",
	gender: "female" as "female" | "male" | null,
	admin_code: "ADM-0001",
	address: "58, Mafoluku Street, Oshodi, Lagos.",
	avatar_url: null as string | null,
};

/** Settings → Notification: the demo admin's e-mail choices. */
const NOTIFICATION_PREFS = { vendor_onboarding: true, customer_onboarding: true, comments: true };

/** Help: 26 problem reports, newest first. */
const TICKET_SUBJECTS = [
	"Not been able to receive product",
	"Item arrived damaged",
	"Wrong item delivered",
	"Paid but order still pending",
	"Product not as described",
	"Want to return an item",
];
const TICKETS = Array.from({ length: 26 }, (_, i) => ({
	id: `mock-ticket-${i + 1}`,
	product_code: i % 9 === 4 ? null : `EC${2010631 + i * 137}`,
	customer_code: `AE${642096 + i * 59}`,
	subject: TICKET_SUBJECTS[i % TICKET_SUBJECTS.length]!,
	status: (i < 6 ? "open" : i < 11 ? "in_progress" : "resolved") as "open" | "in_progress" | "resolved",
	category: i % 9 === 4 ? null : ANALYTICS_CATEGORIES[i % ANALYTICS_CATEGORIES.length]!,
	created_at: new Date(Date.now() - (0.3 + i * 1.7) * DAY).toISOString(),
}));

const matchTickets = (params: Record<string, unknown>) => {
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	return TICKETS.filter((t) => !statuses.length || statuses.includes(t.status));
};

/** Category names; ones created here last until the page reloads. */
const CATEGORIES = [...new Set(BASE_PRODUCTS.map((p) => p.category))];

const categoryFor = (name: string) => {
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	return { id: `mock-category-${slug}`, name, slug };
};

type Reply = { status: number; body: unknown };
const ok = (data: unknown, message = "OK"): Reply => ({ status: 200, body: { status_code: 200, message, data } });
const fail = (status: number, message: string): Reply => ({ status, body: { message } });

/** JSON bodies and multipart (FormData) bodies alike. Files become their names: nothing is uploaded in mock mode. */
function readBody(data: unknown): Record<string, string> {
	if (typeof FormData !== "undefined" && data instanceof FormData) {
		return Object.fromEntries([...data.entries()].map(([k, v]) => [k, typeof v === "string" ? v : v.name]));
	}
	if (typeof data === "string") return JSON.parse(data || "{}");
	return (data ?? {}) as Record<string, string>;
}

function listProducts(params: Record<string, unknown>) {
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const from = params.from ? new Date(String(params.from)).getTime() : -Infinity;
	// "to" is a date: include the whole day.
	const to = params.to ? new Date(String(params.to)).getTime() + 86400000 : Infinity;
	const limit = Number(params.limit) || 9;
	const visibilities = String(params.visibility ?? "")
		.split(",")
		.filter(Boolean);
	const matches = PRODUCTS.filter((p) => {
		const t = new Date(p.created_at).getTime();
		return (
			(!search || `${p.name} ${p.category} ${p.vendor?.shop_name ?? ""}`.toLowerCase().includes(search)) &&
			(!visibilities.length || visibilities.includes(p.visibility)) &&
			t >= from &&
			t < to
		);
	});
	const sorters: Record<string, (a: AdminProduct, b: AdminProduct) => number> = {
		best_selling: (a, b) => b.sold - a.sold,
		price_low: (a, b) => a.price - b.price,
		price_high: (a, b) => b.price - a.price,
	};
	const sorter = sorters[String(params.sort)];
	if (sorter) matches.sort(sorter);
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

function handle(config: InternalAxiosRequestConfig): Reply | undefined {
	const method = (config.method ?? "get").toLowerCase();
	const path = (config.url ?? "").split("?")[0];

	if (method === "post" && path === backendRoutes.SIGN_IN) {
		const body = readBody(config.data);
		const account = ACCOUNTS.find(
			(a) =>
				a.user.email ===
				String(body.email ?? "")
					.trim()
					.toLowerCase(),
		);
		if (!account || account.password !== body.password) return fail(401, "That email and password don't match.");
		return ok(sessionFor(account.user), "Signed in");
	}

	if (method === "get" && path === backendRoutes.ORDERS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const params = (config.params ?? {}) as Record<string, unknown>;
		const matches = matchOrders(params);
		const limit = Number(params.limit) || 10;
		const totalPages = Math.max(1, Math.ceil(matches.length / limit));
		const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
		return ok({
			items: matches.slice((page - 1) * limit, page * limit),
			meta: { page, total_pages: totalPages, total: matches.length },
		});
	}

	if (method === "get" && path === backendRoutes.ORDERS_EXPORT) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		// A file, not the JSON envelope.
		return { status: 200, body: ordersCsv(matchOrders((config.params ?? {}) as Record<string, unknown>)) };
	}

	const orderMatch = /^\/admin\/orders\/([^/]+)$/.exec(path ?? "");
	if (orderMatch && orderMatch[1] !== "export" && (method === "get" || method === "delete")) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const id = decodeURIComponent(orderMatch[1]!);
		const index = ORDERS.findIndex((o) => o.id === id);
		if (index === -1) return fail(404, "That order no longer exists.");
		if (method === "get") return ok(ORDER_DETAILS.find((o) => o.id === id));
		ORDERS.splice(index, 1);
		return ok(null, "Order deleted");
	}

	if (method === "get" && path === backendRoutes.CUSTOMERS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const params = (config.params ?? {}) as Record<string, unknown>;
		const matches = matchCustomers(params);
		const limit = Number(params.limit) || 8;
		const totalPages = Math.max(1, Math.ceil(matches.length / limit));
		const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
		return ok({
			items: matches.slice((page - 1) * limit, page * limit),
			meta: { page, total_pages: totalPages, total: matches.length },
		});
	}

	if (method === "get" && path === backendRoutes.CUSTOMERS_EXPORT) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return { status: 200, body: customersCsv(matchCustomers((config.params ?? {}) as Record<string, unknown>)) };
	}

	const statusMatch = method === "post" && /^\/admin\/customers\/([^/]+)\/status$/.exec(path ?? "");
	if (statusMatch) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const customer = CUSTOMER_ACCOUNTS.find((c) => c.id === decodeURIComponent(statusMatch[1]!));
		if (!customer) return fail(404, "That customer no longer exists.");
		const status = readBody(config.data).status;
		if (status !== "active" && status !== "blocked") return fail(422, "Status must be active or blocked.");
		customer.status = status;
		return ok(customerDetail(customer), status === "blocked" ? "Customer blacklisted" : "Customer restored");
	}

	const customerMatch = /^\/admin\/customers\/([^/]+)$/.exec(path ?? "");
	if (customerMatch && customerMatch[1] !== "export" && (method === "get" || method === "delete")) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const index = CUSTOMER_ACCOUNTS.findIndex((c) => c.id === decodeURIComponent(customerMatch[1]!));
		if (index === -1) return fail(404, "That customer no longer exists.");
		if (method === "get") return ok(customerDetail(CUSTOMER_ACCOUNTS[index]!));
		CUSTOMER_ACCOUNTS.splice(index, 1);
		return ok(null, "Customer deleted");
	}

	if (path === backendRoutes.PROFILE && (method === "get" || method === "put")) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		if (method === "get") return ok({ ...PROFILE });
		const body = readBody(config.data) as Partial<typeof PROFILE>;
		if (!body.first_name || !body.last_name || !body.email) return fail(422, "First name, last name and e-mail are required.");
		Object.assign(PROFILE, {
			first_name: body.first_name,
			last_name: body.last_name,
			email: body.email,
			phone_number: body.phone_number ?? "",
			gender: body.gender ?? null,
			address: body.address ?? "",
		});
		return ok({ ...PROFILE }, "Profile updated");
	}

	if (path === backendRoutes.NOTIFICATION_PREFS && (method === "get" || method === "put")) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		if (method === "put") {
			const body = readBody(config.data) as unknown as Record<string, unknown>;
			for (const key of Object.keys(NOTIFICATION_PREFS) as (keyof typeof NOTIFICATION_PREFS)[]) {
				if (typeof body[key] === "boolean") NOTIFICATION_PREFS[key] = body[key];
			}
		}
		return ok({ ...NOTIFICATION_PREFS }, "Notification settings saved");
	}

	if (path === backendRoutes.PROFILE_AVATAR && (method === "post" || method === "delete")) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		if (PROFILE.avatar_url) URL.revokeObjectURL(PROFILE.avatar_url);
		const file = method === "post" && config.data instanceof FormData ? config.data.get("avatar") : null;
		if (method === "post" && !(file instanceof File)) return fail(422, "Choose an image.");
		// A local preview of the chosen file; the real API returns a link to the stored image.
		PROFILE.avatar_url = file instanceof File ? URL.createObjectURL(file) : null;
		return ok({ ...PROFILE }, method === "post" ? "Photo updated" : "Photo removed");
	}

	if (method === "get" && path === backendRoutes.SUPPORT_TICKETS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const params = (config.params ?? {}) as Record<string, unknown>;
		const matches = matchTickets(params);
		const limit = Number(params.limit) || 8;
		const totalPages = Math.max(1, Math.ceil(matches.length / limit));
		const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
		return ok({
			items: matches.slice((page - 1) * limit, page * limit),
			meta: { page, total_pages: totalPages, total: matches.length },
		});
	}

	if (method === "get" && path === backendRoutes.SUPPORT_TICKETS_EXPORT) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const cell = (v: string | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
		const rows = matchTickets((config.params ?? {}) as Record<string, unknown>).map((t) =>
			[t.product_code, t.customer_code, t.subject, t.status, t.category, t.created_at.slice(0, 10)].map(cell).join(","),
		);
		return { status: 200, body: ["Product ID,Customer ID,Subject,Status,Category,Reported", ...rows].join("\r\n") };
	}

	if (method === "get" && path === backendRoutes.CAMPAIGN_STATS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return ok(campaignStats((config.params ?? {}) as Record<string, unknown>));
	}

	if (method === "get" && path === backendRoutes.CAMPAIGN_TRAFFIC) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const range = String((config.params as Record<string, unknown> | undefined)?.range ?? "today") as keyof typeof TRAFFIC;
		return ok({ range, ...(TRAFFIC[range] ?? TRAFFIC.today) });
	}

	if (method === "get" && path === backendRoutes.CAMPAIGN_ADS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const params = (config.params ?? {}) as Record<string, unknown>;
		const matches = matchAds(params);
		const limit = Number(params.limit) || 6;
		const totalPages = Math.max(1, Math.ceil(matches.length / limit));
		const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
		return ok({
			items: matches.slice((page - 1) * limit, page * limit),
			meta: { page, total_pages: totalPages, total: matches.length },
		});
	}

	if (method === "get" && path === backendRoutes.CAMPAIGNS_EXPORT) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return { status: 200, body: adsCsv(matchAds((config.params ?? {}) as Record<string, unknown>)) };
	}

	if (method === "get" && path === backendRoutes.ANALYTICS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return ok(salesAnalytics(String((config.params as Record<string, unknown> | undefined)?.period ?? "monthly")));
	}

	if (method === "get" && path === backendRoutes.ANALYTICS_BEST_SELLERS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return ok(listBestSellers((config.params ?? {}) as Record<string, unknown>));
	}

	if (method === "get" && path === backendRoutes.ANALYTICS_EXPORT) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return {
			status: 200,
			body: analyticsCsv(String((config.params as Record<string, unknown> | undefined)?.period ?? "monthly")),
		};
	}

	if (method === "get" && path === backendRoutes.VENDORS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const params = (config.params ?? {}) as Record<string, unknown>;
		const matches = matchVendors(params);
		const limit = Number(params.limit) || 8;
		const totalPages = Math.max(1, Math.ceil(matches.length / limit));
		const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
		return ok({
			items: matches.slice((page - 1) * limit, page * limit),
			meta: { page, total_pages: totalPages, total: matches.length },
		});
	}

	if (method === "get" && path === backendRoutes.VENDORS_EXPORT) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		return { status: 200, body: vendorsCsv(matchVendors((config.params ?? {}) as Record<string, unknown>)) };
	}

	const vendorStatusMatch = method === "post" && /^\/admin\/vendors\/([^/]+)\/status$/.exec(path ?? "");
	if (vendorStatusMatch) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const vendor = VENDOR_ACCOUNTS.find((v) => v.id === decodeURIComponent(vendorStatusMatch[1]!));
		if (!vendor) return fail(404, "That vendor no longer exists.");
		const body = readBody(config.data);
		const status = body.status as VendorStatus;
		if (!["pending", "approved", "suspended", "rejected"].includes(status)) return fail(422, "Unknown status.");
		const reason = String(body.reason ?? "").trim();
		if (status === "rejected" && reason.length < 10) return fail(422, "Give the vendor a reason they can act on.");
		vendor.status = status;
		VENDOR_DECISIONS.set(vendor.id, {
			decided_at: now(),
			rejection_reason: status === "rejected" ? reason : null,
			suspension_reason: status === "suspended" ? reason || null : null,
		});
		return ok(vendorDetail(vendor), "Vendor updated");
	}

	const certMatch = method === "post" && /^\/admin\/certifications\/([^/]+)\/status$/.exec(path ?? "");
	if (certMatch) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const id = decodeURIComponent(certMatch[1]!);
		const cert = [...VENDOR_CERTS.values()].flat().find((c) => c.id === id);
		if (!cert) return fail(404, "That certificate no longer exists.");
		const status = readBody(config.data).status as CertificationStatus;
		if (!["pending", "verified", "rejected", "revoked"].includes(status)) return fail(422, "Unknown status.");
		cert.status = status;
		cert.reviewed_at = now();
		return ok(cert, "Certificate updated");
	}

	const vendorMatch = /^\/admin\/vendors\/([^/]+)$/.exec(path ?? "");
	if (vendorMatch && vendorMatch[1] !== "export" && (method === "get" || method === "delete")) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const index = VENDOR_ACCOUNTS.findIndex((v) => v.id === decodeURIComponent(vendorMatch[1]!));
		if (index === -1) return fail(404, "That vendor no longer exists.");
		if (method === "get") return ok(vendorDetail(VENDOR_ACCOUNTS[index]!));
		VENDOR_ACCOUNTS.splice(index, 1);
		return ok(null, "Vendor deleted");
	}

	if (method === "get" && path === backendRoutes.CATEGORIES) {
		return isAdmin(config)
			? ok(CATEGORIES.map((name) => ({ ...categoryFor(name), description: null, thumbnail_url: null })))
			: fail(401, "Sign in again.");
	}

	if (method === "post" && path === backendRoutes.PRODUCTS) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		if (!(config.data instanceof FormData)) return fail(400, "Send the product as multipart/form-data.");
		const data = config.data;
		const text = (key: string) => String(data.get(key) ?? "").trim();
		const category = CATEGORIES.find((name) => categoryFor(name).id === text("category_id"));
		if (!text("name") || !category || !text("price")) return fail(422, "Name, category and price are required.");
		const photos = data.getAll("images").filter((v): v is File => v instanceof File);
		if (photos.length === 0) return fail(422, "Add at least one product photo.");
		const variants = JSON.parse(text("variants") || "[]") as { quantity: number }[];
		const product: AdminProduct = {
			id: `mock-product-${Date.now()}`,
			name: text("name"),
			category,
			price: Number(text("price")),
			description: text("description"),
			// A link to the photo in this browser's memory: nothing is uploaded in mock mode.
			image_url: URL.createObjectURL(photos[0]!),
			sold: 0,
			quantity: variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0),
			created_at: now(),
			visibility: "visible",
			hidden_reason: null,
			// Added by Fysi itself, not a shop.
			vendor: null,
		};
		PRODUCTS.unshift(product);
		return ok(product, "Product created");
	}

	const visibilityMatch = method === "post" && /^\/admin\/products\/([^/]+)\/visibility$/.exec(path ?? "");
	if (visibilityMatch) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const product = PRODUCTS.find((p) => p.id === decodeURIComponent(visibilityMatch[1]!));
		if (!product) return fail(404, "That product no longer exists.");
		const body = readBody(config.data);
		const reason = String(body.reason ?? "").trim();
		if (body.visibility === "hidden" && reason.length < 10) return fail(422, "Give the vendor a reason.");
		if (body.visibility !== "hidden" && body.visibility !== "visible") return fail(422, "Unknown visibility.");
		product.visibility = body.visibility;
		product.hidden_reason = body.visibility === "hidden" ? reason : null;
		return ok(product, "Product updated");
	}

	const productMatch = method === "delete" && /^\/admin\/products\/([^/]+)$/.exec(path ?? "");
	if (productMatch) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const index = PRODUCTS.findIndex((p) => p.id === decodeURIComponent(productMatch[1]!));
		if (index === -1) return fail(404, "That product no longer exists.");
		if (String(readBody(config.data).reason ?? "").trim().length < 10) return fail(422, "Give the vendor a reason.");
		PRODUCTS.splice(index, 1);
		return ok(null, "Product removed");
	}

	if (method === "post" && path === backendRoutes.CATEGORIES) {
		if (!isAdmin(config)) return fail(401, "Sign in again.");
		const body = readBody(config.data);
		const name = String(body.name ?? "").trim();
		if (!name) return fail(422, "Give the category a name.");
		if (CATEGORIES.some((c) => c.toLowerCase() === name.toLowerCase()))
			return fail(409, `A category called "${name}" already exists.`);
		CATEGORIES.push(name);
		const category = {
			...categoryFor(name),
			description: body.description || null,
			// The real API returns a link to the stored file; the mock keeps only the file name.
			thumbnail_url: body.thumbnail ? `mock-upload://${body.thumbnail}` : null,
		};
		return ok(category, "Category created");
	}

	if (method === "get" && path === backendRoutes.DASHBOARD) return isAdmin(config) ? ok(DASHBOARD) : fail(401, "Sign in again.");
	if (method === "get" && path === backendRoutes.PRODUCTS) {
		return isAdmin(config) ? ok(listProducts((config.params ?? {}) as Record<string, unknown>)) : fail(401, "Sign in again.");
	}

	return undefined;
}

/** An axios adapter: mocked replies for the routes above, the normal network adapter for everything else. */
export function mockAdapter(): AxiosAdapter {
	const network = axios.getAdapter(axios.defaults.adapter);

	return async (config) => {
		const reply = handle(config);
		if (!reply) return network(config);

		await new Promise((resolve) => setTimeout(resolve, config.method === "get" ? 250 : DELAY_MS));
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
