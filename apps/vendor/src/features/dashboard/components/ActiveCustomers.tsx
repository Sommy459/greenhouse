/** Ring geometry: a full circle, drawn from the top, clockwise. */
const R = 80;
const C = 2 * Math.PI * R;

/** Figma "Active Customers": the share of this shop's customers who ordered in the last 90 days, as a ring. */
export function ActiveCustomers({ percent }: { percent: number }) {
	const share = Math.max(0, Math.min(percent, 100)) / 100;

	return (
		<section
			aria-labelledby="active-customers"
			className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-grey-600 bg-white p-6"
		>
			<div className="relative w-full max-w-[300px]">
				<svg viewBox="0 0 200 200" className="w-full -rotate-90" role="img" aria-labelledby="active-customers">
					<circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-grey-600)" strokeWidth="18" />
					{share > 0 && (
						<circle
							cx="100"
							cy="100"
							r={R}
							fill="none"
							stroke="var(--color-primary-500)"
							strokeWidth="20"
							strokeLinecap="round"
							strokeDasharray={`${share * C} ${C}`}
							className="ring-fill"
						/>
					)}
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
					<h2 id="active-customers" className="text-base text-ink lg:text-lg">
						Active Customers <span className="sr-only">: {percent}%</span>
					</h2>
					<p aria-hidden className="text-5xl font-medium text-ink lg:text-6xl">
						{percent}%
					</p>
				</div>
			</div>
			<p className="mt-4 text-center text-sm text-grey-900">Ordered from you in the last 90 days</p>
		</section>
	);
}
