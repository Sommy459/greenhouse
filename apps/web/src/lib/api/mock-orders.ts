/**
 * TEMPORARY sample orders for the demo customer (see mock.ts): Order Detail, Confirm delivery. Orders placed at checkout
 * are added here too. Changes last until the page reloads. Delete with mock.ts.
 */
import { MOCK_PRODUCTS } from "@/lib/api/mock-catalog";
import type { InboxMessage } from "@/features/inbox/types";
import type { PendingReview } from "@/features/reviews/types";
import type {
	ClosedStatus,
	CustomerOrder,
	CustomerOrderRow,
	CustomerOrderStatus,
	StellarPaymentMethod,
} from "@/features/orders/types";

const DAY = 86_400_000;
/** Sample rate for the USDC paid (the API locks the real quote at checkout). */
const NGN_PER_USDC = 1600;
const hash = (seed: number) => Array.from({ length: 64 }, (_, h) => "0123456789abcdef"[(seed * 7 + h * 13) % 16]).join("");
const iso = (t: number) => new Date(t).toISOString();

/** [number, status, days ago, product indexes, payment method] */
const SEEDS: [string, CustomerOrderStatus, number, number[], StellarPaymentMethod][] = [
	["FY3020123495", "processing", 2, [1, 4, 7], "fysi_wallet"],
	["FY3020116184", "shipped", 5, [2], "external_wallet"],
	["FY3020108873", "delivered", 9, [3, 5], "qr_code"],
	["FY3020101562", "delivered", 40, [6], "payment_link"],
	["FY3020094251", "cancelled", 14, [8, 9], "fysi_wallet"],
	["FY3020086940", "paid", 0.3, [10], "external_wallet"],
	["FY3020079629", "delivery_failed", 18, [11], "qr_code"],
	["FY3020072318", "returned", 25, [12, 2], "fysi_wallet"],
	["FY3020065007", "delivered", 31, [13], "external_wallet"],
	["FY3020057696", "delivered", 52, [0, 14], "fysi_wallet"],
	["FY3020050385", "cancelled", 60, [15], "payment_link"],
	["FY3020043074", "delivered", 75, [16], "qr_code"],
	["FY3020035763", "shipped", 3, [17, 18], "fysi_wallet"],
];

const REASON: Record<ClosedStatus, string> = {
	cancelled: "The seller ran out of stock.",
	delivery_failed: "The courier couldn't reach you after three tries.",
	returned: "You returned it: the item was damaged in transit.",
};

function build([number, status, daysAgo, picks, method]: (typeof SEEDS)[number], seed: number): CustomerOrder {
	const placed = Date.now() - daysAgo * DAY;
	const items = picks.map((i, j) => {
		const p = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length]!;
		return {
			id: `${number}-item-${j + 1}`,
			product_id: p.id,
			slug: p.slug,
			name: p.name,
			image_url: p.images[0] ?? null,
			quantity: 1 + ((seed + j) % 2),
			price: p.price,
			vendor_name: p.vendor?.shop_name ?? null,
		};
	});
	const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
	const shipping = 2500;
	const total = subtotal + shipping;
	// A failed delivery got as far as "on the way"; a returned order was delivered first.
	const level = status === "delivery_failed" ? "shipped" : status === "returned" ? "delivered" : status;
	const reached = (n: number) => ["paid", "processing", "shipped", "delivered"].indexOf(level) >= n;
	const deliveredAt = level === "delivered" ? placed + 4 * DAY : null;
	const closed = status === "cancelled" || status === "delivery_failed" || status === "returned" ? status : null;
	return {
		id: number,
		number,
		created_at: iso(placed),
		status,
		items,
		delivery: {
			method: seed % 4 === 3 ? "pickup" : "door_delivery",
			recipient: "Demo Customer",
			phone_number: "+234 801 234 5678",
			address: "50 Togo Street, Victoria Island, Lagos, Nigeria",
		},
		payment: {
			method,
			amount_usdc: Math.round((total / NGN_PER_USDC) * 100) / 100,
			tx_hash: hash(seed + 3),
			network: "testnet",
			paid_at: iso(placed + 60_000),
		},
		subtotal,
		discount: 0,
		shipping,
		total,
		timeline: {
			received: iso(placed + 60_000),
			processing: reached(1) && status !== "paid" ? iso(placed + 0.5 * DAY) : null,
			on_the_way: reached(2) ? iso(placed + 1.5 * DAY) : null,
			delivered: deliveredAt ? iso(deliveredAt) : null,
		},
		closed: closed
			? {
					status: closed,
					at: iso(placed + (closed === "cancelled" ? 0.4 : closed === "delivery_failed" ? 5 : 8) * DAY),
					reason: REASON[closed],
					refund_tx_hash: hash(seed + 11),
				}
			: null,
		report_until: status === "delivered" && deliveredAt ? iso(deliveredAt + 7 * DAY) : null,
		can_report: status === "delivered" && !!deliveredAt && Date.now() < deliveredAt + 7 * DAY,
	};
}

const ORDERS: CustomerOrder[] = SEEDS.map(build);

export const findCustomerOrder = (id: string) => ORDERS.find((o) => o.id === id);

/** GET /orders: newest first, `status` a comma-separated tab. */
export function listCustomerOrders(params: Record<string, unknown>) {
	const statuses = String(params.status ?? "")
		.split(",")
		.filter(Boolean);
	const matches = ORDERS.filter((o) => !statuses.length || statuses.includes(o.status))
		.slice()
		.sort((a, b) => b.created_at.localeCompare(a.created_at))
		.map((o): CustomerOrderRow => ({
			id: o.id,
			number: o.number,
			created_at: o.created_at,
			status: o.status,
			total: o.total,
			items_count: o.items.length,
			first_item: { name: o.items[0]?.name ?? "", image_url: o.items[0]?.image_url ?? null },
		}));
	const limit = Number(params.limit) || 10;
	const totalPages = Math.max(1, Math.ceil(matches.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: matches.slice((page - 1) * limit, page * limit),
		meta: { page, limit, total: matches.length, total_pages: totalPages },
	};
}

/** An order placed at checkout in mock mode, so its confirmation and detail pages work. */
export function recordOrder(order: CustomerOrder) {
	ORDERS.unshift(order);
}

export function confirmDelivery(id: string): CustomerOrder | string {
	const order = findCustomerOrder(id);
	if (!order) return "That order doesn't exist.";
	if (order.status !== "shipped") return "Only an order that's on its way can be confirmed.";
	const now = Date.now();
	order.status = "delivered";
	order.timeline.delivered = iso(now);
	order.report_until = iso(now + 7 * DAY);
	order.can_report = true;
	return order;
}

const short = (hash: string) => `${hash.slice(0, 6)}…${hash.slice(-6)}`;
const CLOSED_TITLE = { cancelled: "Order cancelled", delivery_failed: "Delivery failed", returned: "Return received" } as const;

/** GET /inbox: messages made from the sample orders' events, newest first. */
export function listInbox(params: Record<string, unknown>) {
	const messages: InboxMessage[] = [
		{
			id: "msg-welcome",
			created_at: iso(Date.now() - 90 * DAY),
			kind: "general",
			title: "Welcome to Fysi!",
			body: "Every product here is checked for its eco claims, and you pay in USDC on Stellar: your money is held safely until your order arrives. Happy shopping!",
			order: null,
			product: null,
		},
	];
	for (const o of ORDERS) {
		const first = o.items[0];
		const product = first ? { name: first.name, slug: first.slug, image_url: first.image_url } : null;
		const order = { id: o.id, number: o.number };
		if (o.payment)
			messages.push({
				id: `msg-${o.id}-paid`,
				created_at: o.payment.paid_at,
				kind: "payment",
				title: "Payment received",
				body: `We received ${o.payment.amount_usdc.toFixed(2)} USDC for order ${o.number} (transaction ${short(o.payment.tx_hash)}). It's held in escrow until your order arrives.`,
				order,
				product: null,
			});
		if (o.timeline.on_the_way)
			messages.push({
				id: `msg-${o.id}-shipped`,
				created_at: o.timeline.on_the_way,
				kind: "shipped",
				title: "Your order is on its way",
				body: `Order ${o.number} has shipped. When it arrives, confirm the delivery from your order page.`,
				order,
				product,
			});
		if (o.timeline.delivered)
			messages.push({
				id: `msg-${o.id}-delivered`,
				created_at: o.timeline.delivered,
				kind: "delivered",
				title: "Package delivered!",
				body: `Order ${o.number} is delivered. Not happy? You can report a problem within 7 days from now. Thank you for shopping on Fysi!`,
				order,
				product,
			});
		if (o.closed)
			messages.push({
				id: `msg-${o.id}-closed`,
				created_at: o.closed.at,
				kind: "closed",
				title: CLOSED_TITLE[o.closed.status],
				body: `${o.closed.reason} The ${o.payment ? `${o.payment.amount_usdc.toFixed(2)} USDC` : "payment"} for order ${o.number} is refunded to your wallet.`,
				order,
				product,
			});
	}
	messages.sort((a, b) => b.created_at.localeCompare(a.created_at));
	const limit = Number(params.limit) || 10;
	const totalPages = Math.max(1, Math.ceil(messages.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: messages.slice((page - 1) * limit, page * limit),
		meta: { page, limit, total: messages.length, total_pages: totalPages },
	};
}

/** Products the demo customer has reviewed in this session (by slug). */
const REVIEWED = new Set<string>();

export const markReviewed = (slug: string) => REVIEWED.add(slug);

/** GET /reviews/pending: each product of a delivered order not reviewed yet, latest delivery first. */
export function listPendingReviews(params: Record<string, unknown>) {
	const pending: PendingReview[] = ORDERS.filter((o) => o.status === "delivered" && o.timeline.delivered)
		.flatMap((o) =>
			o.items
				.filter((it) => !REVIEWED.has(it.slug))
				.map((it) => ({
					id: `${o.id}-${it.slug}`,
					product: { slug: it.slug, name: it.name, image_url: it.image_url },
					order: { id: o.id, number: o.number },
					delivered_at: o.timeline.delivered!,
				})),
		)
		.sort((a, b) => b.delivered_at.localeCompare(a.delivered_at));
	const limit = Number(params.limit) || 10;
	const totalPages = Math.max(1, Math.ceil(pending.length / limit));
	const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
	return {
		items: pending.slice((page - 1) * limit, page * limit),
		meta: { page, limit, total: pending.length, total_pages: totalPages },
	};
}
