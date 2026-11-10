import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { StoreFooter } from "@/components/layouts/StoreFooter";
import { StoreHeader } from "@/components/layouts/StoreHeader";
import { RecentlyViewedRow } from "@/features/catalog/components/RecentlyViewedRow";
import { shopRoutes } from "@/lib/routes";
import { Newsletter } from "@/features/home/components/Newsletter";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

/**
 * Figma 404 page: "Oops!", the worried 404 (orange on desktop, green on mobile, as designed), "Go to Home page", then
 * Recently Viewed, inside the store header and footer. The artwork is cut from the Figma screens (public/images/errors).
 */
export default function NotFound() {
	return (
		<>
			<StoreHeader />
			<main className="min-w-0">
				<div className="bg-grey-500">
					<div className="shop-container pt-10 pb-10 lg:pt-9 lg:pb-12">
						<div className="flex flex-col items-center text-center">
							<h1 className="text-[26px] text-ink lg:text-[60px] lg:leading-none">Oops!</h1>
							<p className="sr-only">
								Error 404: we couldn&apos;t find this page. It may have been moved, or the link was mistyped.
							</p>

							{/* The worried 404 bobs gently (off for reduced motion). */}
							<Image
								src="/images/errors/404-mobile.png"
								alt=""
								width={517}
								height={229}
								priority
								className="animate-float mt-8 h-auto w-[300px] lg:hidden"
							/>
							<Image
								src="/images/errors/404-desktop.png"
								alt=""
								width={1964}
								height={844}
								priority
								sizes="980px"
								className="animate-float mt-11 hidden h-auto w-full max-w-[980px] lg:block"
							/>

							<Button
								asChild
								className="mt-14 h-14 rounded-lg px-8 text-lg font-semibold lg:mt-12 lg:h-[50px] lg:bg-brand-amber lg:px-8 lg:text-base lg:hover:bg-brand-amber/90"
							>
								<Link href={shopRoutes.HOME}>Go to Home page</Link>
							</Button>
						</div>

						<div className="mt-14 lg:mt-24">
							<RecentlyViewedRow />
						</div>
					</div>
				</div>
				<Newsletter />
			</main>
			<StoreFooter />
		</>
	);
}
