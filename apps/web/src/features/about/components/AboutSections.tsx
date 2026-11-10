import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";
import { ABOUT_SECTIONS } from "@/features/about/content";

/**
 * Figma About Us: each section is text beside a photo, alternating sides on desktop (text first, then photo on the
 * left); on mobile the text comes first, then the photo.
 */
export function AboutSections() {
	return (
		<div className="space-y-12 lg:space-y-[66px]">
			{ABOUT_SECTIONS.map((section, i) => {
				const photoFirst = i % 2 === 1;
				return (
					<section
						key={section.id}
						id={section.id}
						aria-labelledby={`${section.id}-title`}
						className="animate-reveal grid scroll-mt-6 items-center gap-5 lg:grid-cols-2 lg:gap-8"
					>
						<div className={cn("min-w-0", photoFirst && "lg:order-2")}>
							<h2 id={`${section.id}-title`} className="text-[26px] font-semibold text-ink lg:text-[28px]">
								{section.title}
							</h2>
							{section.body && <p className="mt-2 text-[15px] leading-snug text-ink lg:mt-1 lg:text-[17px]">{section.body}</p>}
							{section.points && (
								<ul className="mt-3 list-disc space-y-2.5 pl-5 text-[15px] leading-snug text-ink lg:text-[17px]">
									{section.points.map((point) => (
										<li key={point.label}>
											<span className="text-primary-400">{point.label}:</span> {point.text}
										</li>
									))}
								</ul>
							)}
						</div>
						<div
							className={cn(
								"relative aspect-[1181/741] overflow-hidden rounded-md border border-grey-600 bg-grey-600",
								photoFirst && "lg:order-1",
							)}
						>
							<Image
								src={section.image}
								alt={section.imageAlt}
								fill
								sizes="(min-width: 1024px) 600px, 100vw"
								className="object-cover"
							/>
						</div>
					</section>
				);
			})}
		</div>
	);
}
