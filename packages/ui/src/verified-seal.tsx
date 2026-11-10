/** The scalloped seal: radius waves 16 times around the circle. Built once, at module load. */
const SEAL_PATH = (() => {
	const steps = 192;
	const points = Array.from({ length: steps }, (_, i) => {
		const t = (i / steps) * Math.PI * 2;
		const r = 88 + 8 * Math.cos(16 * t);
		return `${(100 + r * Math.sin(t)).toFixed(2)} ${(100 - r * Math.cos(t)).toFixed(2)}`;
	});
	return `M${points.join("L")}Z`;
})();

/** The green "verified" seal with a white tick (Figma success dialogs). Drawn in code until the icon is exported. */
export function VerifiedSeal({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 200 200" className={className} aria-hidden>
			<path d={SEAL_PATH} className="fill-brand-emerald" />
			<path d="M60 102 L86 128 L142 72" fill="none" stroke="white" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
