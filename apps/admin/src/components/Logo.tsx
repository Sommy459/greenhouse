import Link from "next/link";
import { FysiLogo } from "@repo/ui/fysi-logo";

/** The Fysi logo (bag mark + FYSI wordmark, exported from Figma) with an "Admin" badge. */
export function Logo({ href = "/", tone = "dark" }: { href?: string; tone?: "dark" | "light" }) {
	return (
		<Link
			href={href}
			aria-label="Fysi Admin home"
			className={`flex items-center gap-2 ${tone === "light" ? "text-white" : "text-primary-600"}`}
		>
			<FysiLogo size="sm" />
			<span className="rounded bg-lime-400 px-1.5 py-0.5 text-[11px] font-semibold text-ink">Admin</span>
		</Link>
	);
}
