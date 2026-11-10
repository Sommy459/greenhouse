import { SHARE_SIZE, shareImage } from "@/lib/share-image";
import { SITE_URL } from "@/lib/site";

/** The link preview for the seller centre (e.g. "Sell on Fysi" links shared with vendors). */
export const alt = "Fysi Seller Centre: sell certified eco-friendly products to customers across Nigeria.";
export const size = SHARE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
	return shareImage({
		eyebrow: "Seller Centre",
		title: "Sell certified eco-friendly products",
		subtitle: "Get verified, list your products and get paid in USDC on Stellar. Orders, promotions and analytics in one place.",
		footer: `${SITE_URL.host}${SITE_URL.pathname.replace(/\/$/, "")}`,
	});
}
