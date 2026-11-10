"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { FAQS } from "@/features/support/faqs";

/** Figma FAQ: each question opens its answer below; several can be open at once. */
export function FaqList() {
	const [open, setOpen] = useState<string[]>([]);
	const toggle = (id: string) => setOpen((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

	return (
		<ul>
			{FAQS.map(({ id, question, answer }, i) => {
				const isOpen = open.includes(id);
				return (
					<li key={id} className="animate-rise" style={{ "--i": i + 1 } as React.CSSProperties}>
						<h2>
							<button
								type="button"
								id={`faq-${id}-question`}
								aria-expanded={isOpen}
								aria-controls={`faq-${id}`}
								onClick={() => toggle(id)}
								className="flex w-full items-center justify-between gap-4 py-7 text-left text-[17px] leading-snug font-semibold text-ink outline-none hover:text-primary-500 focus-visible:text-primary-500 lg:py-[37px] lg:text-xl"
							>
								{question}
								<ChevronDown
									className={cn("size-6 shrink-0 transition-transform", isOpen && "rotate-180")}
									strokeWidth={1.5}
									aria-hidden
								/>
							</button>
						</h2>
						{isOpen && (
							<div
								id={`faq-${id}`}
								role="region"
								aria-labelledby={`faq-${id}-question`}
								className="animate-rise -mt-3 space-y-2 pb-6 text-[15px] leading-relaxed text-grey-900 lg:-mt-5"
							>
								{answer.map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
						)}
					</li>
				);
			})}
		</ul>
	);
}
