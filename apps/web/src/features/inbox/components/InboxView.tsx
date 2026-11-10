"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { useInbox } from "@/features/inbox/hooks";
import { accountRoutes, shopRoutes } from "@/lib/routes";

/** Figma "13 July" (with the year once it isn't this year's). */
function day(iso: string) {
	const d = new Date(iso);
	const sameYear = d.getFullYear() === new Date().getFullYear();
	return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", ...(sameYear ? {} : { year: "numeric" }) });
}

/**
 * Figma "Messages" (desktop) and "Inbox" (phones), PRD C11: order updates and notes from Fysi, newest first. An order
 * update has "View Details" (its Order Detail) and, when it's about the parcel, the product card.
 */
export function InboxView() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, isFetching, refetch } = useInbox(page);
	const messages = data?.items ?? [];

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Inbox</h1>
			</Link>

			<section
				aria-label="Messages"
				className={clsx("mt-6 transition-opacity lg:mt-0 lg:min-h-[900px] lg:bg-white", isFetching && !isPending && "opacity-60")}
			>
				<h1 id="messages-title" className="hidden border-b border-grey-600 px-10 py-6 text-[28px] text-ink lg:block">
					Messages
				</h1>

				{isError ? (
					<div className="bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your messages.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && messages.length === 0 ? (
					<p className="bg-white py-16 text-center text-base text-grey-900">
						No messages yet. Updates about your orders show up here.
					</p>
				) : (
					<ul className="space-y-8 lg:space-y-0 lg:divide-y lg:divide-grey-600">
						{isPending
							? Array.from({ length: 3 }, (_, i) => (
									<li key={i} className="bg-white p-4 lg:px-9 lg:py-8">
										<Skeleton className="h-5 w-24" />
										<Skeleton className="mt-5 h-16 w-full" />
									</li>
								))
							: messages.map((m, i) => (
									<li
										key={m.id}
										className="animate-rise bg-white px-4 py-5 lg:px-9 lg:py-8"
										style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
									>
										<div className="flex items-start justify-between gap-4">
											<p className="text-lg text-grey-900 lg:text-base">
												<time dateTime={m.created_at}>{day(m.created_at)}</time>
											</p>
											{m.order && (
												<Link
													href={accountRoutes.ORDER(m.order.id)}
													className="shrink-0 text-base text-primary-500 hover:underline lg:text-lg"
													aria-label={`View details of order ${m.order.number}`}
												>
													View Details
												</Link>
											)}
										</div>
										<div className="mt-4 text-lg leading-snug text-grey-900 lg:mt-7 lg:text-base">
											<p>{m.title}</p>
											<p>{m.body}</p>
										</div>
										{m.product && (
											<Link
												href={shopRoutes.PRODUCT(m.product.slug)}
												className="mt-6 flex gap-8 rounded-lg border border-grey-800 p-4 transition-colors hover:border-primary-500 lg:mt-9 lg:max-w-[900px] lg:p-3"
											>
												<span className="relative h-[130px] w-[140px] shrink-0 overflow-hidden rounded-md bg-grey-600 lg:h-[154px] lg:w-[167px]">
													{m.product.image_url && (
														<Image src={m.product.image_url} alt="" fill sizes="167px" className="object-cover" />
													)}
												</span>
												<span className="pt-2 text-lg text-grey-900 lg:text-base">{m.product.name}</span>
											</Link>
										)}
									</li>
								))}
					</ul>
				)}

				{data && data.meta.total_pages > 1 && (
					<div className="py-8">
						<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
					</div>
				)}
			</section>
		</div>
	);
}
