/**
 * Seller centre metadata. On Vercel the three apps share one domain (root vercel.json): NEXT_PUBLIC_SITE_URL is that
 * domain's origin (e.g. https://fysi.ng), or the deployment URL on previews. Locally each app has its own port.
 */
const VERCEL_ORIGIN =
	(process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL) &&
	`https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL}`;
const SHARED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || VERCEL_ORIGIN || undefined;
const ORIGIN = SHARED_ORIGIN || "http://localhost:3001";

/** "/vendor" (next.config.ts basePath). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** A file in public/ (e.g. "/images/x.jpg"): basePath isn't added to plain paths, including next/image `src`. */
export const asset = (path: string) => `${BASE_PATH}${path}`;

export const SITE_NAME = "Fysi Seller Centre";
export const SITE_URL = new URL(`${BASE_PATH}/`, ORIGIN);
/** Mirrors `--color-primary-500` in packages/ui globals.css. */
export const THEME_COLOR = "#003e20";

/** The storefront (`apps/web`, the domain root on Vercel), where listings appear. Link to it with a plain <a>. */
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || SHARED_ORIGIN || "http://localhost:3000";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
export const formatPrice = (amount: number) => naira.format(amount);
