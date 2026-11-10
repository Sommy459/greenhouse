"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, LogOut, Mail, MapPin, Pencil, Settings, ShoppingBag, UserRound, Wallet } from "lucide-react";
import { useSignOut } from "@/features/auth/hooks";
import { accountRoutes } from "@/lib/routes";

/** Figma "My Account" menu (PRD C1) on wide screens; phones get AccountMenu on /account and a back link elsewhere. */
const NAV = [
	{ href: accountRoutes.DASHBOARD, label: "My Account", icon: UserRound },
	{ href: accountRoutes.ORDERS, label: "Order History", icon: ShoppingBag },
	{ href: accountRoutes.INBOX, label: "Inbox", icon: Mail },
	{ href: accountRoutes.REVIEWS, label: "Reviews", icon: Pencil },
	{ href: accountRoutes.WALLET, label: "Wallet", icon: Wallet },
	{ href: accountRoutes.ADDRESSES, label: "Addresses", icon: MapPin },
	{ href: accountRoutes.SUPPORT, label: "Support", icon: LifeBuoy },
	{ href: accountRoutes.SETTINGS, label: "Settings", icon: Settings },
];

const ITEM = "flex shrink-0 items-center gap-3 px-5 py-3.5 text-base text-ink transition-colors lg:py-4";

const isActive = (pathname: string, href: string) =>
	href === accountRoutes.DASHBOARD
		? pathname === href || pathname === accountRoutes.OVERVIEW
		: pathname === href || pathname.startsWith(`${href}/`);

export function AccountNav() {
	const pathname = usePathname();
	const signOut = useSignOut();

	return (
		<nav aria-label="My account" className="hidden bg-white lg:flex lg:flex-col">
			{NAV.map(({ href, label, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					aria-current={isActive(pathname, href) ? "page" : undefined}
					className={clsx(ITEM, isActive(pathname, href) ? "bg-primary-50" : "hover:bg-grey-500")}
				>
					<Icon className="size-5" aria-hidden />
					{label}
				</Link>
			))}
			<button type="button" onClick={signOut} className={clsx(ITEM, "text-left hover:bg-error-50 hover:text-error-500")}>
				<LogOut className="size-5" aria-hidden />
				Log Out
			</button>
		</nav>
	);
}
