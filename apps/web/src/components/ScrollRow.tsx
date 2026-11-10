"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A horizontal row that scrolls (touch, trackpad, or the arrow buttons) with snap points. Give each child its own
 * width class (e.g. `w-[46%] md:w-[31%] lg:w-[23.5%]`), so the number of visible items follows the design per breakpoint.
 */
export function useScrollRow() {
	const ref = useRef<HTMLDivElement>(null);
	const scroll = (direction: 1 | -1) => {
		const el = ref.current;
		if (el) el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
	};
	return { ref, prev: () => scroll(-1), next: () => scroll(1) };
}

export function ScrollRow({ rowRef, label, children }: { rowRef: React.RefObject<HTMLDivElement | null>; label: string; children: React.ReactNode }) {
	return (
		<div ref={rowRef} role="region" aria-label={label} className="hide-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth lg:gap-5">
			{children}
		</div>
	);
}

/** The dark-green round arrows the design puts beside section titles. */
export function ScrollArrows({ onPrev, onNext, className = "" }: { onPrev: () => void; onNext: () => void; className?: string }) {
	const button = "grid size-6 place-items-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-400";
	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<button type="button" onClick={onPrev} aria-label="Previous" className={button}>
				<ChevronLeft className="size-4" />
			</button>
			<button type="button" onClick={onNext} aria-label="Next" className={button}>
				<ChevronRight className="size-4" />
			</button>
		</div>
	);
}
