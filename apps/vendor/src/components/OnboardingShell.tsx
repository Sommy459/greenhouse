import { Logo } from "@/components/Logo";
import { asset } from "@/lib/site";

/** Left-panel photo (Figma vendor onboarding). Not in the repo yet: see public/images/onboarding/README.md. */
const ONBOARDING_IMAGE = asset("/images/onboarding/vendor.jpg");

/**
 * Figma vendor onboarding layout: on desktop a photo with "Go Green With Us" fills the left ~44% and stays fixed while
 * the form column scrolls; the logo sits centred above the form. Mobile is the form column alone.
 */
export function OnboardingShell({ children }: { children: React.ReactNode }) {
	return (
		<main className="flex min-h-dvh bg-grey-500">
			<div className="relative hidden h-dvh w-[44%] shrink-0 self-start overflow-hidden bg-primary-400 lg:sticky lg:top-0 lg:block">
				{/* The photo settles from a slight zoom; the words rise in after it. */}
				<div
					className="animate-zoom absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url("${ONBOARDING_IMAGE}")` }}
					aria-hidden
				/>
				<div className="absolute top-[37%] right-8 left-[5.4vw] text-white">
					<p
						className="animate-rise text-[clamp(48px,5vw,76px)] leading-[1.15] font-semibold"
						style={{ "--i": 3 } as React.CSSProperties}
					>
						Go Green
						<br />
						With Us
					</p>
					<p className="animate-rise mt-3 text-lg" style={{ "--i": 5 } as React.CSSProperties}>
						List your eco-friendly products in our store
					</p>
				</div>
			</div>

			<div className="flex flex-1 justify-center px-4 pt-28 pb-16 sm:px-8 lg:items-center lg:pt-16">
				{/* Wide enough for the shop details step (Figma ~660px); the narrower steps centre themselves at 450px. */}
				<div className="w-full max-w-[660px]">
					<div className="animate-pop flex justify-center">
						<Logo badge={false} size="lg" />
					</div>
					<div className="mt-6">{children}</div>
				</div>
			</div>
		</main>
	);
}
