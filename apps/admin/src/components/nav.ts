import { BarChart3, Gift, Headphones, House, Package, Settings, ShoppingBag, Store, Users, type LucideIcon } from "lucide-react";
import { consoleRoutes } from "@/lib/routes";

export interface NavItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

/** The sidebar's sections, in Figma order. */
export const MAIN_NAV: NavItem[] = [
	{ href: consoleRoutes.OVERVIEW, label: "Overview", icon: House },
	{ href: consoleRoutes.PRODUCTS, label: "Products", icon: Package },
	{ href: consoleRoutes.ORDERS, label: "Orders", icon: ShoppingBag },
	{ href: consoleRoutes.CUSTOMERS, label: "Customers", icon: Users },
	{ href: consoleRoutes.VENDORS, label: "Vendors", icon: Store },
	{ href: consoleRoutes.ANALYTICS, label: "Analytics", icon: BarChart3 },
	{ href: consoleRoutes.CAMPAIGNS, label: "Campaigns", icon: Gift },
];

export const FOOTER_NAV: NavItem[] = [
	{ href: consoleRoutes.SETTINGS, label: "Settings", icon: Settings },
	{ href: consoleRoutes.HELP, label: "Help", icon: Headphones },
];

/** Vendors also owns its sub-pages, including eco-verification. */
export const isActive = (pathname: string, href: string) =>
	href === "/"
		? pathname === "/"
		: pathname === href ||
			pathname.startsWith(`${href}/`) ||
			(href === consoleRoutes.VENDORS && pathname.startsWith(consoleRoutes.VERIFICATION));

/** The section the page belongs to, for the top bar (Figma: "Home" on the Overview, else the section's name). */
export function currentSection(pathname: string): NavItem {
	const found = [...MAIN_NAV, ...FOOTER_NAV].find((item) => isActive(pathname, item.href));
	return !found || found.href === consoleRoutes.OVERVIEW ? { href: consoleRoutes.OVERVIEW, label: "Home", icon: House } : found;
}
