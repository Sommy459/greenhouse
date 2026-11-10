import clsx from "clsx";
import { Check } from "lucide-react";
import { ORDER_STEPS, type CustomerOrder, type OrderStep } from "@/features/orders/types";

const LABEL: Record<OrderStep, string> = {
	received: "Order received",
	processing: "Processing",
	on_the_way: "On the way",
	delivered: "Delivered",
};

const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type State = "done" | "current" | "next";

/** The latest step reached is "current" (a filled number); earlier ones and Delivered show a tick; later ones are dashed. */
function states(timeline: CustomerOrder["timeline"]): State[] {
	const reached = ORDER_STEPS.map((s) => !!timeline[s]);
	const last = reached.lastIndexOf(true);
	return ORDER_STEPS.map((s, i) => (i < last || (i === last && s === "delivered") ? "done" : i === last ? "current" : "next"));
}

function Dot({ state, n }: { state: State; n: number }) {
	return (
		<span
			className={clsx(
				"relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-sm font-medium lg:size-12 lg:text-base",
				state === "next" ? "border border-dashed border-primary-500 bg-grey-500 text-ink" : "bg-primary-500 text-white",
			)}
		>
			{state === "done" ? <Check className="size-5" aria-hidden /> : String(n).padStart(2, "0")}
		</span>
	);
}

/** Figma "Status History": a row of steps on wide screens, a column with dates on phones. */
export function StatusHistory({ timeline }: { timeline: CustomerOrder["timeline"] }) {
	const s = states(timeline);
	const last = s.findLastIndex((x) => x !== "next");
	// The bar reaches the current step, and halfway on to the next while the order is still moving.
	const progress = Math.min(1, (last + (s[last] === "current" ? 0.5 : 0)) / (ORDER_STEPS.length - 1));

	return (
		<>
			{/* Phones: a vertical track. */}
			<ol className="relative mt-6 space-y-7 md:hidden">
				<span aria-hidden className="absolute top-5 bottom-5 left-[21px] w-1.5 -translate-x-1/2 rounded-full bg-grey-600" />
				<span
					aria-hidden
					className="absolute top-5 left-[21px] w-1.5 -translate-x-1/2 rounded-full bg-primary-500"
					style={{ height: `calc((100% - 2.5rem) * ${progress})` }}
				/>
				{ORDER_STEPS.map((step, i) => (
					<li key={step} className="flex items-center gap-8" aria-current={s[i] === "current" ? "step" : undefined}>
						<Dot state={s[i]!} n={i + 1} />
						<div>
							<p className={clsx("text-lg", s[i] === "next" ? "text-ink" : "font-medium text-ink")}>{LABEL[step]}</p>
							<p className="mt-0.5 text-sm text-grey-900">{timeline[step] ? when(timeline[step]) : "Not yet"}</p>
						</div>
					</li>
				))}
			</ol>

			{/* Wider screens: Figma's horizontal track. */}
			<ol className="relative mt-12 hidden grid-cols-4 md:grid">
				<span aria-hidden className="absolute top-6 right-[12.5%] left-[12.5%] h-1.5 -translate-y-1/2 rounded-full bg-grey-600" />
				<span
					aria-hidden
					className="absolute top-6 left-[12.5%] h-1.5 -translate-y-1/2 rounded-full bg-primary-500"
					style={{ width: `calc(75% * ${progress})` }}
				/>
				{ORDER_STEPS.map((step, i) => (
					<li
						key={step}
						className="flex flex-col items-center text-center"
						aria-current={s[i] === "current" ? "step" : undefined}
					>
						<Dot state={s[i]!} n={i + 1} />
						<p className={clsx("mt-4 text-base lg:text-lg", s[i] === "next" ? "text-ink" : "text-primary-500")}>{LABEL[step]}</p>
						<p className="mt-0.5 text-sm text-grey-900">{timeline[step] ? when(timeline[step]) : ""}</p>
					</li>
				))}
			</ol>
		</>
	);
}
