"use client";

import { useEffect } from "react";

const SELECTOR = ".animate-reveal:not(.is-visible)";

/**
 * Powers `.animate-reveal` (globals.css): each one starts hidden and rises in when it scrolls into view. Watches for new
 * ones too (pages that load products after render, client navigations). Mounted once in the root layout.
 * Works in every browser; the CSS only hides things when `html.js` is set, so without JavaScript nothing is hidden.
 */
export function RevealObserver() {
	useEffect(() => {
		const reveal = (el: Element) => el.classList.add("is-visible");

		// No IntersectionObserver (very old browsers): just show everything.
		if (!("IntersectionObserver" in window)) {
			document.querySelectorAll(SELECTOR).forEach(reveal);
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						reveal(entry.target);
						io.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
		);

		const watch = (root: ParentNode) => root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
		watch(document);

		// New elements (product grids that load later, pages after navigation).
		const mo = new MutationObserver((mutations) => {
			for (const m of mutations) {
				m.addedNodes.forEach((node) => {
					if (!(node instanceof Element)) return;
					if (node.matches(SELECTOR)) io.observe(node);
					watch(node);
				});
			}
		});
		mo.observe(document.body, { childList: true, subtree: true });

		return () => {
			io.disconnect();
			mo.disconnect();
		};
	}, []);

	return null;
}
