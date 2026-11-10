import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** The storefront is indexable; private pages (account, checkout, auth) are not. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/", disallow: ["/account", "/checkout", "/auth", "/cart"] },
		host: SITE_URL.origin,
	};
}
