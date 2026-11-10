"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * List pages keep their filters in the URL, so a refresh or a shared link shows the same list. `set` changes some keys
 * (empty removes them); anything but a page change goes back to page 1. Needs a <Suspense> above (useSearchParams).
 */
export function useUrlParams() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();

	const set = (changes: Record<string, string | undefined>) => {
		const next = new URLSearchParams(params);
		for (const [key, value] of Object.entries(changes)) {
			if (value) next.set(key, value);
			else next.delete(key);
		}
		if (!("page" in changes)) next.delete("page");
		const query = next.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	};

	const get = (key: string) => params.get(key) ?? "";
	/** A comma-separated list, keeping only allowed values. */
	const list = <T extends string>(key: string, allowed: readonly T[]) =>
		get(key)
			.split(",")
			.filter((v): v is T => allowed.includes(v as T));
	const page = Math.max(1, Number(params.get("page")) || 1);

	return { get, list, page, set };
}
