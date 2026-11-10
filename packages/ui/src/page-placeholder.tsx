import { cn } from "./lib/utils";

/**
 * Stands in for a screen until its Figma design is built. Names the PRD requirements the screen covers, so the
 * route map in docs/PLAN.md can be checked in the browser. Delete the import from a page once the page is real.
 */
function PagePlaceholder({
	title,
	requirements = [],
	description,
	className,
	children,
}: {
	title: string;
	requirements?: string[];
	description?: string;
	className?: string;
	children?: React.ReactNode;
}) {
	return (
		<section className={cn("animate-rise flex flex-col gap-4 py-10 lg:py-16", className)}>
			<div className="flex flex-wrap items-center gap-2">
				{requirements.map((id) => (
					<span key={id} className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-semibold text-lime-800">
						{id}
					</span>
				))}
				<span className="rounded-full bg-grey-600 px-2.5 py-0.5 text-xs font-medium text-grey-900">Awaiting design</span>
			</div>
			<h1 className="h2-app text-primary-700">{title}</h1>
			{description && <p className="max-w-2xl text-grey-900">{description}</p>}
			{children}
		</section>
	);
}

export { PagePlaceholder };
