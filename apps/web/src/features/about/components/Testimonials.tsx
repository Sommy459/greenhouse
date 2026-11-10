"use client";

import { Quote, UserRound } from "lucide-react";
import { ScrollArrows, useScrollRow } from "@/components/ScrollRow";
import { StarRating } from "@/features/catalog/components/product/StarRating";
import { TESTIMONIALS } from "@/features/about/content";

/**
 * Figma "Testimonial": quote cards that scroll sideways with the arrows on desktop and stack on mobile. People show a
 * person icon until real, permitted photos are supplied.
 */
export function Testimonials() {
	const { ref, prev, next } = useScrollRow();

	return (
		<section aria-labelledby="testimonials-title" className="animate-reveal">
			<div className="mb-4 flex items-center justify-between gap-4 lg:mb-5">
				<h2 id="testimonials-title" className="text-[26px] font-semibold text-ink lg:text-[28px]">
					Testimonial
				</h2>
				<ScrollArrows onPrev={prev} onNext={next} className="hidden lg:flex" />
			</div>

			<div
				ref={ref}
				role="region"
				aria-label="Testimonials"
				className="hide-scroll flex flex-col gap-8 lg:flex-row lg:snap-x lg:snap-mandatory lg:gap-3 lg:overflow-x-auto lg:scroll-smooth"
			>
				{TESTIMONIALS.map((t) => (
					<figure
						key={t.name}
						className="hover-lift flex shrink-0 snap-start flex-col lg:w-[424px] lg:rounded-md lg:border lg:border-grey-600 lg:bg-white lg:px-6 lg:py-5"
					>
						<Quote className="size-7 rotate-180 fill-primary-500 text-primary-500" aria-hidden />
						<blockquote className="mt-3 text-sm leading-snug text-ink lg:text-[13px]">{t.quote}</blockquote>
						<figcaption className="mt-5 flex items-center gap-3 lg:mt-auto lg:pt-6">
							<span className="grid size-10 shrink-0 place-items-center rounded-full bg-grey-600 text-ink">
								<UserRound className="size-5" aria-hidden />
							</span>
							<span className="min-w-0">
								<span className="block text-sm font-medium text-ink">{t.name}</span>
								<span className="block text-[11px] text-grey-800">{t.role}</span>
							</span>
							<span className="ml-auto">
								<StarRating rating={t.rating} className="size-4" />
							</span>
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	);
}
