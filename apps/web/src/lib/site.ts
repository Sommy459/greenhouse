/** Brand copy for the root layout's metadata. The product name is set here only; change it in one place. */
const SITE_NAME = "Fysi";
const SITE_TAGLINE = "Shop Smart, Live Green";
const SITE_DESCRIPTION =
	"Fysi is Nigeria's marketplace for certified eco-friendly products. Every vendor and product is eco-verified: clothing, household and kitchen items, personal care, beauty, office supplies, and outdoor and travel gear.";

const SITE_KEYWORDS = ["eco-friendly", "sustainable", "marketplace", "Nigeria", "certified", "green products", SITE_NAME];

/** Mirrors `--color-primary-500` in packages/ui globals.css. */
const THEME_COLOR = "#003e20";

/**
 * Production hosts are not decided yet. Set NEXT_PUBLIC_SITE_URL (and NEXT_PUBLIC_VENDOR_URL) per environment;
 * on Vercel previews the deployment URL is used, and localhost in dev.
 */
const ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ?? "http://localhost:3000";

const SITE_URL = new URL("/", ORIGIN);

/** The seller centre (`apps/vendor`), for "Sell on Fysi". Link to it with a plain <a>. */
const VENDOR_URL = process.env.NEXT_PUBLIC_VENDOR_URL ?? "http://localhost:3001";

/** Shown in the announcement bar. The number is the one in the Figma design: replace with the real support line. */
const SUPPORT_PHONE = "+09112312345";

/** Footer social links. TODO: real profile URLs. */
const SOCIAL_LINKS = { facebook: "#", x: "#", instagram: "#" };
/** Handles shown on the Contact page (Figma). TODO: confirm the real handles. */
const SOCIAL_HANDLES = { instagram: "@Fysi", facebook: "@Fysi", x: "@Fysi" };

/**
 * Contact page details, as in the Figma design. Placeholders until the real support line and inbox exist. Note the
 * design's announcement bar shows a different number (SUPPORT_PHONE).
 */
const CONTACT = { hours: "24hrs Mon - Sun", email: "Fysi@gmail.com", phone: "+2348100000000" };

/** Prices are whole naira (PRD: localisation). */
const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const formatPrice = (amount: number) => naira.format(amount);

export {
	SITE_NAME,
	SITE_TAGLINE,
	SITE_DESCRIPTION,
	SITE_KEYWORDS,
	THEME_COLOR,
	SITE_URL,
	VENDOR_URL,
	SUPPORT_PHONE,
	SOCIAL_LINKS,
	SOCIAL_HANDLES,
	CONTACT,
	formatPrice,
};
