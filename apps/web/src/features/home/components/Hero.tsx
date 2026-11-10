import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { backgroundImage, LANDING_IMAGES } from "@/features/home/images";
import { shopRoutes } from "@/lib/routes";
import { SITE_TAGLINE } from "@/lib/site";

/** Full-width photo (green tint baked into the export), centred headline, white "Shop Now". */
export function Hero() {
	return (
		<section className="relative isolate overflow-hidden bg-primary-400">
			<div
				className="animate-zoom absolute inset-0 -z-10 bg-cover bg-center"
				style={backgroundImage(LANDING_IMAGES.hero)}
				aria-hidden
			/>
			<div className="flex h-[250px] flex-col items-center justify-center px-4 text-center md:h-[420px] lg:h-[582px]">
				<h1 className="animate-rise text-[34px] leading-[1.15] font-semibold text-white md:text-6xl lg:text-[88px] lg:leading-[1.1]">
					Eco – Products,
					<br />
					Made for You
				</h1>
				<p
					className="animate-rise mt-2 text-xs text-white md:text-lg lg:mt-4 lg:text-2xl"
					style={{ "--i": 1 } as React.CSSProperties}
				>
					{SITE_TAGLINE}
				</p>
				{/* The entrance animation sits on this wrapper: an element's own fill-mode animation would block its hover lift. */}
				<div className="animate-rise mt-4 lg:mt-8" style={{ "--i": 2 } as React.CSSProperties}>
					<Link
						href={shopRoutes.SEARCH()}
						className="group inline-flex items-center rounded-sm bg-white px-4 py-1.5 text-[10px] font-semibold text-primary-500 shadow-md transition-all duration-300 ease-spring hover:-translate-y-1 hover:scale-105 hover:bg-lime-400 hover:text-primary-600 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-lime-300/60 focus-visible:outline-none active:translate-y-0 active:scale-95 motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 lg:px-7 lg:py-3 lg:text-sm"
					>
						Shop Now
						{/* The arrow slides out from behind the text on hover. */}
						<ArrowRight
							className="-ml-3 size-3 opacity-0 transition-all duration-300 ease-spring group-hover:ml-1.5 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:opacity-100 lg:size-4"
							aria-hidden
						/>
					</Link>
				</div>
			</div>
		</section>
	);
}
