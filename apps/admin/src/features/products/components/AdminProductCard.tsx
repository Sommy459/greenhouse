"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUp, EllipsisVertical, Eye, EyeOff, ImageOff, RotateCcw, Store, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Skeleton } from "@repo/ui/skeleton";
import { ModerationDialog, type ModerationAction } from "@/features/products/components/ModerationDialog";
import { useSetProductVisibility } from "@/features/products/hooks";
import type { AdminProduct } from "@/features/products/types";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/**
 * Figma product card: photo, name, category and price; the description; then sold count and stock (bar = share sold).
 * The ⋮ menu adds moderation (PRD A5): hide / show and remove. Hidden products are faded and carry the reason.
 */
export function AdminProductCard({ product }: { product: AdminProduct }) {
	const soldShare = product.quantity > 0 ? Math.min(product.sold / product.quantity, 1) : 0;
	const hidden = product.visibility === "hidden";
	const [action, setAction] = useState<ModerationAction | null>(null);
	const show = useSetProductVisibility();

	return (
		<article
			className={clsx(
				"hover-lift flex h-full flex-col rounded-2xl border bg-white p-4",
				hidden ? "border-dashed border-grey-800" : "border-grey-600",
			)}
		>
			<div className="flex gap-3.5">
				<div
					className={clsx(
						"relative size-[120px] shrink-0 overflow-hidden rounded-lg bg-grey-500",
						hidden && "opacity-50 grayscale",
					)}
				>
					{product.image_url ? (
						<Image src={product.image_url} alt="" fill sizes="120px" className="object-cover" />
					) : (
						<ImageOff className="absolute inset-0 m-auto size-6 text-grey-700" aria-hidden />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<h3 className="truncate text-base font-semibold text-ink">{product.name}</h3>
						{/* Not modal: its items open dialogs, and a modal menu would leave the page unclickable. */}
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									aria-label={`${product.name} options`}
									className="-mr-1 shrink-0 rounded-md p-1 hover:bg-grey-500"
								>
									<EllipsisVertical className="size-5 text-ink" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-52">
								<DropdownMenuItem asChild>
									<Link href={consoleRoutes.PRODUCT(product.id)}>
										<Eye /> View details
									</Link>
								</DropdownMenuItem>
								{product.vendor && (
									<DropdownMenuItem asChild>
										<Link href={consoleRoutes.VENDOR(product.vendor.id)}>
											<Store /> View vendor
										</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								{hidden ? (
									<DropdownMenuItem
										disabled={show.isPending}
										onSelect={() => show.mutate({ id: product.id, visibility: "visible" })}
									>
										<RotateCcw /> Show in store
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem onSelect={() => setAction("hide")}>
										<EyeOff /> Hide from store
									</DropdownMenuItem>
								)}
								<DropdownMenuItem onSelect={() => setAction("remove")} className="text-error-500 focus:text-error-500">
									<Trash2 className="text-error-500" /> Remove listing
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<p className="truncate text-sm text-grey-900">{product.category}</p>
					{product.vendor && (
						<Link
							href={consoleRoutes.VENDOR(product.vendor.id)}
							className="block truncate text-sm text-primary-500 hover:underline"
						>
							{product.vendor.shop_name}
						</Link>
					)}
					<p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
						{naira(product.price, 2)}
						{hidden && <span className="rounded-full bg-grey-500 px-2 py-0.5 text-xs font-medium text-grey-900">Hidden</span>}
					</p>
				</div>
			</div>

			{hidden && product.hidden_reason ? (
				<p className="mt-4 mb-5 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-700">
					<span className="font-medium">Hidden:</span> {product.hidden_reason}
				</p>
			) : (
				<>
					<h4 className="mt-4 text-base font-medium text-ink">Description</h4>
					<p className="mt-1 mb-5 line-clamp-2 text-sm text-grey-900">{product.description}</p>
				</>
			)}

			<dl className="mt-auto divide-y divide-grey-600 rounded-lg border border-grey-600 px-3.5 text-sm text-ink [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:py-2.5">
				<div>
					<dt>Sold</dt>
					<dd className="flex items-center gap-1.5 text-grey-900">
						<ArrowUp className="size-4 text-success-500" aria-hidden />
						{count(product.sold)}
					</dd>
				</div>
				<div>
					<dt>Quantity</dt>
					<dd className="flex items-center gap-2.5 text-grey-900">
						<span
							className="h-1 w-12 overflow-hidden rounded-full bg-grey-600"
							role="img"
							aria-label={`${Math.round(soldShare * 100)}% sold`}
						>
							<span className="block h-full rounded-full bg-primary-300" style={{ width: `${soldShare * 100}%` }} />
						</span>
						{count(product.quantity)}
					</dd>
				</div>
			</dl>

			<ModerationDialog product={product} action={action} onClose={() => setAction(null)} />
		</article>
	);
}

export function AdminProductCardSkeleton() {
	return <Skeleton className="h-[330px] rounded-2xl" />;
}
