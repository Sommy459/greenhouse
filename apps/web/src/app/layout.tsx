import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { RevealObserver } from "@/components/RevealObserver";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL, THEME_COLOR } from "@/lib/site";
import "./globals.css";

/** The style guide's typeface, in the four weights it uses. `--font-dm-sans` feeds `font-sans` in @repo/ui. */
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });

const TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

/**
 * The storefront is public and indexable. Pages set `title` and get "%s | Fysi". The tab icon, home-screen icon and link
 * preview come from icon.tsx, apple-icon.tsx and opengraph-image.tsx / twitter-image.tsx beside this file.
 */
export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: TITLE, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: SITE_KEYWORDS,
	category: "shopping",
	creator: SITE_NAME,
	publisher: SITE_NAME,
	robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
	// Prices must not turn into tap-to-call links.
	formatDetection: { telephone: false, email: false, address: false },
	appleWebApp: { title: SITE_NAME, capable: true, statusBarStyle: "default" },
	openGraph: { type: "website", locale: "en_NG", siteName: SITE_NAME, title: TITLE, description: SITE_DESCRIPTION, url: "/" },
	twitter: { card: "summary_large_image", title: TITLE, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = {
	themeColor: THEME_COLOR,
	// Shrink the layout viewport when the keyboard opens instead of covering inputs.
	interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		// suppressHydrationWarning: the inline script below adds "js" to this element before React hydrates.
		<html lang="en" className={`${dmSans.variable} antialiased`} suppressHydrationWarning>
			<head>
				{/* Marks JavaScript as on before first paint, so scroll-reveal content can start hidden without a flash. */}
				<script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
			</head>
			<body>
				<Providers>{children}</Providers>
				<RevealObserver />
			</body>
		</html>
	);
}
