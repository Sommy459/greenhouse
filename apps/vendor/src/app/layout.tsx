import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { SITE_NAME, SITE_URL, THEME_COLOR } from "@/lib/site";
import "./globals.css";

/** `--font-dm-sans` feeds `font-sans` in @repo/ui. */
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: "Sell certified eco-friendly products on Fysi: listings, orders, shipping, promotions and analytics.",
	robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
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
