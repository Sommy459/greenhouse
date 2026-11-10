"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useDeleteCustomer } from "@/features/customers/hooks";
import type { AdminCustomer, CustomerStatus } from "@/features/customers/types";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

interface Props {
	customers: AdminCustomer[];
	loading: boolean;
	rows: number;
	selected: Set<string>;
	onSelectedChange: (selected: Set<string>) => void;
}

const STATUS: Record<CustomerStatus, { label: string; tone: string }> = {
	active: { label: "Active", tone: "bg-success-50 text-success-700" },
	blocked: { label: "Blocked", tone: "bg-error-50 text-error-500" },
};
const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-5 text-base whitespace-nowrap text-ink";
const ICON = "grid size-9 place-items-center rounded-md text-grey-900 transition-colors";

/** Figma customer list: tick, photo with name and e-mail, phone, orders, balance, date created, status, view / delete. */
export function CustomersTable({ customers, loading, rows, selected, onSelectedChange }: Props) {
	const [deleting, setDeleting] = useState<AdminCustomer | null>(null);
	const deleteCustomer = useDeleteCustomer();
	const pageIds = customers.map((c) => c.id);
	const ticked = pageIds.filter((id) => selected.has(id)).length;

	const toggleAll = () => {
		const next = new Set(selected);
		if (ticked === pageIds.length) pageIds.forEach((id) => next.delete(id));
		else pageIds.forEach((id) => next.add(id));
		onSelectedChange(next);
	};
	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onSelectedChange(next);
	};

	return (
		<>
			<div className="overflow-x-auto rounded-t-lg border border-grey-600 bg-white">
				<table className="w-full min-w-[1040px]">
					<thead className="border-b border-grey-600 bg-grey-500">
						<tr>
							<th scope="col" className="w-14 py-4 pl-8">
								<Checkbox
									aria-label="Select all customers on this page"
									disabled={loading || pageIds.length === 0}
									checked={pageIds.length > 0 && ticked === pageIds.length ? true : ticked > 0 ? "indeterminate" : false}
									onCheckedChange={toggleAll}
									className="size-5"
								/>
							</th>
							{["Customer Name", "Phone Number", "Orders", "Balance", "Date Created", "Status"].map((h) => (
								<th key={h} scope="col" className={TH}>
									{h}
								</th>
							))}
							<th scope="col" className={clsx(TH, "pr-6 text-center")}>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-grey-600">
						{loading
							? Array.from({ length: rows }, (_, i) => (
									<tr key={i}>
										<td colSpan={8} className="px-8 py-4">
											<Skeleton className="h-12 w-full" />
										</td>
									</tr>
								))
							: customers.map((c, i) => {
									const name = `${c.first_name} ${c.last_name}`;
									return (
										<tr
											key={c.id}
											data-selected={selected.has(c.id)}
											className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
											style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
										>
											<td className="py-5 pl-8">
												{/* Round tick boxes on rows (Figma). */}
												<Checkbox
													aria-label={`Select ${name}`}
													checked={selected.has(c.id)}
													onCheckedChange={() => toggle(c.id)}
													className="size-5 rounded-full"
												/>
											</td>
											<td className="px-3 py-3">
												<Link href={consoleRoutes.CUSTOMER(c.id)} className="group flex items-center gap-3">
													<UserAvatar name={name} className="size-12" />
													<span className="min-w-0 leading-tight">
														<span className="block max-w-[220px] truncate text-base text-ink group-hover:text-primary-500 group-hover:underline">
															{name}
														</span>
														<span className="mt-0.5 block max-w-[220px] truncate text-base text-grey-900">{c.email}</span>
													</span>
												</Link>
											</td>
											<td className={TD}>{c.phone_number}</td>
											<td className={TD}>{count(c.orders_count)}</td>
											<td className={TD}>{naira(c.balance, 2)}</td>
											<td className={TD}>
												<time dateTime={c.created_at}>{date(c.created_at)}</time>
											</td>
											<td className={TD}>
												<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", STATUS[c.status].tone)}>
													{STATUS[c.status].label}
												</span>
											</td>
											<td className="py-3 pr-6 pl-3">
												<div className="flex items-center justify-center gap-1">
													<Link
														href={consoleRoutes.CUSTOMER(c.id)}
														aria-label={`View ${name}`}
														title="View"
														className={clsx(ICON, "hover:bg-grey-500 hover:text-primary-500")}
													>
														<Eye className="size-5" />
													</Link>
													<button
														type="button"
														onClick={() => setDeleting(c)}
														aria-label={`Delete ${name}`}
														title="Delete"
														className={clsx(ICON, "hover:bg-error-50 hover:text-error-500")}
													>
														<Trash2 className="size-5" />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
					</tbody>
				</table>
			</div>

			<AlertDialog open={!!deleting} onOpenChange={(open) => !open && !deleteCustomer.isPending && setDeleting(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {deleting?.first_name} {deleting?.last_name}&apos;s account?
						</AlertDialogTitle>
						<AlertDialogDescription>
							They won&apos;t be able to sign in, and their account will be removed for good. To stop them for now, block them
							instead.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteCustomer.isPending}>Keep account</AlertDialogCancel>
						<AlertDialogAction
							disabled={deleteCustomer.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								// Stay open until the API answers.
								e.preventDefault();
								if (deleting)
									deleteCustomer.mutate(deleting, {
										onSuccess: () => {
											const next = new Set(selected);
											next.delete(deleting.id);
											onSelectedChange(next);
											setDeleting(null);
										},
									});
							}}
						>
							{deleteCustomer.isPending ? "Deleting…" : "Delete account"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
