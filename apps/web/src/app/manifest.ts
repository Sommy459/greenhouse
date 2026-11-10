import type { MetadataRoute } from "next";
import { BRAND, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, THEME_COLOR } from "@/lib/site";

/** Lets phones add the storefront to the home screen with the Fysi icon and name. */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${SITE_NAME}: ${SITE_TAGLINE}`,
		short_name: SITE_NAME,
		description: SITE_DESCRIPTION,
		start_url: "/",
		display: "standalone",
		background_color: BRAND.mist,
		theme_color: THEME_COLOR,
		categories: ["shopping", "lifestyle"],
		icons: [
			{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
			{ src: "/apple-icon", sizes: "180x180", type: "image/png" },
		],
	};
}
