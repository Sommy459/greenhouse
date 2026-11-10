import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { asset, SITE_NAME, SITE_URL, THEME_COLOR } from "@/lib/site";
import "./globals.css";

/** `--font-dm-sans` feeds `font-sans` in @repo/ui. */
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: "Sell certified eco-friendly products on Fysi: listings, orders, shipping, promotions and analytics.",
	robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
	applicationName: SITE_NAME,
	formatDetection: { telephone: false, email: false, address: false },
	// Served by app/meta/*/route.ts. Image paths join metadataBase (it ends in the basePath); icon links need asset().
	icons: {
		icon: [{ url: asset("/meta/icon"), type: "image/png", sizes: "512x512" }],
		apple: [{ url: asset("/meta/apple-icon"), type: "image/png", sizes: "180x180" }],
	},
	openGraph: {
		type: "website",
		locale: "en_NG",
		siteName: SITE_NAME,
		title: SITE_NAME,
		description: "Sell certified eco-friendly products on Fysi: listings, orders, shipping, promotions and analytics.",
		url: "./",
		images: [
			{
				url: "meta/share",
				width: 1200,
				height: 630,
				alt: "Fysi Seller Centre: sell certified eco-friendly products to customers across Nigeria.",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: "Sell certified eco-friendly products on Fysi: listings, orders, shipping, promotions and analytics.",
		images: [{ url: "meta/share", alt: "Fysi Seller Centre: sell certified eco-friendly products to customers across Nigeria." }],
	},
};

export const viewport: Viewport = { themeColor: THEME_COLOR, interactiveWidget: "resizes-content" };

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={`${dmSans.variable} antialiased`}>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
