import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Auth photo (Figma auth screens, left panel) at 2x, with the design's green tint and blur already applied. */
const AUTH_IMAGE = "/images/auth/auth.jpg";

/**
 * Figma customer auth layout: on desktop the photo fills the left ~44% and stays fixed (sticky, one screen tall) while
 * the form column on the right scrolls. Mobile is the form column alone.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex min-h-dvh bg-grey-500">
			<div
				className="relative hidden h-dvh w-[44%] shrink-0 self-start overflow-hidden bg-primary-300 lg:sticky lg:top-0 lg:block"
				aria-hidden
			>
				<Image
					src={AUTH_IMAGE}
					alt=""
					fill
					priority
					quality={90}
					sizes="44vw"
					className="animate-zoom object-cover object-center"
				/>
			</div>
			<div className="flex flex-1 justify-center px-4 pt-24 pb-16 sm:px-8 lg:pt-36">
				<div className="w-full max-w-[440px]">
					<div className="animate-pop flex justify-center">
						<Logo size="lg" />
					</div>
					<div className="mt-10 lg:mt-12">{children}</div>
				</div>
			</div>
		</main>
	);
}
