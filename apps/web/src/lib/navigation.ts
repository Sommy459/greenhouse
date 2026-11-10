import { House, Lightbulb, Luggage, Paperclip, Shirt, SprayCan, type LucideIcon } from "lucide-react";
import { aboutRoutes, accountRoutes, authRoutes, shopRoutes, supportRoutes } from "@/lib/routes";
import { SOCIAL_LINKS } from "@/lib/site";

/**
 * Header and footer links, as in the Figma landing page. Category slugs must match the API's.
 * `image` is the category photo for the home page tiles (public/images/landing, see its README).
 * `icon` is the Catalogue menu icon (Figma catalogue dropdown; closest lucide matches until the icons are exported).
 */

interface CategoryLink {
	label: string;
	href: string;
	image: string;
	icon: LucideIcon;
	/** The category page's own title, when the Figma page names it differently from the menus. */
	pageTitle?: string;
}

/** In the Catalogue menu's order. Slugs are the API's six categories (GET /categories; PRD). */
export const CATEGORY_LINKS: CategoryLink[] = [
	{ label: "Clothing", href: shopRoutes.CATEGORY("clothing"), image: "/images/landing/category-clothing.jpg", icon: Shirt },
	{
		label: "Household Items",
		pageTitle: "Reusable Household Items",
		href: shopRoutes.CATEGORY("household"),
		image: "/images/landing/category-household.jpg",
		icon: House,
	},
	{
		label: "Beauty & Personal Care",
		href: shopRoutes.CATEGORY("beauty-personal-care"),
		image: "/images/landing/category-beauty.jpg",
		icon: SprayCan,
	},
	{
		label: "Eco-friendly Gadgets",
		href: shopRoutes.CATEGORY("gadgets"),
		image: "/images/landing/category-accessories.jpg",
		icon: Lightbulb,
	},
	{
		label: "Office Supplies",
		href: shopRoutes.CATEGORY("office-supplies"),
		image: "/images/landing/category-office.jpg",
		icon: Paperclip,
	},
	{
		label: "Outdoor & Travel",
		href: shopRoutes.CATEGORY("outdoor-travel"),
		image: "/images/landing/category-outdoor.jpg",
		icon: Luggage,
	},
];

/** Collections the API can list: newest first, and products with the "Certified" badge. */
export const COLLECTION_LINKS = [
	{ label: "New in", href: shopRoutes.COLLECTION("new-in"), query: { sort: "newest" as const } },
	{ label: "Certified products", href: shopRoutes.COLLECTION("certified"), query: { certified: true } },
];

/** Figma header menu (the ☰ beside the logo on desktop). `external` links open in a new tab. */
export const HEADER_MENU_LINKS = [
	{ label: "Contact", href: supportRoutes.CONTACT },
	{ label: "X", href: SOCIAL_LINKS.x, external: true },
	{ label: "Instagram", href: SOCIAL_LINKS.instagram, external: true },
	{ label: "Facebook", href: SOCIAL_LINKS.facebook, external: true },
	{ label: "Report a Product", href: supportRoutes.REPORT },
	{ label: "Returns & Refunds", href: supportRoutes.RETURNS },
];

export const HEADER_LINKS = [
	{ label: "About Us", href: aboutRoutes.ABOUT },
	{ label: "Support", href: supportRoutes.HELP },
];

/** Footer columns (desktop) and accordion sections (mobile). The first group has an icon instead of a title. */
export const FOOTER_CONTACT = [
	{ label: "Contact", href: supportRoutes.CONTACT },
	{ label: "Returns & Refunds", href: supportRoutes.RETURNS },
	{ label: "Report a Product / Problem", href: supportRoutes.REPORT },
];

export const FOOTER_ACCOUNT = [
	{ label: "Sign In", href: authRoutes.SIGN_IN() },
	{ label: "Order history", href: accountRoutes.ORDERS },
	{ label: "Wishlist", href: accountRoutes.WISHLIST },
	{ label: "Wallet", href: accountRoutes.WALLET },
	{ label: "Settings", href: accountRoutes.SETTINGS },
];

export const FOOTER_SUPPORT = [
	{ label: "FAQs", href: supportRoutes.FAQS },
	{ label: "Help Center", href: supportRoutes.HELP },
];

export const LEGAL_LINKS = [
	{ label: "Terms and Conditions", href: supportRoutes.TERMS },
	{ label: "Privacy Policy", href: supportRoutes.PRIVACY },
	{ label: "Legal Notice", href: supportRoutes.LEGAL_NOTICE },
];
