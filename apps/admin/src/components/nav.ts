import {
	ArrowLeftRight,
	ChartColumn,
	LifeBuoy,
	Mail,
	Megaphone,
	Star,
	House,
	Package,
	ScrollText,
	Settings,
	ShieldCheck,
	ShoppingBag,
	Store,
	Users,
	type LucideIcon,
} from "lucide-react";
import { consoleRoutes } from "@/lib/routes";

export interface NavItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

/** The sidebar: the Figma sections the API backs, plus payments, analytics, support, reviews, outreach, audit log and admin team. */
export const MAIN_NAV: NavItem[] = [
	{ href: consoleRoutes.OVERVIEW, label: "Overview", icon: House },
	{ href: consoleRoutes.VENDORS, label: "Vendors", icon: Store },
	{ href: consoleRoutes.PRODUCTS, label: "Products", icon: Package },
	{ href: consoleRoutes.ORDERS, label: "Orders", icon: ShoppingBag },
	{ href: consoleRoutes.PAYMENTS, label: "Payments", icon: ArrowLeftRight },
	{ href: consoleRoutes.USERS, label: "Users", icon: Users },
	{ href: consoleRoutes.ANALYTICS, label: "Analytics", icon: ChartColumn },
	{ href: consoleRoutes.SUPPORT, label: "Support", icon: LifeBuoy },
	{ href: consoleRoutes.REVIEWS, label: "Reviews", icon: Star },
	{ href: consoleRoutes.ANNOUNCEMENTS, label: "Announcements", icon: Megaphone },
	{ href: consoleRoutes.NEWSLETTER, label: "Newsletter", icon: Mail },
	{ href: consoleRoutes.AUDIT, label: "Audit log", icon: ScrollText },
	{ href: consoleRoutes.TEAM, label: "Admin team", icon: ShieldCheck },
];

export const FOOTER_NAV: NavItem[] = [{ href: consoleRoutes.SETTINGS, label: "Settings", icon: Settings }];

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
