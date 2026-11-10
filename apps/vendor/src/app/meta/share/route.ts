import { shareImage } from "@/lib/share-image";
import { SITE_URL } from "@/lib/site";

/** The 1200×630 link preview, linked from the root layout's metadata (og:image and twitter:image). */
export const dynamic = "force-static";

export function GET() {
	return shareImage({
		eyebrow: "Seller Centre",
		title: "Sell certified eco-friendly products",
		subtitle: "Get verified, list your products and get paid in USDC on Stellar. Orders, promotions and analytics in one place.",
		footer: `${SITE_URL.host}${SITE_URL.pathname.replace(/\/$/, "")}`,
	});
}
