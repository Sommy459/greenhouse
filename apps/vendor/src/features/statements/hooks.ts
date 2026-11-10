"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type { Currency, Statement, StatementDetail, StatementExport, StatementListParams } from "@/features/statements/types";

const KEY = ["vendor", "statements"];

/** V5: settlement periods with their payout. */
export function useStatements(params: StatementListParams) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getData<Paginated<Statement>>(backendRoutes.STATEMENTS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useStatement(id: string | null) {
	return useQuery({
		queryKey: [...KEY, "detail", id],
		queryFn: () => getData<StatementDetail>(backendRoutes.STATEMENT(id!)),
		enabled: !!id,
	});
}

/** Transaction Exports. While one is preparing, the list checks back every few seconds. */
export function useStatementExports(page: number) {
	return useQuery({
		queryKey: [...KEY, "exports", page],
		queryFn: () => getData<Paginated<StatementExport>>(backendRoutes.STATEMENT_EXPORTS, { page, limit: 5 }),
		placeholderData: keepPreviousData,
		refetchInterval: (query) => (query.state.data?.items.some((e) => e.status === "preparing") ? 3000 : false),
	});
}

/** "Export Transactions": asks for a file; it shows in Transaction Exports when ready. */
export function useRequestExport() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (currency: Currency) =>
			(await api.post(backendRoutes.STATEMENT_EXPORTS, { currency })).data.data as StatementExport,
		retry: false,
		onSuccess: () => {
			toast.success("Preparing your export. It'll be ready to download below in a moment.");
			queryClient.invalidateQueries({ queryKey: [...KEY, "exports"] });
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't start the export. Try again.")),
	});
}

export function useDownloadExport() {
	const toast = useToast();
	return useMutation({
		mutationFn: (id: string) => downloadCsv(backendRoutes.STATEMENT_EXPORT_FILE(id), {}, "fysi-transactions"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't download the export. Try again.")),
	});
}
