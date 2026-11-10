import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * The storefront is indexable; private pages (account, checkout, auth) are not. This is the domain's only robots.txt on
 * Vercel (the seller centre and admin console live under /vendor and /admin), so it keeps those out too.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/account", "/checkout", "/auth", "/cart", "/wishlist", "/vendor", "/admin"],
		},
		host: SITE_URL.origin,
	};
}
