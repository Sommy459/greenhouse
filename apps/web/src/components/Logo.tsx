import Link from "next/link";
import { FysiLogo, type FysiLogoSize } from "@repo/ui/fysi-logo";
import { SITE_NAME } from "@/lib/site";

type Props = Omit<React.ComponentProps<typeof Link>, "href" | "children"> & {
	href?: string;
	tone?: "dark" | "light";
	size?: FysiLogoSize;
};

/**
 * The Fysi logo (bag mark + FYSI wordmark, exported from Figma), linking home. `tone="light"` for dark backgrounds.
 * Other props reach the link, so wrappers like SheetClose asChild can add their click handler.
 */
export function Logo({ href = "/", tone = "dark", size = "md", className = "", ...props }: Props) {
	return (
		<Link
			href={href}
			aria-label={`${SITE_NAME} home`}
			className={`flex shrink-0 items-center ${tone === "light" ? "text-white" : "text-primary-500"} ${className}`}
			{...props}
		>
			<FysiLogo size={size} />
		</Link>
	);
}
