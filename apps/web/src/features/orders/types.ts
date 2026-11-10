/** Orders in the Fysi API (checkout, payment, the account's order pages). Money is US cents; on-chain amounts USDC strings. */
import type { Money } from "@/lib/format";

/** The 36 states and the FCT, as the API spells them. */
export const NIGERIAN_STATES = [
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"FCT",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
] as const;
export type NigerianState = (typeof NIGERIAN_STATES)[number];

export interface DeliveryAddress {
	recipientName: string;
	phone: string;
	line1: string;
	line2?: string | null;
	city: string;
	state: NigerianState;
	notes?: string | null;
}

/** The whole order: one payment for everything in the cart. Stock is held (and the payment open) until `expiresAt`. */
export type OrderStatus = "awaiting_payment" | "paid" | "expired" | "cancelled";

/** One vendor's share of an order, which that vendor ships (PRD V8). */
export type VendorOrderStatus = "awaiting_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

/** Where and how much to pay: the Fysi settlement account, in USDC, with the order number as memo. */
export interface PaymentInstructions {
	network: string;
	networkPassphrase: string;
	destination: string;
	assetCode: string;
	assetIssuer: string;
	memo: string;
	/** USDC still due (an underpayment leaves the rest here). */
	amountDue: string;
	/** SEP-7 URI for the QR code. */
	sep7Uri: string;
	/** The shareable payment link. */
	payLink: string;
	expiresAt: string;
}

export interface OrderLine {
	productId: string;
	title: string;
	unitPrice: Money;
	quantity: number;
	lineTotal: Money;
}

export interface VendorOrder {
	id: string;
	vendorName: string;
	vendorSlug: string | null;
	status: VendorOrderStatus;
	subtotal: Money;
	lines: OrderLine[];
	carrier: string | null;
	trackingNumber: string | null;
	shippedAt: string | null;
	deliveredAt: string | null;
	/** When the customer confirmed (releasing the vendor's payout). */
	confirmedAt: string | null;
	canConfirmDelivery: boolean;
	/** Open until 7 days after delivery (PRD C8). */
	canReportProblem: boolean;
	problemReason: string | null;
}

export interface OrderTransaction {
	txHash: string;
	explorerUrl: string;
	amount: string;
	at: string;
}

/** POST /checkout, GET /orders(/:id) and the payment calls. */
export interface Order {
	id: string;
	/** e.g. FY-1042, also the payment memo. */
	number: string;
	status: OrderStatus;
	total: Money;
	/** USDC received so far. */
	paid: string;
	deliveryAddress: DeliveryAddress;
	payment: PaymentInstructions;
	transactions: OrderTransaction[];
	vendorOrders: VendorOrder[];
	paidAt: string | null;
	createdAt: string;
}

/** GET /pay/:token: what anyone with the payment link sees. */
export interface PayLinkOrder {
	number: string;
	status: OrderStatus;
	total: Money;
	paid: string;
	items: string[];
	payment: PaymentInstructions;
}
