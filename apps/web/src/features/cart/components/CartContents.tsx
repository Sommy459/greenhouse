"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Leaf, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { cartCount, cartSubtotal, useCart, type CartItem } from "@/features/cart/store";
import { checkoutRoutes, shopRoutes } from "@/lib/routes";
import { formatPrice } from "@/lib/site";

/** The cart is persisted in the browser: render it once it's read, so server and client agree. */
const subscribe = (onChange: () => void) => useCart.persist.onFinishHydration(onChange);
const hydrated = () => useCart.persist.hasHydrated();

interface Props {
	/** Called when a link inside leaves the cart (Checkout, a product, Continue shopping): the overlay closes. */
	onNavigate?: () => void;
	/** Rendered beside the title, e.g. the overlay's × button. */
	headerAction?: React.ReactNode;
	className?: string;
}

/**
 * Figma "My Cart" (C5): title with the item count, each item (photo, name, price, chosen options, quantity, remove),
 * the subtotal and Checkout. Used by the cart overlay and the /cart page. Prices are for display: the API reprices the
 * order at checkout.
 */
export function CartContents({ onNavigate, headerAction, className }: Props) {
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const items = useCart((s) => s.items);
	const count = ready ? cartCount(items) : 0;

	return (
		<div className={cn("flex flex-col", className)}>
			<div className="flex items-center justify-between gap-4">
				<h2 className="flex items-center gap-3 text-[26px] font-semibold text-ink lg:text-[28px]">
					My Cart
					{count > 0 && (
						<span
							key={count}
							className="animate-pop grid size-8 place-items-center rounded-full bg-primary-400 text-base font-medium text-white lg:size-9"
							aria-label={`${count} items`}
						>
							{count}
						</span>
					)}
				</h2>
				{headerAction}
			</div>

			{!ready ? (
				<div className="mt-8 space-y-6" aria-hidden>
					{Array.from({ length: 2 }, (_, i) => (
						<div key={i} className="h-40 animate-pulse rounded-lg bg-grey-600" />
					))}
				</div>
			) : items.length === 0 ? (
				<EmptyCart onNavigate={onNavigate} />
			) : (
				<>
					<ul className="mt-6 space-y-6 lg:mt-[52px] lg:space-y-7">
						{items.map((item, i) => (
							<CartItemRow key={item.product_id} item={item} onNavigate={onNavigate} index={i} />
						))}
					</ul>

					<div className="mt-6 flex items-center justify-between border-y border-grey-600 py-5 lg:mt-7 lg:py-8">
						<span className="text-base text-grey-800 lg:text-lg">Subtotal:</span>
						<span className="text-lg font-semibold text-ink lg:text-xl">{formatPrice(cartSubtotal(items))}</span>
					</div>
					<p className="mt-2 text-xs text-grey-800">Delivery and any discount code are added at checkout.</p>

					<Button asChild className="mt-5 h-[50px] w-full rounded-lg text-lg font-semibold lg:mt-6 lg:h-[55px]">
						<Link href={checkoutRoutes.CHECKOUT} onClick={onNavigate}>
							Checkout
						</Link>
					</Button>
				</>
			)}
		</div>
	);
}

/**
 * One cart line. `variant="checkout"` (Figma order summary) uses a smaller photo on mobile with the price under the name.
 */
export function CartItemRow({
	item,
	onNavigate,
	variant = "cart",
	index = 0,
}: {
	item: CartItem;
	onNavigate?: () => void;
	variant?: "cart" | "checkout";
	/** Position in the list: items rise in one after another. */
	index?: number;
}) {
	const setQuantity = useCart((s) => s.setQuantity);
	const remove = useCart((s) => s.remove);
	const options = Object.entries(item.options ?? {});
	const checkout = variant === "checkout";

	return (
		<li
			className={cn(
				"animate-rise grid gap-3 lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-[18px]",
				checkout ? "grid-cols-[100px_minmax(0,1fr)]" : "grid-cols-[minmax(0,44%)_minmax(0,1fr)]",
			)}
			style={{ "--i": Math.min(index, 6) } as React.CSSProperties}
		>
			<Link
				href={shopRoutes.PRODUCT(item.slug)}
				onClick={onNavigate}
				className={cn(
					"relative overflow-hidden rounded-lg bg-grey-600 lg:aspect-[208/190]",
					checkout ? "aspect-[4/3] self-start" : "aspect-[208/190]",
				)}
			>
				{item.image ? (
					<Image
						src={item.image}
						alt={item.name}
						fill
						unoptimized
						sizes="(min-width: 1024px) 208px, 44vw"
						className="object-cover"
					/>
				) : (
					<Leaf className="absolute inset-0 m-auto size-8 text-grey-700" aria-hidden />
				)}
			</Link>

			<div className={cn("flex min-w-0 flex-col py-1", checkout ? "lg:py-3" : "lg:py-6")}>
				<div className={cn("flex items-start justify-between gap-3", checkout && "flex-col gap-0.5 lg:flex-row lg:gap-3")}>
					<Link
						href={shopRoutes.PRODUCT(item.slug)}
						onClick={onNavigate}
						className={cn(
							"min-w-0 leading-snug text-ink hover:text-primary-500 lg:text-[15px]",
							checkout ? "text-[13px]" : "text-[11px]",
						)}
					>
						{item.name}
					</Link>
					<span className="shrink-0 text-[15px] font-semibold text-ink lg:text-base">
						{formatPrice(item.price * item.quantity)}
					</span>
				</div>

				{options.length > 0 && (
					<dl className="mt-2 space-y-0.5 text-xs text-grey-800 lg:mt-3 lg:text-sm">
						{options.map(([name, value]) => (
							<div key={name}>
								<dt className="inline">{name} : </dt>
								<dd className="inline text-grey-900">{value}</dd>
							</div>
						))}
					</dl>
				)}

				<div className="mt-auto flex items-center justify-between gap-2 pt-3">
					<div className="flex h-[30px] w-[105px] items-center justify-between rounded-full border border-grey-600 bg-grey-500 px-2 lg:h-[39px] lg:w-[127px] lg:px-3">
						<button
							type="button"
							onClick={() => setQuantity(item.product_id, item.quantity - 1)}
							aria-label={item.quantity === 1 ? `Remove ${item.name}` : `Decrease ${item.name} quantity`}
							className="grid size-6 place-items-center rounded-full text-primary-400 hover:bg-grey-600"
						>
							<Minus className="size-4" />
						</button>
						<span className="text-sm text-ink lg:text-base" aria-live="polite">
							{item.quantity}
						</span>
						<button
							type="button"
							onClick={() => setQuantity(item.product_id, item.quantity + 1)}
							aria-label={`Increase ${item.name} quantity`}
							className="grid size-6 place-items-center rounded-full text-primary-400 hover:bg-grey-600"
						>
							<Plus className="size-4" />
						</button>
					</div>
					<button
						type="button"
						onClick={() => remove(item.product_id)}
						aria-label={`Remove ${item.name} from cart`}
						className="grid size-8 place-items-center rounded-md text-grey-800 hover:bg-grey-500 hover:text-error-500"
					>
						<Trash2 className="size-5" strokeWidth={1.75} />
					</button>
				</div>
			</div>
		</li>
	);
}

function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className="mt-16 flex flex-col items-center text-center">
			<span className="grid size-16 place-items-center rounded-full bg-grey-500 text-primary-500">
				<ShoppingCart className="size-7" aria-hidden />
			</span>
			<p className="mt-4 text-base font-medium text-ink">Your cart is empty</p>
			<p className="mt-1 text-sm text-grey-800">Eco-friendly finds are waiting for you.</p>
			<Button asChild className="mt-6 h-11 rounded-lg px-6">
				<Link href={shopRoutes.HOME} onClick={onNavigate}>
					Continue shopping
				</Link>
			</Button>
		</div>
	);
}
