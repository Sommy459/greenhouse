"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Props {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	/** For screen readers, e.g. "Search customers". */
	label: string;
	className?: string;
}

/** A list page's search: types freely; the URL (and the request) follows 350ms after the last key. */
export function SearchBox({ value, onChange, placeholder, label, className }: Props) {
	const [text, setText] = useState(value);
	const [synced, setSynced] = useState(value);
	if (value !== synced) {
		// The URL changed from elsewhere (top bar search, Clear): show it.
		setSynced(value);
		setText(value);
	}

	useEffect(() => {
		if (text.trim() === value) return;
		const timer = setTimeout(() => onChange(text.trim()), 350);
		return () => clearTimeout(timer);
	}, [text, value, onChange]);

	return (
		<label
			className={clsx(
				"flex h-10 w-full items-center gap-3 rounded-lg border border-grey-600 bg-white px-3 focus-within:border-primary-500 lg:h-12",
				className,
			)}
		>
			<Search className="size-5 shrink-0 text-grey-900" aria-hidden />
			<span className="sr-only">{label}</span>
			<input
				type="search"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder={placeholder}
				className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-grey-800 lg:text-base"
			/>
		</label>
	);
}
