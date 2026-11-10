import clsx from "clsx";
import Image from "next/image";
import type { User } from "@/features/auth/types";

/** The profile photo, or the initials until there is one. `src` overrides it (a photo being chosen in Settings). */
export function Avatar({ user, src, className }: { user: User | null; src?: string | null; className?: string }) {
	const photo = src ?? user?.avatarUrl ?? null;
	const initials =
		(user?.name ?? "")
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((n) => n.charAt(0).toUpperCase())
			.join("") || "?";
	return (
		<span
			className={clsx(
				"relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-50 font-medium text-primary-500",
				className,
			)}
			aria-hidden
		>
			{photo ? <Image src={photo} alt="" fill unoptimized sizes="96px" className="object-cover" /> : initials}
		</span>
	);
}
