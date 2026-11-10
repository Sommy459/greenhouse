"use client";

import clsx from "clsx";
import { SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { PAYMENT_LABEL, STATUS_LABEL } from "@/features/orders/options";
import { ORDER_STATUSES, PAYMENT_METHODS, type OrderStatus, type PaymentMethod } from "@/features/orders/types";

interface Props {
	statuses: OrderStatus[];
	payments: PaymentMethod[];
	onChange: (filters: { statuses: OrderStatus[]; payments: PaymentMethod[] }) => void;
	triggerClassName: string;
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

/** Figma "Filters": order status and payment method. Ticks apply straight away; none ticked means all. */
export function OrderFilters({ statuses, payments, onChange, triggerClassName }: Props) {
	const count = statuses.length + payments.length;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button type="button" className={clsx(triggerClassName, count > 0 && "border-primary-500 text-primary-500")}>
					<SlidersHorizontal className="size-5" aria-hidden />
					Filters
					{count > 0 && (
						<span className="grid size-5 place-items-center rounded-full bg-primary-500 text-xs text-white">{count}</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[320px] p-0">
				<div className="grid grid-cols-2 gap-4 p-4">
					<Group title="Status">
						{ORDER_STATUSES.map((s) => (
							<Option
								key={s}
								id={`status-${s}`}
								label={STATUS_LABEL[s]}
								checked={statuses.includes(s)}
								onChange={() => onChange({ statuses: toggle(statuses, s), payments })}
							/>
						))}
					</Group>
					<Group title="Payment method">
						{PAYMENT_METHODS.map((p) => (
							<Option
								key={p}
								id={`payment-${p}`}
								label={PAYMENT_LABEL[p]}
								checked={payments.includes(p)}
								onChange={() => onChange({ statuses, payments: toggle(payments, p) })}
							/>
						))}
					</Group>
				</div>
				<div className="flex justify-end border-t border-grey-600 px-4 py-2.5">
					<button
						type="button"
						disabled={count === 0}
						onClick={() => onChange({ statuses: [], payments: [] })}
						className="rounded-md px-3 py-1.5 text-sm font-medium text-grey-900 hover:bg-grey-500 disabled:opacity-50"
					>
						Clear filters
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<fieldset>
			<legend className="mb-2 text-xs font-semibold text-grey-900 uppercase">{title}</legend>
			<div className="space-y-2">{children}</div>
		</fieldset>
	);
}

function Option({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
	return (
		<div className="flex items-center gap-2">
			<Checkbox id={id} checked={checked} onCheckedChange={onChange} />
			<label htmlFor={id} className="cursor-pointer text-sm text-ink">
				{label}
			</label>
		</div>
	);
}
