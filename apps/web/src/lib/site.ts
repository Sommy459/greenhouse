/** Brand copy for the root layout's metadata. The product name is set here only; change it in one place. */
const SITE_NAME = "Fysi";
const SITE_TAGLINE = "Shop Smart, Live Green";
const SITE_DESCRIPTION =
	"Fysi is Nigeria's marketplace for certified eco-friendly products. Every vendor and product is eco-verified: clothing, household and kitchen items, personal care, beauty, office supplies, and outdoor and travel gear.";

const SITE_KEYWORDS = ["eco-friendly", "sustainable", "marketplace", "Nigeria", "certified", "green products", SITE_NAME];

/** Mirrors `--color-primary-500` in packages/ui globals.css. */
const THEME_COLOR = "#003e20";

/**
 * On Vercel the three apps share one domain (root vercel.json): the storefront at the root, the seller centre at
 * /vendor, the admin console at /admin. NEXT_PUBLIC_SITE_URL is that domain's origin (e.g. https://fysi.ng); previews
 * use the deployment URL, and localhost in dev.
 */
const VERCEL_ORIGIN =
	(process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL) &&
	`https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL}`;
const SHARED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || VERCEL_ORIGIN || undefined;
const ORIGIN = SHARED_ORIGIN || "http://localhost:3000";

const SITE_URL = new URL("/", ORIGIN);

/** The seller centre (`apps/vendor`, basePath /vendor), for "Sell on Fysi". Link to it with a plain <a>. */
const VENDOR_URL =
	process.env.NEXT_PUBLIC_VENDOR_URL || (SHARED_ORIGIN ? `${SHARED_ORIGIN}/vendor` : "http://localhost:3001/vendor");

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
