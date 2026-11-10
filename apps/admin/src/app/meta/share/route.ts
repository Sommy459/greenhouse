import { shareImage } from "@/lib/share-image";

/** The 1200×630 link preview, linked from the root layout's metadata (og:image and twitter:image). */
export const dynamic = "force-static";

export function GET() {
	return shareImage({
		eyebrow: "Admin",
		title: "Fysi administration",
		subtitle: "Vendor approval, eco-verification, payments, support and reports. Staff only.",
		footer: "Sign in with your admin account",
	});
}
