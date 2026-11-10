import { Star } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

/** Five stars, filled up to `rating` (used by the About page testimonials). */
export function StarRating({ rating, className }: { rating: number; className?: string }) {
	return (
		<span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className={cn("size-4", i < Math.round(rating) ? "fill-lime-500 text-lime-500" : "text-grey-700", className)}
					aria-hidden
				/>
			))}
		</span>
	);
}
