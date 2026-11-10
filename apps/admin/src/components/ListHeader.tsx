import Link from "next/link";
import { consoleRoutes } from "@/lib/routes";

interface Props {
	title: string;
	/** The last breadcrumb (this page). */
	crumb: string;
	/** Breadcrumbs between "Dashboard" and this page, e.g. Customer List on a customer's page. */
	parents?: { label: string; href: string }[];
	children?: React.ReactNode;
}

/** Figma list page header: the title, a "Dashboard / … " breadcrumb, and actions (e.g. Export) on the right. */
export function ListHeader({ title, crumb, parents = [], children }: Props) {
	const links = [{ label: "Dashboard", href: consoleRoutes.OVERVIEW }, ...parents];
	return (
		<div className="flex flex-wrap items-start justify-between gap-4">
			<div className="animate-rise min-w-0">
				<h1 className="text-2xl font-medium text-ink lg:text-[28px]">{title}</h1>
				<nav aria-label="Breadcrumb" className="mt-3 lg:mt-5">
					<ol className="flex flex-wrap items-center gap-2 text-base">
						{links.map((link) => (
							<li key={link.href} className="flex items-center gap-2">
								<Link href={link.href} className="font-medium text-primary-500 hover:underline">
									{link.label}
								</Link>
								<span aria-hidden className="text-grey-800">
									/
								</span>
							</li>
						))}
						<li aria-current="page" className="min-w-0 truncate text-grey-900">
							{crumb}
						</li>
					</ol>
				</nav>
			</div>
			{children && (
				<div className="animate-rise" style={{ "--i": 1 } as React.CSSProperties}>
					{children}
				</div>
			)}
		</div>
	);
}
