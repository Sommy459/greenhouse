import type { MetadataRoute } from "next";

/** The seller centre is behind sign-in: keep it out of search (the storefront is the indexable one). */
export default function robots(): MetadataRoute.Robots {
	return { rules: { userAgent: "*", disallow: "/" } };
}
