/**
 * Seller centre metadata. On Vercel the three apps share one domain (root vercel.json): NEXT_PUBLIC_SITE_URL is that
 * domain's origin (e.g. https://fysi.ng), or the deployment URL on previews. Locally each app has its own port.
 */
/** The production domain. Links, canonical URLs and share images point here unless NEXT_PUBLIC_SITE_URL says otherwise. */
const PRODUCTION_ORIGIN = "https://greenhouse-v3.vercel.app";
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
const VERCEL_ORIGIN =
	(process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL) &&
	`https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL}`;
const SHARED_ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL || (VERCEL_ENV === "production" ? PRODUCTION_ORIGIN : VERCEL_ORIGIN) || undefined;
const ORIGIN = SHARED_ORIGIN || "http://localhost:3001";

/** "/vendor" (next.config.ts basePath). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** A file in public/ (e.g. "/images/x.jpg"): basePath isn't added to plain paths, including next/image `src`. */
export const asset = (path: string) => `${BASE_PATH}${path}`;

export const SITE_NAME = "Fysi Seller Centre";
export const SITE_URL = new URL(`${BASE_PATH}/`, ORIGIN);
/** Mirrors `--color-primary-500` in packages/ui globals.css. */
export const THEME_COLOR = "#003e20";

/**
 * Brand colours for the generated icons and share images (next/og can't read CSS variables). They mirror the tokens in
 * packages/ui globals.css: primary-500, primary-700, primary-900, lime-400, primary-50.
 */
export const BRAND = { green: "#003e20", greenDark: "#002c17", greenDeep: "#001a0d", lime: "#e5fe49", mist: "#e6ece9" };

/** The storefront (`apps/web`, the domain root on Vercel), where listings appear. Link to it with a plain <a>. */
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || SHARED_ORIGIN || "http://localhost:3000";
