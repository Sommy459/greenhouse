"use client";

import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { errorMessage } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes, type ExportKind } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

/** Downloads one of the API's CSV exports (GET /admin/exports/<kind>.csv), optionally for a date range. */
export function ExportButton({
	kind,
	params = {},
	className = "h-12 gap-2 rounded-lg px-5",
}: {
	kind: ExportKind;
	params?: Record<string, string | undefined>;
	className?: string;
}) {
	const toast = useToast();
	const exportCsv = useMutation({
		mutationFn: () => downloadCsv(backendRoutes.EXPORT(kind), params, `fysi-${kind}`),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export. Try again.")),
	});
	return (
		<Button variant="outline" isLoading={exportCsv.isPending} onClick={() => exportCsv.mutate()} className={className}>
			<Download className="size-5" aria-hidden /> Export CSV
		</Button>
	);
}
