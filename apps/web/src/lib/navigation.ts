import { CookingPot, House, Luggage, Paperclip, Scissors, Shirt, SprayCan, Watch, type LucideIcon } from "lucide-react";
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

/** In the Catalogue menu's order: two columns, read left to right. */
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
		label: "Kitchen Items",
		href: shopRoutes.CATEGORY("kitchen"),
		image: "/images/landing/category-kitchen.jpg",
		icon: CookingPot,
	},
	{
		label: "Beauty & Cosmetics",
		href: shopRoutes.CATEGORY("beauty"),
		image: "/images/landing/category-beauty.jpg",
		icon: SprayCan,
	},
	{
		label: "Personal Care",
		href: shopRoutes.CATEGORY("personal-care"),
		image: "/images/landing/category-personal-care.jpg",
		icon: Scissors,
	},
	{
		label: "Outdoor & Travel",
		href: shopRoutes.CATEGORY("outdoor"),
		image: "/images/landing/category-outdoor.jpg",
		icon: Luggage,
	},
	{
		label: "Office Supplies",
		href: shopRoutes.CATEGORY("office"),
		image: "/images/landing/category-office.jpg",
		icon: Paperclip,
	},
	{
		label: "Accessories",
		href: shopRoutes.CATEGORY("accessories"),
		image: "/images/landing/category-accessories.jpg",
		icon: Watch,
	},
];

export const COLLECTION_LINKS = [
	{ label: "New in", href: shopRoutes.COLLECTION("new-in") },
	{ label: "Products on demand", href: shopRoutes.COLLECTION("on-demand") },
	{ label: "Hot deals", href: shopRoutes.COLLECTION("hot-deals") },
	{ label: "Sustainability highlights", href: shopRoutes.COLLECTION("sustainability") },
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
	{ label: "Profile", href: accountRoutes.PROFILE },
	{ label: "Wishlist", href: accountRoutes.WISHLIST },
	{ label: "Payment", href: accountRoutes.PAYMENT },
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
