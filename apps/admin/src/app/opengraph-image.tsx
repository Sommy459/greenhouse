import { SHARE_SIZE, shareImage } from "@/lib/share-image";

/** The link preview for the admin console (shared internally; the console is not indexed). */
export const alt = "Fysi Admin: the marketplace's administration console.";
export const size = SHARE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
	return shareImage({
		eyebrow: "Admin",
		title: "Fysi administration",
		subtitle: "Vendor approval, eco-verification, payments, support and reports. Staff only.",
		footer: "Sign in with your admin account",
	});
}
