import clsx from "clsx";
import Image from "next/image";

/** A person's photo, or their initials in a circle when there's none, with an optional green "online" dot. */
export function UserAvatar({
	name,
	src,
	online = false,
	className,
	textClassName = "text-sm",
}: {
	name: string;
	src?: string | null;
	online?: boolean;
	className?: string;
	textClassName?: string;
}) {
	const initials =
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]!.toUpperCase())
			.join("") || "A";

	return (
		<span className={clsx("relative inline-flex shrink-0 rounded-full", className)}>
			{src ? (
				<span className="relative size-full overflow-hidden rounded-full bg-grey-500">
					{/* Photos come from the API's storage (or a local preview), so they skip Next's optimiser. */}
					<Image src={src} alt="" fill sizes="160px" unoptimized className="object-cover" />
				</span>
			) : (
				<span
					aria-hidden
					className={clsx(
						"flex size-full items-center justify-center rounded-full bg-lime-400 font-semibold text-primary-600",
						textClassName,
					)}
				>
					{initials}
				</span>
			)}
			{online && (
				<span aria-hidden className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-success-500" />
			)}
		</span>
	);
}
