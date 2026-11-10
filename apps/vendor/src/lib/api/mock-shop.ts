/**
 * TEMPORARY sample data for the mock seller centre (see mock.ts): the Dashboard, Manage Products, Add Products and Orders
 * of an approved shop. Changes (hide, show, delete, new listings, order status) last until the page reloads. Delete with mock.ts.
 */
import type { VendorDashboard } from "@/features/dashboard/types";
import type { Promotion, PromotionSale, PromotionStatus, PromotionSummary } from "@/features/promotions/types";
import type {
	Currency,
	Money,
	Statement,
	StatementDetail,
	StatementEntry,
	StatementExport,
	StatementStatus,
} from "@/features/statements/types";
import {
	PAYMENT_METHODS,
	type OrderDetail,
	type OrderStatus,
	type StatusUpdate,
	type TrackingStep,
	type VendorOrder,
} from "@/features/orders/types";
import { stockState, type ProductStats, type ShopCertification, type VendorProduct } from "@/features/products/types";
import { asset } from "@/lib/site";

const DAY = 86400000;

/** Product names with the sample photo that fits (public/images/products, copied for the mock). */
const CATALOGUE: [string, string][] = [
	["Bamboo Soap Dish", "black-soap.jpg"],
	["Eco Tote Bag", "canvas-tote.jpg"],
	["Bamboo Dish Brush", "bamboo-dish-brush.jpg"],
	["Fragrant Shea Cream", "shea-butter.jpg"],
	["Beeswax Food Wraps", "beeswax-wraps.jpg"],
	["Coconut Bowl", "coconut-bowl.jpg"],
	["Wooden Spoon Set", "wooden-spoons.jpg"],
	["Bamboo Toothbrush", "bamboo-toothbrush.jpg"],
	["Recycled Notebook & Pen", "pen-notebook.jpg"],
	["Mesh Produce Bags", "produce-bags.jpg"],
	["Soy Wax Candle", "soy-candle.jpg"],
	["Steel Water Bottle", "steel-bottle.jpg"],
];
const NAMES = CATALOGUE.map(([name]) => name);
const photo = (i: number) => asset(`/images/products/${CATALOGUE[i % CATALOGUE.length]![1]}`);
const CATEGORIES = ["Health & Care", "Household items", "Clothing", "Office supplies", "Kitchen supplies"];

/** 172 listings, newest first (the Figma count). Every 9th is hidden by you, every 23rd by Fysi, every 7th sold out. */
export const SHOP_PRODUCTS: VendorProduct[] = Array.from({ length: 172 }, (_, i) => ({
	id: `mock-listing-${i + 1}`,
	name: NAMES[i % NAMES.length]!,
	variants_count: i % 4 === 0 ? 1 + (i % 3) : 0,
	sku: String(302012 + i * 17),
	price: 2500 + ((i * 1300) % 14000),
	category: CATEGORIES[i % CATEGORIES.length]!,
	quantity: i % 7 === 3 ? 0 : 5 + ((i * 37) % 120),
	status: i % 9 === 4 ? "inactive" : "active",
	moderation:
		i % 23 === 11
			? {
					reason: "The eco claim isn't backed by a certificate yet. Upload one in Settings.",
					at: new Date(Date.now() - i * DAY).toISOString(),
				}
			: null,
	image_url: photo(i),
	created_at: new Date(Date.now() - i * 0.9 * DAY).toISOString(),
}));

export const PRODUCT_STATS: ProductStats = {
	total: 75500,
	total_change: 10,
	sold: 31500,
	sold_change: 15,
	refunded: 247,
	refunded_change: 0,
	cancelled: 500,
	cancelled_change: -25,
};

const STATUSES: OrderStatus[] = [
	"paid",
	"shipped",
	"delivered",
	"cancelled",
	"processing",
	"delivery_failed",
	"returned",
	"delivered",
	"paid",
	"shipped",
];
const CUSTOMERS = [
	["Tunde Onakoya", "+2348092054532", "tundeonakoya@outlook.com", "124, Magodo Estate, Lekki, Lagos, Nigeria, 5432"],
	["Grace Ajayi", "+2348031144270", "grace.ajayi@gmail.com", "12, Admiralty Way, Lekki Phase 1, Lagos"],
	["Aisha Musa", "+2348125550198", "aisha.musa@yahoo.com", "8, Aminu Kano Crescent, Wuse 2, Abuja"],
	["Chinedu Okeke", "+2347064412290", "chinedu.okeke@gmail.com", "3, Ogui Road, Enugu"],
] as const;
const COURIERS = ["GIG Logistics", "Kwik Delivery", "DHL Nigeria"];

/** Every order's full record; the list rows are worked out from these. */
const ORDER_RECORDS: OrderDetail[] = Array.from({ length: 40 }, (_, i): OrderDetail => {
	const status = STATUSES[i % STATUSES.length]!;
	const created = Date.now() - (0.2 + i * 1.3) * DAY;
	const itemCount = 1 + (i % 4);
	const items = Array.from({ length: itemCount }, (_, j) => {
		const k = (i * 3 + j) % CATALOGUE.length;
		return {
			id: `mock-order-${i + 1}-item-${j + 1}`,
			name: CATALOGUE[k]![0],
			image_url: photo(k),
			quantity: 1 + ((i + j) % 3),
			price: 1500 + ((k * 900) % 6000),
		};
	});
	const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
	const shipping = i % 5 === 0 ? 0 : 250;
	const total = subtotal + shipping;
	const commissionRate = 5;
	const commission = Math.round(subtotal * (commissionRate / 100));
	const who = CUSTOMERS[i % CUSTOMERS.length]!;
	const shipped = ["shipped", "delivered", "delivery_failed", "returned"].includes(status);
	return {
		id: `mock-order-${i + 1}`,
		number: `FY${3020123495 - i * 7311}`,
		created_at: new Date(created).toISOString(),
		recipient: { name: who[0], phone_number: who[1], email: who[2], address: who[3] },
		items,
		subtotal,
		vat_rate: 0,
		vat: 0,
		shipping,
		total,
		payment_method: PAYMENT_METHODS[i % PAYMENT_METHODS.length]!,
		shipping_method: i % 6 === 5 ? "pickup" : "door_delivery",
		status,
		tracking: [],
		shipment: shipped ? { courier: COURIERS[i % COURIERS.length]!, tracking_number: `TRK-${4471932 + i * 13}` } : null,
		// A made-up 64-character hash (Stellar transaction ids are 32 bytes in hex).
		payment: {
			tx_hash: Array.from({ length: 64 }, (_, h) => "0123456789abcdef"[(i * 7 + h * 13) % 16]).join(""),
			network: "testnet",
		},
		commission_rate: commissionRate,
		commission,
		payout: total - commission,
		payout_status: status === "delivered" ? "released" : status === "cancelled" || status === "returned" ? "refunded" : "held",
		cancel_reason: status === "cancelled" ? "The customer asked to cancel before it was packed." : null,
	};
}).map((o) => ({ ...o, tracking: trackingFor(o) }));

/** Figma Order Tracking steps for an order's status (times count on from when it was placed). */
function trackingFor(o: Pick<OrderDetail, "status" | "created_at">): TrackingStep[] {
	const at = (minutes: number) => new Date(new Date(o.created_at).getTime() + minutes * 60000).toISOString();
	const reached = ["paid", "processing", "shipped", "delivered"].indexOf(o.status);
	const step = (label: string, n: number, minutes: number): TrackingStep => ({
		label,
		state: reached >= n ? "done" : "upcoming",
		at: at(minutes),
	});
	const steps = [
		step("Your order has been received", 0, 0),
		step("Order accepted by vendor", 1, 20),
		step("Rider is on his way", 2, 140),
		step("Order in transit", 2, 180),
		step("Order delivered successfully", 3, 200),
	];
	if (o.status === "cancelled") return [steps[0]!, { label: "Order cancelled", state: "stopped", at: at(30) }];
	if (o.status === "delivery_failed")
		return [
			...steps.slice(0, 4).map((s) => ({ ...s, state: "done" as const })),
			{ label: "Delivery failed", state: "stopped", at: at(220) },
		];
	if (o.status === "returned")
		return [
			...steps.map((s) => ({ ...s, state: "done" as const })),
			{ label: "Returned and refunded", state: "stopped", at: at(3000) },
		];
	return steps;
}

const toRow = (o: OrderDetail): VendorOrder => ({
	id: o.id,
	number: o.number,
	first_item: { name: o.items[0]!.name, image_url: o.items[0]!.image_url },
	other_items: o.items.length - 1,
	items_count: o.items.reduce((sum, it) => sum + it.quantity, 0),
	created_at: o.created_at,
	total: o.total,
	payment_method: o.payment_method,
	status: o.status,
	shipment: o.shipment,
});

/** GET /vendor/orders/track?q=: by tracking number or order ID (with or without "FY"). */
export function trackOrder(q: string) {
	const wanted = q.trim().toUpperCase();
	if (!wanted) return undefined;
	return ORDER_RECORDS.find(
		(o) => o.shipment?.tracking_number.toUpperCase() === wanted || o.number === wanted || o.number === `FY${wanted}`,
	);
}

export const orderRows = () => ORDER_RECORDS.map(toRow);
export const findOrder = (id: string) => ORDER_RECORDS.find((o) => o.id === id);

export function matchOrders(params: Record<string, unknown>) {
	const ids = String(params.ids ?? "")
		.split(",")
		.filter(Boolean);
	if (ids.length) return orderRows().filter((o) => ids.includes(o.id));
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	const tab = String(params.tab ?? "");
	const from = params.from ? new Date(String(params.from)).getTime() : -Infinity;
	const to = params.to ? new Date(String(params.to)).getTime() + DAY : Infinity;
	const rows = orderRows().filter((o) => {
		const t = new Date(o.created_at).getTime();
		return (
			(!tab || o.status === tab) &&
			(!statuses.length || statuses.includes(o.status)) &&
			(!search || `${o.number} ${o.first_item.name}`.toLowerCase().includes(search)) &&
			t >= from &&
			t < to
		);
	});
	if (params.sort === "product_asc") rows.sort((a, b) => a.first_item.name.localeCompare(b.first_item.name));
	if (params.sort === "product_desc") rows.sort((a, b) => b.first_item.name.localeCompare(a.first_item.name));
	return rows;
}

export function listOrders(params: Record<string, unknown>) {
	const matches = matchOrders(params);
	const limit = Number(params.limit) || 8;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

/** POST /vendor/orders/:id/status, with the same rules as the UI (NEXT_STATUSES). Returns the order or an error. */
export function updateOrderStatus(id: string, body: StatusUpdate): OrderDetail | string {
	const order = findOrder(id);
	if (!order) return "That order no longer exists.";
	const allowed: Record<OrderStatus, OrderStatus[]> = {
		paid: ["processing", "cancelled"],
		processing: ["shipped", "cancelled"],
		shipped: ["delivered", "delivery_failed"],
		delivery_failed: ["shipped", "cancelled"],
		delivered: [],
		cancelled: [],
		returned: [],
	};
	if (!allowed[order.status].includes(body.status)) return `A ${order.status} order can't become ${body.status}.`;
	if (body.status === "shipped" && (!body.courier?.trim() || !body.tracking_number?.trim()))
		return "Add the courier and tracking number.";
	if (body.status === "cancelled" && (body.reason ?? "").trim().length < 10) return "Give a reason for cancelling.";
	order.status = body.status;
	if (body.status === "shipped")
		order.shipment = { courier: body.courier!.trim(), tracking_number: body.tracking_number!.trim() };
	if (body.status === "cancelled") {
		order.cancel_reason = body.reason!.trim();
		order.payout_status = "refunded";
	}
	if (body.status === "delivered") order.payout_status = "held";
	order.tracking = trackingFor(order);
	return order;
}

export function ordersCsv(rows: VendorOrder[]) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const lines = rows.map((o) =>
		[o.number, o.first_item.name, o.other_items, o.items_count, o.created_at.slice(0, 10), o.total, o.payment_method, o.status]
			.map(cell)
			.join(","),
	);
	return ["Order ID,Product,Other products,Items,Date,Total (NGN),Payment method,Status", ...lines].join("\r\n");
}

const REVENUE = [560, 300, 680, 450, 560, 480, 450, 850, 620, 380, 570, 390];
const PAYOUTS = [520, 270, 640, 410, 500, 455, 430, 780, 600, 350, 540, 300];

export const DASHBOARD: VendorDashboard = {
	totals: {
		revenue: 755000,
		revenue_change: 10,
		skus: 31500,
		skus_change: 15,
		avg_order_value: 24700,
		avg_order_value_change: 0,
		balance: 245000,
		balance_change: -25,
	},
	sales_by_month: REVENUE.map((r, i) => ({
		month: new Date(2000, i, 1).toLocaleDateString("en-GB", { month: "short" }),
		revenue: r * 1000,
		payouts: PAYOUTS[i]! * 1000,
	})),
	active_customers: 40,
	// Filled in live by mock.ts, so status changes show.
	recent_orders: [],
};

const SORTERS: Record<string, (a: VendorProduct, b: VendorProduct) => number> = {
	name_asc: (a, b) => a.name.localeCompare(b.name),
	name_desc: (a, b) => b.name.localeCompare(a.name),
	sku_asc: (a, b) => a.sku.localeCompare(b.sku),
	sku_desc: (a, b) => b.sku.localeCompare(a.sku),
	quantity_asc: (a, b) => a.quantity - b.quantity,
	quantity_desc: (a, b) => b.quantity - a.quantity,
};

export function matchProducts(params: Record<string, unknown>) {
	const ids = String(params.ids ?? "")
		.split(",")
		.filter(Boolean);
	if (ids.length) return SHOP_PRODUCTS.filter((p) => ids.includes(p.id));
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const states = String(params.state ?? "")
		.split(",")
		.filter(Boolean);
	const from = params.from ? new Date(String(params.from)).getTime() : -Infinity;
	const to = params.to ? new Date(String(params.to)).getTime() + DAY : Infinity;
	const matches = SHOP_PRODUCTS.filter((p) => {
		const t = new Date(p.created_at).getTime();
		return (
			(!search || `${p.name} ${p.sku}`.toLowerCase().includes(search)) &&
			(!states.length || states.includes(stockState(p))) &&
			t >= from &&
			t < to
		);
	});
	const sorter = SORTERS[String(params.sort)];
	return sorter ? [...matches].sort(sorter) : matches;
}

export function listProducts(params: Record<string, unknown>) {
	const matches = matchProducts(params);
	const limit = Number(params.limit) || 6;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

/** Storefront categories (the PRD's six launch categories). */
export const SHOP_CATEGORIES = [
	"Clothing",
	"Household items",
	"Beauty and personal care",
	"Eco-friendly gadgets",
	"Office supplies",
	"Outdoor and travel",
].map((name, i) => ({ id: `mock-category-${i + 1}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));

/** The shop's certificates: one verified label, one Fysi Reviewed submission still awaiting review. */
export const SHOP_CERTIFICATIONS: ShopCertification[] = [
	{ id: "mock-cert-1", name: "GOTS organic textile", badge: "certified", status: "verified" },
	{ id: "mock-cert-2", name: "Sourcing and materials evidence", badge: "fysi_reviewed", status: "pending" },
];

/** POST /vendor/products: the new listing goes live at the top of Manage Products. */
export function createListing(data: FormData): VendorProduct | string {
	const text = (key: string) => String(data.get(key) ?? "").trim();
	const category = SHOP_CATEGORIES.find((c) => c.id === text("category_id"));
	if (!text("name") || !category || !text("price")) return "Name, category and price are required.";
	const photos = data.getAll("images").filter((v): v is File => v instanceof File);
	if (photos.length === 0) return "Add at least one product photo.";
	const variants = JSON.parse(text("variants") || "[]") as { name: string | null; sku: string | null; quantity: number }[];
	const product: VendorProduct = {
		id: `mock-listing-${Date.now()}`,
		name: text("name"),
		variants_count: Math.max(0, variants.length - 1),
		sku: variants[0]?.sku ?? `AUTO-${Date.now() % 100000}`,
		price: Number(text("price")),
		category: category.name,
		quantity: variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0),
		status: "active",
		moderation: null,
		// A link to the photo in this browser's memory: nothing is uploaded in mock mode.
		image_url: URL.createObjectURL(photos[0]!),
		created_at: new Date().toISOString(),
	};
	SHOP_PRODUCTS.unshift(product);
	return product;
}

export function productsCsv(products: VendorProduct[]) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const rows = products.map((p) =>
		[p.name, p.sku, p.variants_count, p.price, p.category, p.quantity, stockState(p)].map(cell).join(","),
	);
	return ["Name,Seller SKU,Extra variants,Price (NGN),Category,Quantity,Status", ...rows].join("\r\n");
}

/* ---------- Account Statements ---------- */

/** Sample rate for showing USDC beside naira (the API will quote the real one). */
const NGN_PER_USDC = 1600;
const both = (ngn: number): Money => ({ ngn, usdc: Math.round((ngn / NGN_PER_USDC) * 100) / 100 });

/** Fortnightly settlement periods, newest first: the current one is open, the two before await delivery, the rest are paid. */
const STATEMENTS: StatementDetail[] = Array.from({ length: 12 }, (_, i): StatementDetail => {
	const end = new Date(Date.now() - i * 14 * DAY);
	const start = new Date(end.getTime() - 13 * DAY);
	const status: StatementStatus = i === 0 ? "open" : i <= 2 ? "unpaid" : "paid";
	const orders = ORDER_RECORDS.filter((o) => {
		const t = new Date(o.created_at).getTime();
		return t >= start.getTime() && t <= end.getTime() + DAY && o.status !== "cancelled";
	});
	// Older periods predate the sample orders: give them steady figures.
	const gross = orders.length ? orders.reduce((s, o) => s + o.total, 0) : 48000 + ((i * 17300) % 90000);
	const refunds = orders.filter((o) => o.status === "returned").reduce((s, o) => s + o.total, 0);
	const commission = Math.round((gross - refunds) * 0.05);
	const ref = end.toISOString().slice(0, 10).replace(/-/g, "");
	const net = gross - refunds - commission;
	const sales = orders.length
		? orders.map((o) => ({ at: o.created_at, ngn: o.total, o }))
		: [{ at: start.toISOString(), ngn: gross, o: null }];
	const entries: StatementEntry[] = [
		...sales.map(({ at, ngn, o }, n): StatementEntry => ({
			id: `mock-entry-${i}-sale-${n}`,
			at,
			kind: "sale",
			description: o ? `Sale · Order ${o.number}` : "Sales this period",
			amount: both(ngn),
			order: o ? { id: o.id, number: o.number, released: o.payout_status === "released" } : null,
		})),
		...orders
			.filter((o) => o.status === "returned")
			.map((o, n): StatementEntry => ({
				id: `mock-entry-${i}-refund-${n}`,
				at: new Date(new Date(o.created_at).getTime() + 2 * DAY).toISOString(),
				kind: "refund",
				description: `Refund · Order ${o.number}`,
				amount: both(-o.total),
				order: { id: o.id, number: o.number, released: false },
			})),
		{
			id: `mock-entry-${i}-commission`,
			at: end.toISOString(),
			kind: "commission" as const,
			description: "Fysi commission (5%)",
			amount: both(-commission),
			order: null,
		},
	].sort((x, y) => x.at.localeCompare(y.at));
	return {
		id: `mock-statement-${i + 1}`,
		reference: `NG1B6G3-${ref}`,
		period_start: start.toISOString(),
		period_end: end.toISOString(),
		status,
		gross_sales: both(gross),
		commission: both(commission),
		commission_rate: 5,
		refunds: both(refunds),
		opening_balance: both(0),
		closing_balance: both(net),
		payout: both(status === "paid" ? net : 0),
		payout_tx:
			status === "paid"
				? {
						hash: Array.from({ length: 64 }, (_, h) => "0123456789abcdef"[(i * 11 + h * 7) % 16]).join(""),
						network: "testnet",
						at: new Date(end.getTime() + 8 * DAY).toISOString(),
					}
				: null,
		entries,
	};
});

export function listStatements(params: Record<string, unknown>) {
	const matches = STATEMENTS.filter((s) => !params.status || s.status === params.status).map(
		({ id, reference, period_start, period_end, status, payout }): Statement => ({
			id,
			reference,
			period_start,
			period_end,
			status,
			payout,
		}),
	);
	const limit = Number(params.limit) || 5;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

export const findStatement = (id: string) => STATEMENTS.find((s) => s.id === id);

/** Exports asked for in this session; each is "ready" four seconds after it was requested. */
const EXPORTS: StatementExport[] = [];

export function requestExport(currency: Currency): StatementExport {
	const job: StatementExport = {
		id: `mock-export-${Date.now()}`,
		requested_at: new Date().toISOString(),
		created_at: null,
		status: "preparing",
		currency,
	};
	EXPORTS.unshift(job);
	return job;
}

export function listExports(params: Record<string, unknown>) {
	for (const e of EXPORTS) {
		const ready = new Date(e.requested_at).getTime() + 4000;
		if (e.status === "preparing" && Date.now() >= ready) {
			e.status = "ready";
			e.created_at = new Date(ready).toISOString();
		}
	}
	const limit = Number(params.limit) || 5;
	const totalPages = Math.max(1, Math.ceil(EXPORTS.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: EXPORTS.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: EXPORTS.length },
	};
}

export function exportCsv(id: string) {
	const job = EXPORTS.find((e) => e.id === id && e.status === "ready");
	if (!job) return undefined;
	const amount = (m: Money) => (job.currency === "ngn" ? m.ngn : m.usdc);
	const unit = job.currency === "ngn" ? "NGN" : "USDC";
	const rows = STATEMENTS.map((s) =>
		[
			s.reference,
			s.period_start.slice(0, 10),
			s.period_end.slice(0, 10),
			s.status,
			amount(s.gross_sales),
			amount(s.commission),
			amount(s.refunds),
			amount(s.closing_balance),
			amount(s.payout),
			s.payout_tx?.hash ?? "",
		]
			.map((v) => `"${String(v)}"`)
			.join(","),
	);
	return [
		`Transaction ID,Period start,Period end,Status,Gross (${unit}),Commission (${unit}),Refunds (${unit}),Closing balance (${unit}),Paid out (${unit}),Payout transaction`,
		...rows,
	].join("\r\n");
}

/* ---------- Promotions ---------- */

const PROMO_NAMES = [
	"Clearance Sales",
	"Black Friday",
	"Flash Sales",
	"Brand Day Deal",
	"Magic Deal",
	"Big Savings",
	"Kitchen Super Sales",
	"Exclusive Deals",
	"Back to School",
	"Detty December",
	"Green Week",
	"New Year Refresh",
];
const PROMO_STATUSES: PromotionStatus[] = [
	"open",
	"ongoing",
	"cancelled",
	"expired",
	"cancelled",
	"ongoing",
	"ongoing",
	"expired",
];

const PROMOTIONS: Promotion[] = Array.from({ length: 20 }, (_, i): Promotion => {
	const status = PROMO_STATUSES[i % PROMO_STATUSES.length]!;
	// Open ones register in the future; the rest started in the past.
	const start = new Date(Date.now() + (status === "open" ? 3 + i : -(20 + i * 9)) * DAY);
	return {
		id: `mock-promo-${i + 1}`,
		name: PROMO_NAMES[i % PROMO_NAMES.length]! + (i >= PROMO_NAMES.length ? ` ${Math.floor(i / PROMO_NAMES.length) + 1}` : ""),
		registration_start: start.toISOString(),
		registration_end: new Date(start.getTime() + (i % 3 === 1 ? 24 : 6) * DAY).toISOString(),
		duration_days: i % 3 === 1 ? 30 : 20,
		discount:
			i % 2 === 0
				? { type: "percent", value: 10 + (i % 4) * 5, min_order: i % 4 === 0 ? 5000 : null }
				: { type: "fixed", value: 500 + (i % 3) * 500, min_order: 10000 },
		status,
		products_count: 3 + ((i * 7) % 25),
	};
});

export function listPromotions(params: Record<string, unknown>) {
	const search = String(params.search ?? "")
		.trim()
		.toLowerCase();
	const types = String(params.type ?? "")
		.split(",")
		.filter(Boolean);
	const matches = PROMOTIONS.filter(
		(p) =>
			(!params.status || p.status === params.status) &&
			(!types.length || types.includes(p.discount.type)) &&
			(!search || p.name.toLowerCase().includes(search)),
	);
	const limit = Number(params.limit) || 8;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

export function cancelPromotion(id: string): Promotion | string {
	const p = PROMOTIONS.find((x) => x.id === id);
	if (!p) return "That promotion no longer exists.";
	if (p.status !== "open" && p.status !== "ongoing") return "Only open or ongoing promotions can be cancelled.";
	p.status = "cancelled";
	return p;
}

/** Two to four products per promotion that has started; open ones have no sales yet. */
const PROMOTION_SALES: PromotionSale[] = PROMOTIONS.filter((p) => p.status !== "open").flatMap((p, i) =>
	Array.from({ length: 2 + (i % 3) }, (_, j): PromotionSale => {
		const product = SHOP_PRODUCTS[(i * 13 + j * 29) % SHOP_PRODUCTS.length]!;
		const price = p.discount.type === "percent" ? product.price * (1 - p.discount.value / 100) : product.price - p.discount.value;
		const sold = 5 + ((i * 31 + j * 17) % 220);
		return {
			id: `${p.id}-${product.id}`,
			product: { id: product.id, name: product.name, sku: product.sku },
			promotion: { id: p.id, name: p.name, status: p.status },
			items_sold: sold,
			revenue: Math.max(0, Math.round(price)) * sold,
			duration_days: p.duration_days,
		};
	}),
);

function matchPromotionSales(params: Record<string, unknown>) {
	const ids = String(params.ids ?? "")
		.split(",")
		.filter(Boolean);
	return PROMOTION_SALES.filter(
		(r) =>
			(!ids.length || ids.includes(r.id)) &&
			(!params.promotion || r.promotion.id === params.promotion) &&
			(!params.status || r.promotion.status === params.status),
	);
}

export function promotionPerformance(params: Record<string, unknown>) {
	const matches = matchPromotionSales(params);
	const sales = matches.reduce((s, r) => s + r.revenue, 0);
	// Sample: the same products sold a bit under half as much in the weeks before.
	const baseline = Math.round(sales / (2 + (matches.length % 5) / 10));
	const summary: PromotionSummary = {
		sales,
		sales_change: 10,
		baseline,
		baseline_change: 15,
		uplift: baseline ? Math.round(((sales - baseline) / baseline) * 100) : 0,
		uplift_change: 0,
	};
	const promotion = PROMOTIONS.find((p) => p.id === params.promotion);
	const limit = Number(params.limit) || 8;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		summary,
		promotion: promotion ? { id: promotion.id, name: promotion.name } : null,
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, total_pages: totalPages, total: matches.length },
	};
}

export function promotionSalesCsv(params: Record<string, unknown>) {
	const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
	const rows = matchPromotionSales(params).map((r) =>
		[r.product.name, r.product.sku, r.promotion.name, r.promotion.status, r.items_sold, r.revenue, r.duration_days]
			.map(cell)
			.join(","),
	);
	return ["Product,Seller SKU,Promotion,Status,Items sold,Revenue (NGN),Period (days)", ...rows].join("\r\n");
}
