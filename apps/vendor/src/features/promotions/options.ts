import type { Promotion, PromotionAction, PromotionState } from "@/features/promotions/types";

export const STATE_LABEL: Record<PromotionState, string> = {
	running: "Running",
	scheduled: "Scheduled",
	paused: "Paused",
	expired: "Expired",
	ended: "Ended",
};

export const STATE_TONE: Record<PromotionState, string> = {
	running: "bg-success-50 text-success-700",
	scheduled: "bg-info-50 text-info-500",
	paused: "bg-warning-50 text-warning-700",
	expired: "bg-grey-500 text-grey-900",
	ended: "bg-grey-500 text-grey-900",
};

/** What the vendor can do in each state. Expired and ended promotions are finished. */
export function actionsFor(state: PromotionState): PromotionAction[] {
	if (state === "running" || state === "scheduled") return ["pause", "end"];
	if (state === "paused") return ["resume", "end"];
	return [];
}

export const ACTION_LABEL: Record<PromotionAction, string> = { pause: "Pause", resume: "Resume", end: "End now" };

/** "12 Nov – 30 Nov 2026" */
export function dates(p: Pick<Promotion, "startsAt" | "endsAt">) {
	const a = new Date(p.startsAt);
	const b = new Date(p.endsAt);
	const short = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
	return a.getFullYear() === b.getFullYear()
		? `${short(a)} – ${short(b)} ${b.getFullYear()}`
		: `${short(a)} ${a.getFullYear()} – ${short(b)} ${b.getFullYear()}`;
}

export const editable = (state: PromotionState) => state === "scheduled" || state === "running" || state === "paused";
