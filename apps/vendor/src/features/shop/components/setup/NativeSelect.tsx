import { ChevronDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { SETUP_FIELD } from "@/features/shop/styles";

interface Props extends Omit<React.ComponentProps<"select">, "children"> {
	placeholder: string;
	options: readonly { value: string; label: string }[];
}

/**
 * The sign-up dropdowns (Figma: field with a thin chevron). A native select, so phones get their own picker and it works
 * with the keyboard. The placeholder shows in grey until something is chosen. Pass react-hook-form's `field` through.
 */
export function NativeSelect({ placeholder, options, className, value, ...props }: Props) {
	return (
		<div className="relative">
			<select
				{...props}
				value={value}
				className={cn(SETUP_FIELD, "cursor-pointer appearance-none pr-12", !value && "text-grey-800", className)}
			>
				<option value="" disabled>
					{placeholder}
				</option>
				{options.map((o) => (
					<option key={o.value} value={o.value} className="text-ink">
						{o.label}
					</option>
				))}
			</select>
			<ChevronDown
				className="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 text-grey-900"
				strokeWidth={1.5}
				aria-hidden
			/>
		</div>
	);
}
