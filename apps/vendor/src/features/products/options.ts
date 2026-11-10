import type { StockState } from "@/features/products/types";

export const STOCK_LABEL: Record<StockState, string> = {
	in_stock: "In Stock",
	out_of_stock: "Out of stock",
	inactive: "Inactive",
	hidden_by_fysi: "Hidden by Fysi",
};

export const STOCK_TONE: Record<StockState, string> = {
	in_stock: "bg-success-50 text-success-700",
	out_of_stock: "bg-warning-50 text-warning-700",
	inactive: "bg-error-50 text-error-500",
	hidden_by_fysi: "bg-grey-500 text-grey-900",
};
/**
 * Choices for the Add Product form. Placeholders until the API publishes its lists. The first four colours match the
 * storefront's colour filter (Red, Black, Brown, Green); the swatch class shows the colour beside its name.
 */
export const COLOURS = [
	{ value: "red", label: "Red", swatch: "bg-swatch-red" },
	{ value: "black", label: "Black", swatch: "bg-swatch-black" },
	{ value: "brown", label: "Brown", swatch: "bg-swatch-brown" },
	{ value: "green", label: "Green", swatch: "bg-swatch-green" },
	{ value: "white", label: "White", swatch: "bg-white border border-grey-700" },
	{ value: "natural", label: "Natural / undyed", swatch: "bg-lime-100 border border-grey-700" },
	{ value: "multi", label: "Multicolour", swatch: "bg-gradient-to-br from-swatch-red via-lime-400 to-swatch-green" },
];

/** Warranty Duration, in months ("" = none). */
export const WARRANTY_DURATIONS = [
	{ value: "0", label: "No warranty" },
	{ value: "6", label: "6 months" },
	{ value: "12", label: "1 year" },
	{ value: "24", label: "2 years" },
	{ value: "36", label: "3 years" },
	{ value: "60", label: "5 years" },
];

/** Figma Warranty Type list. */
export const WARRANTY_TYPES = [
	{ value: "repair_by_vendor", label: "Repair by Vendor" },
	{ value: "replacement_by_vendor", label: "Replacement by Vendor" },
	{ value: "service_centre", label: "Service Centres" },
];
