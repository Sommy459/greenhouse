"use client";

import { useMutation } from "@tanstack/react-query";
import { api, errorMessage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { ReportValues } from "@/features/support/report";

/** Sends a Report a Product / Problem form. Not retried automatically (it would file the report twice). */
export function useSubmitReport({ onSent }: { onSent: () => void }) {
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: ReportValues) =>
			(await api.post(backendRoutes.SUPPORT_REPORTS, values)).data.data as { id: string },
		retry: false,
		onSuccess: () => onSent(),
		onError: (error) => toast.error(errorMessage(error, "We couldn't send your report. Please try again.")),
	});
}
