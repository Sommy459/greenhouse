"use client";

import { useEffect, useState } from "react";

/** The current time, updated every `intervalMs` (for countdowns). */
export function useNow(intervalMs = 1000) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), intervalMs);
		return () => clearInterval(id);
	}, [intervalMs]);
	return now;
}

/** "14:05" from milliseconds left (never negative). */
export function minutesSeconds(ms: number) {
	const s = Math.max(0, Math.floor(ms / 1000));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
