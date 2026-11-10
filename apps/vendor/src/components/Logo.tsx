import Link from "next/link";
import { FysiLogo, type FysiLogoSize } from "@repo/ui/fysi-logo";

/**
 * The Fysi logo (bag mark + FYSI wordmark, exported from Figma). `badge` adds "Seller" (console); the onboarding design
 * shows the plain logo, larger.
 */
export function Logo({
	href = "/",
	tone = "dark",
	badge = true,
	size = "sm",
}: {
	href?: string;
	tone?: "dark" | "light";
	badge?: boolean;
	size?: FysiLogoSize;
}) {
	return (
		<Link
			href={href}
			aria-label="Fysi Seller Centre home"
			className={`flex items-center gap-2 ${tone === "light" ? "text-white" : "text-primary-500"}`}
		>
			<FysiLogo size={size} />
			{badge && <span className="rounded bg-lime-400 px-1.5 py-0.5 text-[11px] font-semibold text-ink">Seller</span>}
		</Link>
	);
}
