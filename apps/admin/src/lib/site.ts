/** Admin console metadata. Production host not decided yet: set NEXT_PUBLIC_SITE_URL per environment. */
const ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ?? "http://localhost:3002";

export const SITE_NAME = "Fysi Admin";
export const SITE_URL = new URL("/", ORIGIN);
/** Mirrors `--color-primary-500` in packages/ui globals.css. */
export const THEME_COLOR = "#003e20";
