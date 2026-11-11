"use client";

import clsx from "clsx";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { useExportCsv, useStatement } from "@/features/insights/hooks";
import type { Statement } from "@/features/insights/types";
import { price } from "@/lib/format";
import { backendRoutes, consoleRoutes } from "@/lib/routes";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const when = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const TYPE_LABEL: Record<Statement["entries"][number]["type"], string> = {
	sale: "Sale",
	commission: "Commission",
	refund: "Refund",
	withdrawal: "Withdrawal",
};

/**
 * Figma "Account Statements" (PRD V5), from GET /vendor/statements: over a range (default the last 30 days, a year at
 * most), the opening balance, sales, Fysi's commission, refunds, withdrawals and closing balance, then every line, oldest
 * first, with the running balance. A sale still in escrow says so. CSV download.
 */
export function StatementsView() {
	const [range, setRange] = useState(() => {
		const to = new Date();
		return { from: iso(new Date(to.getTime() - 29 * 86_400_000)), to: iso(to) };
	});
	const { data, isPending, isError, isFetching, refetch } = useStatement(range);
	const exportCsv = useExportCsv();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title="Account Statements"
				crumb="Account Statements"
				parents={[{ label: "Wallet", href: consoleRoutes.WALLET }]}
			>
				<Button
					isLoading={exportCsv.isPending}
					onClick={() => exportCsv.mutate({ url: backendRoutes.STATEMENT_CSV, params: range, name: "fysi-statement" })}
					className="h-12 gap-2 rounded-lg px-5"
				>
					<Download className="size-5" aria-hidden /> Export CSV
				</Button>
			</ListHeader>

			<form
				className="mt-8 flex flex-wrap items-end gap-3"
				onSubmit={(e) => {
					e.preventDefault();
					const f = new FormData(e.currentTarget);
					const from = String(f.get("from") || range.from);
					const to = String(f.get("to") || range.to);
					setRange(from <= to ? { from, to } : { from: to, to: from });
				}}
			>
				<label className="grid gap-1 text-sm text-ink">
					From
					<Input name="from" type="date" defaultValue={range.from} className="h-10" />
				</label>
				<label className="grid gap-1 text-sm text-ink">
					To
					<Input name="to" type="date" defaultValue={range.to} className="h-10" />
				</label>
				<Button type="submit" variant="outline" className="h-10">
					Show
				</Button>
			</form>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your statement.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-96 rounded-xl" />
				) : (
					<>
						<dl className="grid gap-4 rounded-xl border border-grey-600 bg-white p-5 sm:grid-cols-3 lg:grid-cols-7">
							{(
								[
									["Opening balance", data.openingBalance],
									["Sales", data.grossSales],
									["Commission", data.commission],
									["Refunds", data.refunds],
									["Net earnings", data.netEarnings],
									["Withdrawals", data.withdrawals],
									["Closing balance", data.closingBalance],
								] as const
							).map(([label, money]) => (
								<div key={label}>
									<dt className="text-xs text-grey-900">{label}</dt>
									<dd className={clsx("text-lg font-semibold", label === "Closing balance" ? "text-primary-500" : "text-ink")}>
										{price(money)}
									</dd>
								</div>
							))}
						</dl>

						<div className="mt-6 overflow-hidden rounded-xl border border-grey-600 bg-white">
							{data.entries.length === 0 ? (
								<p className="py-16 text-center text-sm text-grey-900">Nothing in this range.</p>
							) : (
								<div className="relative overflow-x-auto">
									<table className="w-full min-w-[760px] text-sm">
										<thead className="bg-grey-500">
											<tr>
												{["Date", "Type", "Reference", "Details", "Amount", "Balance"].map((h, i) => (
													<th
														key={h}
														scope="col"
														className={clsx(
															"px-3 py-3 text-left font-medium text-ink",
															i === 0 && "pl-5",
															i >= 4 && "text-right",
														)}
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody className="divide-y divide-grey-600">
											{data.entries.map((e, i) => (
												<tr key={i} className="text-ink">
													<td className="py-3 pr-3 pl-5 whitespace-nowrap">{when(e.at)}</td>
													<td className="px-3 py-3">{TYPE_LABEL[e.type]}</td>
													<td className="px-3 py-3 font-mono text-xs">{e.reference}</td>
													<td className="px-3 py-3 text-grey-900">
														{e.description}
														{e.type === "sale" && e.status === "held" && (
															<span className="ml-2 text-xs text-warning-700">in escrow</span>
														)}
													</td>
													<td
														className={clsx(
															"px-3 py-3 text-right whitespace-nowrap",
															e.amount.cents < 0 ? "text-error-500" : "text-success-700",
														)}
													>
														{e.amount.cents > 0 && "+"}
														{price(e.amount)}
													</td>
													<td className="px-3 py-3 pr-5 text-right whitespace-nowrap">{price(e.balance)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
