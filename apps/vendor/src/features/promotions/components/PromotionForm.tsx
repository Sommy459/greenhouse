"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { useMyProducts } from "@/features/products/hooks";
import { EndPromotionDialog } from "@/features/promotions/components/PromotionsView";
import { usePromotion, usePromotionAction, useSavePromotion } from "@/features/promotions/hooks";
import { ACTION_LABEL, actionsFor, editable, STATE_LABEL, STATE_TONE } from "@/features/promotions/options";
import type { Promotion, PromotionBody } from "@/features/promotions/types";
import { errorMessage } from "@/lib/api/client";
import { count, price } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-7";
const LABEL = "text-sm font-medium text-ink";
const MAX_DAYS = 180;

/** <input type="datetime-local"> wants local time without a zone. */
function local(iso: string | Date) {
	const d = new Date(iso);
	return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** /promotions/[id]: the promotion's sales, its actions, and the form (while it can still change). */
export function EditPromotionView({ id }: { id: string }) {
	const { data, isPending, isError, error, refetch } = usePromotion(id);
	if (isError)
		return (
			<div className="px-4 py-16 text-center text-sm text-grey-900">
				<p>{errorMessage(error, "Couldn't load this promotion.")}</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	if (isPending) return <Skeleton className="m-8 h-96 rounded-xl" />;
	return <PromotionForm promotion={data} />;
}

/**
 * New / edit promotion (POST, PATCH /vendor/promotions): a name, 1–90% off, start and end (180 days at most), and the
 * whole shop or chosen products. The API works out each sale price.
 */
export function PromotionForm({ promotion }: { promotion?: Promotion }) {
	const router = useRouter();
	const save = useSavePromotion(promotion?.id);
	const action = usePromotionAction();
	const products = useMyProducts({ page: 1, limit: 100 });
	const locked = !!promotion && !editable(promotion.state);
	const [ending, setEnding] = useState(false);

	const [name, setName] = useState(promotion?.name ?? "");
	const [percent, setPercent] = useState(promotion ? String(promotion.discountPercent) : "");
	const [startsAt, setStartsAt] = useState(() => local(promotion?.startsAt ?? new Date()));
	const [endsAt, setEndsAt] = useState(() => local(promotion?.endsAt ?? new Date(Date.now() + 7 * 86_400_000)));
	const [appliesToAll, setAppliesToAll] = useState(promotion?.appliesToAll ?? false);
	const [chosen, setChosen] = useState<Set<string>>(() => new Set(promotion?.products.map((p) => p.id)));
	const [filter, setFilter] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const e: Record<string, string> = {};
		if (!name.trim()) e.name = "Name the promotion";
		const n = Number(percent);
		if (!Number.isInteger(n) || n < 1 || n > 90) e.percent = "A whole number from 1 to 90";
		const a = new Date(startsAt).getTime();
		const b = new Date(endsAt).getTime();
		if (!startsAt || !endsAt || !(b > a)) e.dates = "The end must be after the start";
		else if (b - a > MAX_DAYS * 86_400_000) e.dates = `A promotion runs ${MAX_DAYS} days at most`;
		if (!appliesToAll && chosen.size === 0) e.products = "Choose at least one product, or the whole shop";
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (locked || save.isPending || !validate()) return;
		const body: PromotionBody = {
			name: name.trim(),
			discountPercent: Number(percent),
			startsAt: new Date(startsAt).toISOString(),
			endsAt: new Date(endsAt).toISOString(),
			appliesToAll,
			...(appliesToAll ? {} : { productIds: [...chosen] }),
		};
		save.mutate(body, { onSuccess: () => router.push(consoleRoutes.PROMOTIONS) });
	};

	const all = products.data?.items ?? [];
	const shown = filter ? all.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase())) : all;
	const toggle = (id: string) =>
		setChosen((s) => {
			const next = new Set(s);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title={promotion ? promotion.name : "New promotion"}
				crumb={promotion ? promotion.name : "New promotion"}
				parents={[{ label: "Promotions", href: consoleRoutes.PROMOTIONS }]}
			>
				{promotion && (
					<div className="flex flex-wrap items-center gap-2">
						<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATE_TONE[promotion.state])}>
							{STATE_LABEL[promotion.state]}
						</span>
						{actionsFor(promotion.state).map((a) => (
							<Button
								key={a}
								variant="outline"
								disabled={action.isPending}
								onClick={() => (a === "end" ? setEnding(true) : action.mutate({ id: promotion.id, action: a }))}
								className={clsx("h-10 rounded-lg", a === "end" && "border-error-500 text-error-500")}
							>
								{ACTION_LABEL[a]}
							</Button>
						))}
					</div>
				)}
			</ListHeader>

			{promotion && (
				<dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{(
						[
							["Orders", count(promotion.stats.orders)],
							["Units sold", count(promotion.stats.unitsSold)],
							["Revenue", price(promotion.stats.revenue)],
							["Discount given", price(promotion.stats.discountGiven)],
						] as const
					).map(([label, value]) => (
						<div key={label} className="rounded-xl border border-grey-600 bg-white p-4">
							<dt className="text-sm text-grey-900">{label}</dt>
							<dd className="mt-1 text-2xl font-semibold text-ink">{value}</dd>
						</div>
					))}
				</dl>
			)}

			<form noValidate onSubmit={onSubmit} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<fieldset disabled={locked} className={clsx(CARD, "grid content-start gap-5")}>
					<legend className="sr-only">Details</legend>
					<h2 className="text-lg font-medium text-ink">Details</h2>
					<label className="grid gap-1.5">
						<span className={LABEL}>Name</span>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={120}
							placeholder="e.g. Earth Week sale"
							className="h-11"
							aria-invalid={!!errors.name}
						/>
						{errors.name && <span className="text-sm text-error-500">{errors.name}</span>}
					</label>
					<label className="grid gap-1.5">
						<span className={LABEL}>Discount (% off)</span>
						<Input
							value={percent}
							onChange={(e) => setPercent(e.target.value)}
							type="number"
							min={1}
							max={90}
							inputMode="numeric"
							className="h-11 w-40"
							aria-invalid={!!errors.percent}
						/>
						{errors.percent && <span className="text-sm text-error-500">{errors.percent}</span>}
					</label>
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="grid gap-1.5">
							<span className={LABEL}>Starts</span>
							<Input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} type="datetime-local" className="h-11" />
						</label>
						<label className="grid gap-1.5">
							<span className={LABEL}>Ends</span>
							<Input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="datetime-local" className="h-11" />
						</label>
					</div>
					{errors.dates && <p className="-mt-3 text-sm text-error-500">{errors.dates}</p>}
					<p className="text-xs text-grey-800">
						Customers see the sale price and the % off on each product while it runs. {MAX_DAYS} days at most.
					</p>
				</fieldset>

				<fieldset disabled={locked} className={clsx(CARD, "grid content-start gap-4")}>
					<legend className="sr-only">Products</legend>
					<h2 className="text-lg font-medium text-ink">Applies to</h2>
					<div className="flex flex-wrap gap-5 text-sm text-ink">
						<label className="flex items-center gap-2">
							<input
								type="radio"
								name="scope"
								checked={appliesToAll}
								onChange={() => setAppliesToAll(true)}
								className="accent-primary-500"
							/>
							The whole shop
						</label>
						<label className="flex items-center gap-2">
							<input
								type="radio"
								name="scope"
								checked={!appliesToAll}
								onChange={() => setAppliesToAll(false)}
								className="accent-primary-500"
							/>
							Chosen products {chosen.size > 0 && `(${chosen.size})`}
						</label>
					</div>
					{!appliesToAll && (
						<>
							<Input
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
								placeholder="Find a product"
								aria-label="Find a product"
								className="h-10"
							/>
							<ul className="max-h-80 divide-y divide-grey-600 overflow-y-auto rounded-lg border border-grey-600">
								{products.isPending ? (
									<li className="p-3">
										<Skeleton className="h-8 w-full" />
									</li>
								) : shown.length === 0 ? (
									<li className="p-4 text-sm text-grey-900">{all.length ? "No match." : "Add products first."}</li>
								) : (
									shown.map((p) => {
										const sale =
											Number(percent) >= 1 && Number(percent) <= 90
												? Math.round(p.price.cents * (1 - Number(percent) / 100))
												: null;
										return (
											<li key={p.id}>
												<label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-grey-500">
													<Checkbox checked={chosen.has(p.id)} onCheckedChange={() => toggle(p.id)} />
													<span className="min-w-0 flex-1 truncate text-ink">{p.title}</span>
													<span className="shrink-0 text-grey-900">
														{sale != null && chosen.has(p.id) ? (
															<>
																<s className="mr-1.5 text-grey-800">{price(p.price)}</s>~{price(sale)}
															</>
														) : (
															price(p.price)
														)}
													</span>
												</label>
											</li>
										);
									})
								)}
							</ul>
						</>
					)}
					{errors.products && <p className="text-sm text-error-500">{errors.products}</p>}
				</fieldset>

				{!locked && (
					<div className="flex gap-3 xl:col-span-2">
						<Button type="submit" isLoading={save.isPending} className="h-12 rounded-lg px-6">
							{promotion ? "Save changes" : "Create promotion"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push(consoleRoutes.PROMOTIONS)}
							className="h-12 rounded-lg px-6"
						>
							Cancel
						</Button>
					</div>
				)}
				{locked && (
					<p className="text-sm text-grey-900 xl:col-span-2">This promotion has finished, so it can&apos;t be changed.</p>
				)}
			</form>

			<EndPromotionDialog promotion={ending ? (promotion ?? null) : null} onClose={() => setEnding(false)} />
		</div>
	);
}
