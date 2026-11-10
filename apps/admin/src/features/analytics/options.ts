import type { SalesPeriod } from "@/features/analytics/types";

export const PERIOD_LABEL: Record<SalesPeriod, string> = { daily: "Daily", weekly: "Week", monthly: "Month" };

/**
 * "Sales Report" slice colours: the Figma's greens, in a fixed order so a category keeps its colour whatever its rank
 * (dataviz: colour follows the entity). Adjacent pairs pass the colour-blind separation check; the lighter two are
 * low-contrast, so every slice also has a visible label in the legend.
 */
export const CATEGORY_COLORS = [
	"var(--color-primary-500)",
	"var(--color-primary-100)",
	"var(--color-primary-300)",
	"var(--color-primary-900)",
	"var(--color-primary-200)",
];

/** Known categories first, in the Figma legend's order; any others follow alphabetically. */
const KNOWN = ["Household items", "Office supplies", "Personal Care", "Kitchen supplies", "Clothing"];

export function categoryOrder(names: string[]) {
	const known = KNOWN.filter((n) => names.includes(n));
	const rest = names.filter((n) => !KNOWN.includes(n)).sort();
	return [...known, ...rest];
}
