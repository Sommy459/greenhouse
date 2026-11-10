import { Leaf, Sparkle } from "lucide-react";
import { backgroundImage, LANDING_IMAGES } from "@/features/home/images";
import { SITE_NAME } from "@/lib/site";

/**
 * Dark green band: title and the olive star with its message (left), photo (centre), the "hero" line (right).
 * Mobile shows the left panel only, as in the design. The butterfly and starburst are stand-ins (Leaf, Sparkle)
 * until those icons are exported from Figma.
 */
export function SustainabilityHighlight() {
	return (
		<section className="animate-reveal mt-12 bg-primary-500 lg:mt-16 lg:grid lg:min-h-[676px] lg:grid-cols-[1fr_1.42fr_1fr]">
			<div className="relative min-h-[560px] overflow-hidden px-6 pt-6 lg:min-h-0 lg:px-12">
				<Leaf className="size-12 -rotate-12 text-lime-800" aria-hidden />
				<h2 className="mt-10 text-[28px] leading-tight font-semibold text-white lg:mt-8">
					Sustainability
					<br />
					Highlight
				</h2>
				<Star className="absolute right-0 bottom-0 h-[300px] w-[260px] lg:right-auto lg:left-[30%]" />
				<p className="absolute right-6 bottom-8 left-6 text-sm leading-snug text-white lg:right-auto lg:max-w-[280px]">
					Shop confidently with our eco-certified vendors—
					<strong className="font-semibold">your choices make a real difference.</strong>
				</p>
			</div>
			<div
				className="hidden bg-grey-500 bg-cover bg-center lg:block"
				style={backgroundImage(LANDING_IMAGES.sustainability)}
				role="img"
				aria-label="Eco-friendly products"
			/>
			<div className="hidden flex-col justify-center gap-3 px-10 lg:flex">
				<Sparkle className="size-6 fill-lime-500 text-lime-500" aria-hidden />
				<p className="max-w-[280px] text-sm leading-snug text-white">
					Shopping on {SITE_NAME} means you are helping to build a more sustainable world and that makes you a hero.
				</p>
			</div>
		</section>
	);
}

/** The tall four-point olive star behind the message. */
function Star({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 100 120" preserveAspectRatio="none" className={`fill-brand-olive/60 ${className}`} aria-hidden>
			<polygon points="50,0 62,48 100,60 62,72 50,120 38,72 0,60 38,48" />
		</svg>
	);
}
