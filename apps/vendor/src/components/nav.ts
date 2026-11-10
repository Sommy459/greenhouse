import { BarChart3, Headphones, House, Package, Settings, ShoppingBag, Ticket, type LucideIcon } from "lucide-react";
import { consoleRoutes } from "@/lib/routes";

export interface NavLink {
	href: string;
	label: string;
}

export interface NavItem extends NavLink {
	icon: LucideIcon;
	/** Figma groups open with a chevron to show their pages. */
	children?: NavLink[];
}

/** The Figma "Fysi Vendor Hub" sidebar, in order. Group children are filled in as their designs arrive. */
export const MAIN_NAV: NavItem[] = [
	{ href: consoleRoutes.OVERVIEW, label: "Dashboard", icon: House },
	{
		href: consoleRoutes.PRODUCTS,
		label: "Products",
		icon: Package,
		children: [
			{ href: consoleRoutes.PRODUCTS, label: "Manage Products" },
			{ href: consoleRoutes.NEW_PRODUCT, label: "Add Products" },
		],
	},
	{
		href: consoleRoutes.ORDERS,
		label: "Orders",
		icon: ShoppingBag,
		children: [
			{ href: consoleRoutes.ORDERS, label: "All Orders" },
			{ href: consoleRoutes.TRACK_ORDERS, label: "Track Orders" },
		],
	},
	{
		href: consoleRoutes.PROMOTIONS,
		label: "Discounts & Promotions",
		icon: Ticket,
		children: [
			{ href: consoleRoutes.PROMOTIONS, label: "Promotion Management" },
			{ href: consoleRoutes.MONITOR_PROMOTIONS, label: "Monitor Promotions" },
		],
	},
	{ href: consoleRoutes.STATEMENTS, label: "Account Statements", icon: BarChart3 },
];

export const FOOTER_NAV: NavItem[] = [
	{ href: consoleRoutes.SETTINGS, label: "Settings", icon: Settings },
	{ href: consoleRoutes.HELP, label: "Help", icon: Headphones },
];

export const isActive = (pathname: string, href: string) =>
	href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/** A child link is active only on its own page (so "Manage Products" isn't lit on "Add Products"). */
export const isChildActive = (pathname: string, href: string, siblings: NavLink[]) =>
	pathname === href ||
	(pathname.startsWith(`${href}/`) &&
		!siblings.some((s) => s.href !== href && (pathname === s.href || pathname.startsWith(`${s.href}/`))));

/** The section the page belongs to, for the top bar (Figma: "Home" on the Dashboard, else the section's name). */
export function currentSection(pathname: string): NavItem {
	const found = [...MAIN_NAV, ...FOOTER_NAV].find((item) => isActive(pathname, item.href));
	return !found || found.href === consoleRoutes.OVERVIEW ? { href: consoleRoutes.OVERVIEW, label: "Home", icon: House } : found;
}
