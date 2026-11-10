"use client";

import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { isSignedIn, useSession } from "@/features/auth/session";
import type { Product } from "@/features/catalog/types";
import { useToggleWishlist, useWishlist } from "@/features/wishlist/hooks";
import { authRoutes } from "@/lib/routes";

/** The round heart on product cards and the product page (C10): saves or removes. Signed-out shoppers sign in first. */
export function WishlistButton({ product, className = "" }: { product: Product; className?: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const signedIn = useSession(isSignedIn);
	const { data: saved } = useWishlist();
	const toggle = useToggleWishlist();
	const isSaved = !!saved?.some((p) => p.id === product.id);

	const onClick = () => {
		if (!signedIn) {
			router.push(authRoutes.SIGN_IN(pathname));
			return;
		}
		toggle.mutate({ product, saved: isSaved });
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={toggle.isPending}
			aria-pressed={isSaved}
			aria-label={isSaved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
			className={`grid size-8 place-items-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-400 ${className}`}
		>
			<Heart className={isSaved ? "size-4 fill-current" : "size-4"} />
		</button>
	);
}
