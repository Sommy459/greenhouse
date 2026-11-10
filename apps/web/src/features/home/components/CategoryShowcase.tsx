"use client";

import Link from "next/link";
import { ScrollRow, useScrollRow } from "@/components/ScrollRow";
import { SectionHeader } from "@/components/SectionHeader";
import { backgroundImage } from "@/features/home/images";
import { CATEGORY_LINKS } from "@/lib/navigation";

/** Category photo tiles with a dark-green label, three across on desktop, scrolling with the arrows. */
export function CategoryShowcase() {
	const { ref, prev, next } = useScrollRow();

	return (
		<section className="shop-container animate-reveal mt-10">
			<SectionHeader title="Categories" onPrev={prev} onNext={next} />
			<ScrollRow rowRef={ref} label="Categories">
				{CATEGORY_LINKS.map((category) => (
					<Link
						key={category.href}
						href={category.href}
						className="group hover-lift relative aspect-[9/10] w-[46%] shrink-0 snap-start overflow-hidden rounded-sm bg-primary-400 md:aspect-[13/10] md:w-[31.5%] lg:w-[calc((100%-40px)/3)]"
					>
						<span
							className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
							style={backgroundImage(category.image)}
							aria-hidden
						/>
						<span className="absolute bottom-3 left-0 bg-primary-500 px-3 py-2 text-xs text-white lg:px-4 lg:py-2.5">
							{category.label}
						</span>
					</Link>
				))}
			</ScrollRow>
		</section>
	);
}
