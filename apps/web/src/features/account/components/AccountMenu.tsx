"use client";

import Link from "next/link";
import {
	ChevronRight,
	Heart,
	LifeBuoy,
	LogOut,
	Mail,
	MapPin,
	Pencil,
	Settings,
	ShoppingBag,
	UserRound,
	Wallet,
} from "lucide-react";
import { useSignOut } from "@/features/auth/hooks";
import { useSession } from "@/features/auth/session";
import { accountRoutes } from "@/lib/routes";

/** "My Account" opens the overview cards (Figma phone "Account"). */
const MAIN = [
	{ href: accountRoutes.OVERVIEW, label: "My Account", icon: UserRound },
	{ href: accountRoutes.ORDERS, label: "Order History", icon: ShoppingBag },
	{ href: accountRoutes.INBOX, label: "Inbox", icon: Mail },
	{ href: accountRoutes.REVIEWS, label: "Reviews", icon: Pencil },
	{ href: accountRoutes.WISHLIST, label: "Wishlist", icon: Heart },
	{ href: accountRoutes.WALLET, label: "Wallet", icon: Wallet },
	{ href: accountRoutes.ADDRESSES, label: "Addresses", icon: MapPin },
	{ href: accountRoutes.SUPPORT, label: "Support", icon: LifeBuoy },
];

const ROW = "flex items-center gap-4 px-6 py-5 text-lg text-ink transition-colors";

/** Figma phone "Welcome, John": the account menu as its own page, with Settings and Log Out at the bottom. */
export function AccountMenu() {
	const name = useSession((s) => s.user?.name.split(" ")[0]);
	const signOut = useSignOut();

	return (
		<div className="flex min-h-[70dvh] flex-col">
			<h1 className="animate-rise text-2xl text-ink">Welcome{name ? `, ${name}` : ""}</h1>
			<nav aria-label="My account" className="mt-6 flex flex-1 flex-col justify-between gap-10">
				<ul>
					{MAIN.map(({ href, label, icon: Icon }, i) => (
						<li key={href} className="animate-rise" style={{ "--i": i + 1 } as React.CSSProperties}>
							<Link href={href} className={`${ROW} hover:bg-primary-50 ${i === 0 ? "bg-primary-50" : ""}`}>
								<Icon className="size-6" aria-hidden />
								<span className="flex-1">{label}</span>
								<ChevronRight className="size-6" aria-hidden />
							</Link>
						</li>
					))}
				</ul>
				<ul>
					<li>
						<Link href={accountRoutes.SETTINGS} className={`${ROW} hover:bg-primary-50`}>
							<Settings className="size-6" aria-hidden />
							Settings
						</Link>
					</li>
					<li>
						<button type="button" onClick={signOut} className={`${ROW} w-full hover:bg-error-50 hover:text-error-500`}>
							<LogOut className="size-6" aria-hidden />
							Log Out
						</button>
					</li>
				</ul>
			</nav>
		</div>
	);
}
