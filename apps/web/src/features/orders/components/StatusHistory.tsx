import clsx from "clsx";
import { Check } from "lucide-react";

export interface Step {
	label: string;
	reached: boolean;
	/** When it happened, if the API says. */
	at: string | null;
}

const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type State = "done" | "current" | "next";

/** The latest step reached is "current" (a filled number); earlier ones, and a reached last step, show a tick. */
function states(steps: Step[]): State[] {
	const last = steps.map((s) => s.reached).lastIndexOf(true);
	return steps.map((_, i) => (i < last || (i === last && i === steps.length - 1) ? "done" : i === last ? "current" : "next"));
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
export function StatusHistory({ steps }: { steps: Step[] }) {
	const s = states(steps);
	const last = s.findLastIndex((x) => x !== "next");
	// The bar reaches the current step, and halfway on to the next while the order is still moving.
	const progress = last < 0 ? 0 : Math.min(1, (last + (s[last] === "current" ? 0.5 : 0)) / (steps.length - 1));
	const cols = { 3: "grid-cols-3", 4: "grid-cols-4" }[steps.length] ?? "grid-cols-4";
	const inset = `${50 / steps.length}%`;

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
				{steps.map((step, i) => (
					<li key={step.label} className="flex items-center gap-8" aria-current={s[i] === "current" ? "step" : undefined}>
						<Dot state={s[i]!} n={i + 1} />
						<div>
							<p className={clsx("text-lg", s[i] === "next" ? "text-ink" : "font-medium text-ink")}>{step.label}</p>
							<p className="mt-0.5 text-sm text-grey-900">{step.at ? when(step.at) : step.reached ? "Done" : "Not yet"}</p>
						</div>
					</li>
				))}
			</ol>

			{/* Wider screens: Figma's horizontal track. */}
			<ol className={clsx("relative mt-10 hidden md:grid", cols)}>
				<span
					aria-hidden
					className="absolute top-6 h-1.5 -translate-y-1/2 rounded-full bg-grey-600"
					style={{ left: inset, right: inset }}
				/>
				<span
					aria-hidden
					className="absolute top-6 h-1.5 -translate-y-1/2 rounded-full bg-primary-500"
					style={{ left: inset, width: `calc((100% - 2 * ${inset}) * ${progress})` }}
				/>
				{steps.map((step, i) => (
					<li
						key={step.label}
						className="flex flex-col items-center text-center"
						aria-current={s[i] === "current" ? "step" : undefined}
					>
						<Dot state={s[i]!} n={i + 1} />
						<p className={clsx("mt-4 text-base lg:text-lg", s[i] === "next" ? "text-ink" : "text-primary-500")}>{step.label}</p>
						<p className="mt-0.5 text-sm text-grey-900">{step.at ? when(step.at) : ""}</p>
					</li>
				))}
			</ol>
		</>
	);
}
