import { ArrowLeft } from "lucide-react";

/** Small "Back" link above a step's first field (not in the design, which has no way back). */
export function BackLink({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="mb-4 flex w-fit items-center gap-1.5 text-sm text-grey-900 hover:text-primary-500"
		>
			<ArrowLeft className="size-4" aria-hidden />
			Back
		</button>
	);
}
