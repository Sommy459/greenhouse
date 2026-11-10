import { SHARE_SIZE, shareImage } from "@/lib/share-image";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

/** The link preview for the storefront (pages without their own, e.g. product pages, inherit it). */
export const alt = `${SITE_NAME}: ${SITE_TAGLINE}. Nigeria's marketplace for certified eco-friendly products.`;
export const size = SHARE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
	return shareImage({
		title: SITE_TAGLINE,
		subtitle: "Nigeria's marketplace for certified eco-friendly products. Every vendor and product is eco-verified.",
		footer: `${SITE_URL.host} · Pay in USDC on Stellar`,
		background: "landing/hero.png",
	});
}
