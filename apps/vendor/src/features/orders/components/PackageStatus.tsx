import clsx from "clsx";
import { Check, X } from "lucide-react";
import type { OrderDetail, OrderStatus } from "@/features/orders/types";

/** Figma dates: 05-07-23 (day-month-year). */
const shortDate = (iso: string) => {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${String(d.getFullYear()).slice(-2)}`;
};

const STEPS = ["Order Placed", "Pending Confirmation", "Waiting to be shipped", "Shipped", "Delivered"];

/** How far along each status is: the index of the last step done. */
const REACHED: Record<OrderStatus, number> = {
	paid: 0,
	processing: 2,
	shipped: 3,
	delivery_failed: 3,
	delivered: 4,
	returned: 4,
	cancelled: 0,
};

type Step = { label: string; state: "done" | "current" | "upcoming" | "stopped"; at: string | null };

/** The five Figma steps for an order, with the date each happened (from its tracking history) and where it stopped. */
function stepsFor(order: OrderDetail): Step[] {
	const reached = REACHED[order.status];
	// Done steps in the order's own history, in order; their times date the matching Figma steps.
	const doneTimes = order.tracking.filter((t) => t.state === "done" && t.at).map((t) => t.at!);
	const at = (i: number) => (i === 0 ? order.created_at : (doneTimes[Math.min(i, doneTimes.length - 1)] ?? null));
	const steps: Step[] = STEPS.map((label, i) => ({
		label,
		state: i <= reached ? "done" : i === reached + 1 ? "current" : "upcoming",
		at: i <= reached ? at(i) : null,
	}));
	if (order.status === "cancelled") return [steps[0]!, { label: "Cancelled", state: "stopped", at: null }];
	if (order.status === "delivery_failed") return [...steps.slice(0, 4), { label: "Delivery failed", state: "stopped", at: null }];
	if (order.status === "returned") return [...steps, { label: "Returned and refunded", state: "stopped", at: null }];
	return steps;
}

/** Figma "Package Status": a vertical line of steps; ticks for done, a ring for what's next, a cross where it stopped. */
export function PackageStatus({ order }: { order: OrderDetail }) {
	const steps = stepsFor(order);
	return (
		<ol className="mt-8">
			{steps.map((step, i) => (
				<li key={step.label} className="relative flex gap-8 pb-8 last:pb-0 sm:gap-14">
					{i < steps.length - 1 && <span aria-hidden className="absolute top-8 left-[19px] h-[calc(100%-16px)] w-1 bg-ink" />}
					<span
						aria-hidden
						className={clsx(
							"relative grid size-10 shrink-0 place-items-center rounded-full",
							step.state === "done" && "bg-primary-400 text-white",
							step.state === "current" && "border-[3px] border-primary-400 bg-white",
							step.state === "upcoming" && "border-[3px] border-grey-700 bg-white",
							step.state === "stopped" && "bg-error-500 text-white",
						)}
					>
						{step.state === "done" && <Check className="size-6" strokeWidth={3} />}
						{step.state === "current" && <span className="size-4 rounded-full bg-primary-400" />}
						{step.state === "stopped" && <X className="size-6" strokeWidth={3} />}
					</span>
					<div className="pt-0.5">
						<p className={clsx("text-xl text-ink lg:text-2xl", step.state === "stopped" && "text-error-500")}>
							{step.label}
							<span className="sr-only">
								{step.state === "done"
									? " (done)"
									: step.state === "current"
										? " (next)"
										: step.state === "stopped"
											? " (stopped)"
											: " (to come)"}
							</span>
						</p>
						{step.at && (
							<p className="mt-1 text-base text-ink">
								<time dateTime={step.at}>{shortDate(step.at)}</time>
							</p>
						)}
					</div>
				</li>
			))}
		</ol>
	);
}
