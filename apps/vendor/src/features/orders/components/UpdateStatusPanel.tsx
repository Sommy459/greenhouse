"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { useUpdateOrderStatus } from "@/features/orders/hooks";
import { NEXT_LABEL, NEXT_STATUSES } from "@/features/orders/options";
import type { OrderDetail, OrderStatus } from "@/features/orders/types";

const INPUT =
	"h-12 w-full rounded-md border border-grey-600 bg-white px-4 text-base text-ink outline-none placeholder:text-grey-800 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-300/30";
const MIN_REASON = 10;

/**
 * PRD V8 "Update status", inside Order Details: pick what happened next. Shipping needs the courier and tracking number;
 * cancelling needs a reason (Fysi refunds the customer).
 */
export function UpdateStatusPanel({ order }: { order: OrderDetail }) {
	const choices = NEXT_STATUSES[order.status];
	const [next, setNext] = useState<OrderStatus | null>(choices[0] ?? null);
	const [courier, setCourier] = useState(order.shipment?.courier ?? "");
	const [tracking, setTracking] = useState("");
	const [reason, setReason] = useState("");
	const [tried, setTried] = useState(false);
	const update = useUpdateOrderStatus(order.id);

	if (choices.length === 0) return null;

	const shipping = next === "shipped";
	const cancelling = next === "cancelled";
	const errors = {
		courier: shipping && !courier.trim() ? "Enter the courier, e.g. GIG Logistics." : null,
		tracking:
			shipping && !/^[A-Za-z0-9-]{5,40}$/.test(tracking.trim()) ? "Enter the tracking number (5–40 letters or digits)." : null,
		reason: cancelling && reason.trim().length < MIN_REASON ? `Give a reason of at least ${MIN_REASON} characters.` : null,
	};
	const invalid = Object.values(errors).some(Boolean);

	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				setTried(true);
				if (!next || invalid || update.isPending) return;
				update.mutate(
					{
						status: next,
						...(shipping && { courier: courier.trim(), tracking_number: tracking.trim() }),
						...(cancelling && { reason: reason.trim() }),
					},
					{ onSuccess: () => setTried(false) },
				);
			}}
			className="mt-4 space-y-4 rounded-xl border border-grey-600 p-4 sm:p-5"
		>
			<fieldset>
				<legend className="sr-only">What happened next?</legend>
				<div className="space-y-2">
					{choices.map((status) => (
						<label
							key={status}
							className={clsx(
								"flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
								next === status ? "border-primary-500 bg-primary-50" : "border-grey-600 hover:border-primary-300",
							)}
						>
							<input
								type="radio"
								name="next-status"
								value={status}
								checked={next === status}
								onChange={() => setNext(status)}
								className="mt-1 size-4 accent-primary-500"
							/>
							<span>
								<span className={clsx("block text-base font-medium", status === "cancelled" ? "text-error-500" : "text-ink")}>
									{NEXT_LABEL[status]?.title}
								</span>
								<span className="block text-sm text-grey-900">{NEXT_LABEL[status]?.hint}</span>
							</span>
						</label>
					))}
				</div>
			</fieldset>

			{shipping && (
				<div className="grid gap-3 sm:grid-cols-2">
					<Field id="courier" label="Courier" error={tried ? errors.courier : null}>
						<input
							id="courier"
							value={courier}
							onChange={(e) => setCourier(e.target.value)}
							placeholder="e.g. GIG Logistics"
							maxLength={60}
							className={INPUT}
						/>
					</Field>
					<Field id="tracking-number" label="Tracking number" error={tried ? errors.tracking : null}>
						<input
							id="tracking-number"
							value={tracking}
							onChange={(e) => setTracking(e.target.value)}
							placeholder="e.g. GIG-4471932"
							maxLength={40}
							className={INPUT}
						/>
					</Field>
				</div>
			)}

			{cancelling && (
				<Field id="cancel-reason" label="Reason" error={tried ? errors.reason : null}>
					<textarea
						id="cancel-reason"
						rows={3}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						maxLength={500}
						placeholder="e.g. This item is out of stock and won't be restocked."
						className={clsx(INPUT, "h-auto resize-y py-3")}
					/>
				</Field>
			)}

			<Button
				type="submit"
				isLoading={update.isPending}
				className={clsx("h-12 w-full rounded-lg", cancelling && "bg-error-500 hover:bg-error-700")}
			>
				{cancelling ? "Cancel order" : "Save status"}
			</Button>
		</form>
	);
}

function Field({ id, label, error, children }: { id: string; label: string; error: string | null; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="block text-sm font-medium text-ink">
				{label}
			</label>
			{children}
			{error && (
				<p id={`${id}-error`} role="alert" className="text-sm text-error-500">
					{error}
				</p>
			)}
		</div>
	);
}
