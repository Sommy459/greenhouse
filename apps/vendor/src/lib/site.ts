/** Seller centre metadata. Production host not decided yet: set NEXT_PUBLIC_SITE_URL per environment. */
const ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ?? "http://localhost:3001";

export const SITE_NAME = "Fysi Seller Centre";
export const SITE_URL = new URL("/", ORIGIN);
/** Mirrors `--color-primary-500` in packages/ui globals.css. */
export const THEME_COLOR = "#003e20";

/** The storefront (`apps/web`), where listings appear. Link to it with a plain <a>. */
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
export const formatPrice = (amount: number) => naira.format(amount);
