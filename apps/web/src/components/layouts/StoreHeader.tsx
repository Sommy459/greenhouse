"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
	ChevronDown,
	Heart,
	Mail,
	Menu,
	Pencil,
	Phone,
	Search,
	Settings,
	ShoppingBag,
	ShoppingCart,
	UserRound,
	Wallet,
	X,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/sheet";
import { Logo } from "@/components/Logo";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart, cartCount } from "@/features/cart/store";
import { isSignedIn, useSession } from "@/features/auth/session";
import { CATEGORY_LINKS, HEADER_LINKS, HEADER_MENU_LINKS } from "@/lib/navigation";
import { aboutRoutes, accountRoutes, authRoutes, shopRoutes, supportRoutes } from "@/lib/routes";
import { SITE_NAME, SUPPORT_PHONE, VENDOR_URL } from "@/lib/site";

/** Persisted stores are only readable in the browser: show counts once they are, so server and client renders agree. */
const subscribe = (onChange: () => void) => useCart.persist.onFinishHydration(onChange);
const hydrated = () => useCart.persist.hasHydrated();

/** Figma landing page header: announcement bar + main bar (desktop), compact bar + search (mobile). */
export function StoreHeader() {
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const count = cartCount(useCart((s) => s.items));
	const hasSession = useSession(isSignedIn);
	const signedIn = ready && hasSession;

	return (
		<header className="bg-white">
			<CartDrawer />
			<AnnouncementBar />

			{/* Desktop */}
			<div className="shop-container hidden h-[88px] items-center gap-6 lg:flex">
				<Logo />
				<HeaderMenu />
				<nav className="flex items-center gap-6 text-sm text-ink" aria-label="Main">
					<CatalogueMenu />
					{HEADER_LINKS.map((link) => (
						<Link key={link.href} href={link.href} className="hover:text-primary-500">
							{link.label}
						</Link>
					))}
				</nav>
				<SearchForm className="mx-auto w-full max-w-[420px]" withButton />
				<nav className="flex items-center gap-6 text-sm text-ink" aria-label="Account">
					{signedIn ? (
						<Link href={accountRoutes.DASHBOARD} className="hover:text-primary-500">
							My Account
						</Link>
					) : (
						<>
							<Link href={authRoutes.SIGN_IN()} className="flex items-center gap-1.5 hover:text-primary-500">
								<UserRound className="size-[18px]" aria-hidden />
								Sign In
							</Link>
							<Link href={authRoutes.SIGN_UP()} className="hover:text-primary-500">
								Sign Up
							</Link>
						</>
					)}
					<Link href={accountRoutes.WISHLIST} className="flex items-center gap-1.5 hover:text-primary-500">
						<Heart className="size-[18px]" aria-hidden />
						Wishlist
					</Link>
					<CartLink count={ready ? count : 0} withLabel />
				</nav>
			</div>

			{/* Mobile */}
			<div className="lg:hidden">
				<div className="flex h-16 items-center gap-3 px-4">
					<MenuSheet signedIn={signedIn} />
					<Logo />
					<Link
						href={signedIn ? accountRoutes.DASHBOARD : authRoutes.SIGN_IN()}
						className="ml-auto flex items-center gap-1.5 rounded-md p-1 text-sm text-ink hover:text-primary-500"
					>
						<UserRound className="size-5" aria-hidden />
						<span className={signedIn ? "sr-only" : undefined}>{signedIn ? "My Account" : "Sign In"}</span>
					</Link>
					<CartLink count={ready ? count : 0} />
				</div>
				<div className="px-4 pb-4">
					<SearchForm />
				</div>
			</div>
		</header>
	);
}

function AnnouncementBar() {
	return (
		<div className="hidden bg-primary-500 text-xs text-white lg:block">
			<div className="shop-container flex h-9 items-center">
				<a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-1.5">
					<Phone className="size-3.5" aria-hidden />
					{SUPPORT_PHONE}
				</a>
				<div className="mx-auto flex items-center gap-12 pr-28">
					<Link href={shopRoutes.COLLECTION("hot-deals")} className="hover:underline">
						Get 50% Off on Selected Items
					</Link>
					<a href={VENDOR_URL} className="hover:underline">
						Sell on {SITE_NAME}
					</a>
				</div>
			</div>
		</div>
	);
}

/** Corner decorations of the Catalogue menu (Figma). Missing files simply show nothing: see public/images/menu/README.md. */
const MENU_CORNER_TOP = "/images/menu/catalogue-corner-top.png";
const MENU_CORNER_BOTTOM = "/images/menu/catalogue-corner-bottom.png";

/**
 * Figma catalogue dropdown: a white card with every category and its icon in two columns, and craft-paper photos tucked
 * into the top-right and bottom-left corners. Keyboard: arrows move between categories, Enter opens one.
 */
function CatalogueMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center gap-1 outline-none hover:text-primary-500 data-[state=open]:text-primary-500 [&[data-state=open]>svg]:rotate-180">
				Catalogue <ChevronDown className="size-4 transition-transform" aria-hidden />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={14}
				className="relative w-[478px] overflow-hidden rounded-[7px] border border-grey-600 bg-white px-[44px] py-6 shadow-lg"
			>
				<span
					className="pointer-events-none absolute -top-1 -right-1 h-[50px] w-[42px] bg-contain bg-right-top bg-no-repeat"
					style={{ backgroundImage: `url("${MENU_CORNER_TOP}")` }}
					aria-hidden
				/>
				<span
					className="pointer-events-none absolute -bottom-1 -left-1 h-[55px] w-[48px] bg-contain bg-left-bottom bg-no-repeat"
					style={{ backgroundImage: `url("${MENU_CORNER_BOTTOM}")` }}
					aria-hidden
				/>

				<div className="relative grid grid-cols-[194px_1fr] gap-y-[11px]">
					{CATEGORY_LINKS.map(({ href, label, icon: Icon }) => (
						<DropdownMenuItem
							key={href}
							asChild
							className="cursor-pointer gap-4 rounded-md px-0 py-2 text-[15px] text-ink focus:bg-transparent focus:text-primary-500 [&_svg]:size-5"
						>
							<Link href={href}>
								<Icon className="shrink-0 text-primary-500" strokeWidth={1.75} aria-hidden />
								{label}
							</Link>
						</DropdownMenuItem>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Figma header menu (desktop ☰ beside the logo): contact, socials and help links in a small light card with a craft-paper
 * photo in the bottom-left corner. On mobile the ☰ opens the full MenuSheet instead.
 */
function HeaderMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Menu"
				className="rounded-md p-1 text-ink outline-none hover:bg-grey-600 data-[state=open]:bg-grey-600"
			>
				<Menu className="size-5" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={14}
				className="relative w-[196px] overflow-hidden rounded-[7px] border border-grey-600 bg-grey-500 px-[30px] pt-3 pb-4 shadow-lg"
			>
				<span
					className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-[26px] w-[22px] bg-contain bg-left-bottom bg-no-repeat"
					style={{ backgroundImage: `url("${MENU_CORNER_BOTTOM}")` }}
					aria-hidden
				/>
				{HEADER_MENU_LINKS.map(({ label, href, external }) => (
					<DropdownMenuItem
						key={label}
						asChild
						className="relative cursor-pointer rounded-md px-0 py-[5px] text-[15px] text-ink focus:bg-transparent focus:text-primary-500"
					>
						{external ? (
							<a href={href} target="_blank" rel="noreferrer">
								{label}
							</a>
						) : (
							<Link href={href}>{label}</Link>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Submits to /search?q=… (C3). Desktop has the green Search button; mobile submits on Enter. */
function SearchForm({ className = "", withButton = false }: { className?: string; withButton?: boolean }) {
	return (
		<form action={shopRoutes.SEARCH()} role="search" className={`flex h-10 ${className}`}>
			<label className="relative flex-1">
				<span className="sr-only">Search categories</span>
				<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grey-800" aria-hidden />
				<input
					name="q"
					type="search"
					placeholder="Search categories"
					className={`h-full w-full border border-grey-600 bg-grey-500 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-grey-800 focus:border-primary-300 ${
						withButton ? "rounded-l-sm" : "rounded-md"
					}`}
				/>
			</label>
			{withButton && (
				<button type="submit" className="rounded-r-sm bg-primary-500 px-5 text-sm font-medium text-white hover:bg-primary-400">
					Search
				</button>
			)}
		</form>
	);
}

/** The cart icon and count: opens the cart overlay (Figma "cart open overlay"). */
function CartLink({ count, withLabel = false, className = "" }: { count: number; withLabel?: boolean; className?: string }) {
	const openCart = useCartDrawer((s) => s.setOpen);
	return (
		<button
			type="button"
			onClick={() => openCart(true)}
			className={`flex items-center gap-1.5 hover:text-primary-500 ${className}`}
			aria-label={`Cart, ${count} items`}
			aria-haspopup="dialog"
		>
			<span className="relative">
				<ShoppingCart className="size-[22px] lg:size-[18px]" aria-hidden />
				{count > 0 && (
					// Keyed on the count, so the badge pops each time something is added or removed.
					<span
						key={count}
						className="animate-pop absolute -top-2 -right-2 grid min-w-4 place-items-center rounded-full bg-error-500 px-1 text-[10px] leading-4 font-bold text-white"
					>
						{count}
					</span>
				)}
			</span>
			{withLabel && <span aria-hidden>Cart</span>}
		</button>
	);
}

/** The Catalogue dropdown reads its two columns left to right; the slide-out lists the left column, then the right. */
const CATEGORIES_BY_COLUMN = [...CATEGORY_LINKS.filter((_, i) => i % 2 === 0), ...CATEGORY_LINKS.filter((_, i) => i % 2 === 1)];

const SHEET_ROW =
	"flex h-12 items-center gap-3 rounded-md text-[15px] text-white/95 outline-none hover:text-lime-300 focus-visible:ring-2 focus-visible:ring-white/60";

/**
 * Figma mobile slide-out menu: dark green, white logo and ×. Account links with icons, "Catalogues" with the category
 * icons, then Sell on Fysi, About Us, Support and Contact Us. Signed out, the first link is "Sign In". (Desktop uses
 * HeaderMenu.)
 */
function MenuSheet({ signedIn }: { signedIn: boolean }) {
	const account = [
		signedIn
			? { label: "My Account", href: accountRoutes.DASHBOARD, icon: UserRound }
			: { label: "Sign In", href: authRoutes.SIGN_IN(), icon: UserRound },
		{ label: "Order History", href: accountRoutes.ORDERS, icon: ShoppingBag },
		{ label: "Inbox", href: accountRoutes.INBOX, icon: Mail },
		{ label: "Reviews", href: accountRoutes.REVIEWS, icon: Pencil },
		{ label: "Wishlists", href: accountRoutes.WISHLIST, icon: Heart },
		{ label: "Wallet", href: accountRoutes.WALLET, icon: Wallet },
		{ label: "Settings", href: accountRoutes.SETTINGS, icon: Settings },
	];
	const more = [
		{ label: "About Us", href: aboutRoutes.ABOUT },
		{ label: "Support", href: supportRoutes.HELP },
		{ label: "Contact Us", href: supportRoutes.CONTACT },
	];

	return (
		<Sheet>
			<SheetTrigger aria-label="Menu" className="rounded-md p-1 text-ink hover:bg-grey-600">
				<Menu className="size-6 lg:size-5" />
			</SheetTrigger>
			{/* The last-child rule hides the kit's small close button; the design has a large white × instead. */}
			<SheetContent
				side="left"
				className="w-[270px] max-w-[85vw] gap-0 overflow-y-auto rounded-none border-0 bg-primary-500 px-1.5 pt-6 pb-8 text-white [&>button:last-child]:hidden"
			>
				<SheetTitle className="sr-only">Menu</SheetTitle>
				<div className="flex items-center justify-between px-2.5">
					<SheetClose asChild>
						<Logo tone="light" />
					</SheetClose>
					<SheetClose aria-label="Close menu" className="grid size-9 place-items-center rounded-md hover:bg-white/10">
						<X className="size-6" strokeWidth={2} />
					</SheetClose>
				</div>

				<nav aria-label="Account" className="mt-6 px-2.5">
					<ul>
						{account.map(({ label, href, icon: Icon }) => (
							<SheetLink key={label} href={href}>
								<Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
								{label}
							</SheetLink>
						))}
					</ul>
				</nav>

				<hr className="my-3 border-white/80" />

				<nav aria-labelledby="sheet-catalogues" className="px-2.5">
					<p id="sheet-catalogues" className="flex h-10 items-center text-[15px] font-medium">
						Catalogues
					</p>
					<ul>
						{CATEGORIES_BY_COLUMN.map(({ label, href, icon: Icon }) => (
							<SheetLink key={href} href={href}>
								<Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
								{label}
							</SheetLink>
						))}
					</ul>
				</nav>

				<hr className="my-3 border-white/80" />

				<nav aria-label="More" className="px-2.5">
					<ul>
						<li>
							<a href={VENDOR_URL} className={SHEET_ROW}>
								Sell on {SITE_NAME}
							</a>
						</li>
						{more.map(({ label, href }) => (
							<SheetLink key={href} href={href}>
								{label}
							</SheetLink>
						))}
					</ul>
				</nav>
			</SheetContent>
		</Sheet>
	);
}

/** A slide-out row: closes the menu as it navigates. */
function SheetLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<li>
			<SheetClose asChild>
				<Link href={href} className={SHEET_ROW}>
					{children}
				</Link>
			</SheetClose>
		</li>
	);
}
