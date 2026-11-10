import Link from "next/link";
import { Button } from "@repo/ui/button";
import { consoleRoutes } from "@/lib/routes";

export default function NotFound() {
	return (
		<div className="custom-container flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
			<p className="text-7xl font-bold text-primary-500">404</p>
			<p className="text-grey-900">This page doesn&apos;t exist.</p>
			<Button asChild className="mt-4 w-[220px]">
				<Link href={consoleRoutes.OVERVIEW}>Back to the seller centre</Link>
			</Button>
		</div>
	);
}
