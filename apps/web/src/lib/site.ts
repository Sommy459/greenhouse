/** Brand copy for the root layout's metadata. The product name is set here only; change it in one place. */
const SITE_NAME = "Fysi";
const SITE_TAGLINE = "Shop Smart, Live Green";
const SITE_DESCRIPTION =
	"Fysi is Nigeria's marketplace for certified eco-friendly products. Every vendor and product is eco-verified: clothing, household and kitchen items, personal care, beauty, office supplies, and outdoor and travel gear.";

const SITE_KEYWORDS = ["eco-friendly", "sustainable", "marketplace", "Nigeria", "certified", "green products", SITE_NAME];

/** Mirrors `--color-primary-500` in packages/ui globals.css. */
const THEME_COLOR = "#003e20";

/**
 * Brand colours for the generated icons and share images (next/og can't read CSS variables). They mirror the tokens in
 * packages/ui globals.css: primary-500, primary-700, primary-900, lime-400, primary-50.
 */
const BRAND = { green: "#003e20", greenDark: "#002c17", greenDeep: "#001a0d", lime: "#e5fe49", mist: "#e6ece9" };

/**
 * On Vercel the three apps share one domain (root vercel.json): the storefront at the root, the seller centre at
 * /vendor, the admin console at /admin. NEXT_PUBLIC_SITE_URL is that domain's origin; without it, production uses
 * https://greenhouse-v3.vercel.app, previews their deployment URL, and dev localhost.
 */
/** The production domain. Links, canonical URLs and share images point here unless NEXT_PUBLIC_SITE_URL says otherwise. */
const PRODUCTION_ORIGIN = "https://greenhouse-v3.vercel.app";
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
const VERCEL_ORIGIN =
	(process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL) &&
	`https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL}`;
const SHARED_ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL || (VERCEL_ENV === "production" ? PRODUCTION_ORIGIN : VERCEL_ORIGIN) || undefined;
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

export {
	BRAND,
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
};
