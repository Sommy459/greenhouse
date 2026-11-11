"use client";

import clsx from "clsx";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { ExportButton } from "@/components/ExportButton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { UserAvatar } from "@/components/UserAvatar";
import type { Role } from "@/features/auth/types";
import { useUsers } from "@/features/users/hooks";
import { ROLE_LABEL } from "@/features/users/types";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 15;
const ROLES: Role[] = ["customer", "vendor", "admin", "super_admin"];
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-3 text-sm text-ink";
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Every account (the Figma "Customers" list, widened to the API's users): by role, search, suspended only. */
export function UsersView() {
	const { get, page, set } = useUrlParams();
	const role = ROLES.find((r) => r === get("role"));
	const q = get("search");
	const suspended = get("suspended") === "1";
	const { data, isPending, isError, isFetching, refetch } = useUsers({
		q: q || undefined,
		role,
		suspended: suspended || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const users = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Users" crumb="Users">
				<div className="flex flex-wrap gap-3">
					<ExportButton kind="users" />
				</div>
			</ListHeader>
			<div className="mt-8 flex flex-wrap items-end justify-between gap-4">
				<div role="tablist" aria-label="Role" className="relative hide-scroll flex max-w-full overflow-x-auto border-b border-grey-600">
					{([undefined, ...ROLES] as (Role | undefined)[]).map((r) => (
						<button
							key={r ?? "all"}
							type="button"
							role="tab"
							aria-selected={role === r}
							onClick={() => set({ role: r })}
							className={clsx(
								"-mb-px shrink-0 border-b-2 px-5 pb-3 text-base transition-colors",
								role === r ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
							)}
						>
							{r ? `${ROLE_LABEL[r]}s` : "All"}
						</button>
					))}
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<label className="flex items-center gap-2 text-sm text-ink">
						<Checkbox checked={suspended} onCheckedChange={(on) => set({ suspended: on ? "1" : undefined })} />
						Suspended only
					</label>
					<SearchBox
						value={q}
						onChange={(v) => set({ search: v || undefined })}
						placeholder="Name or email"
						label="Search users"
						className="w-full sm:w-72"
					/>
				</div>
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load users.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && users.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No one matches.</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="relative overflow-x-auto">
							<table className="w-full min-w-[760px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										{["Name", "Role", "Email", "Joined", "Status", ""].map((h, i) => (
											<th key={h || i} scope="col" className={clsx(TH, i === 0 && "pl-6")}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 6 }, (_, i) => (
												<tr key={i}>
													<td colSpan={6} className="px-6 py-3">
														<Skeleton className="h-9 w-full" />
													</td>
												</tr>
											))
										: users.map((u) => (
												<tr key={u.id} className="hover:bg-grey-500">
													<td className={clsx(TD, "pl-6")}>
														<span className="flex items-center gap-3">
															<UserAvatar name={u.name} src={u.avatarUrl} className="size-8" />
															<span className="font-medium">{u.name}</span>
														</span>
													</td>
													<td className={TD}>{ROLE_LABEL[u.role]}</td>
													<td className={TD}>
														{u.email}
														{!u.emailVerified && <span className="ml-2 text-xs text-warning-700">unverified</span>}
													</td>
													<td className={clsx(TD, "whitespace-nowrap")}>{day(u.createdAt)}</td>
													<td className={TD}>
														<span
															className={clsx(
																"rounded-full px-3 py-1 text-xs font-medium",
																u.suspended ? "bg-error-50 text-error-500" : "bg-success-50 text-success-700",
															)}
														>
															{u.suspended ? "Suspended" : "Active"}
														</span>
													</td>
													<td className="py-3 pr-6 pl-3 text-right">
														<Link
															href={consoleRoutes.USER(u.id)}
															className="text-sm font-medium text-primary-500 hover:underline"
														>
															View
														</Link>
													</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
						{data && data.meta.total_pages > 1 && (
							<div className="border-t border-grey-600">
								<Pagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
