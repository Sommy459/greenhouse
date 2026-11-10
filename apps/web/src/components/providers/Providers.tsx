"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@repo/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { staleTime: 60_000, gcTime: 10 * 60_000, retry: 2, refetchOnWindowFocus: false },
					// Never auto-retry a write: a retried order or payment could go through twice.
					mutations: { retry: false },
				},
			}),
	);
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<Toaster position="top-right" richColors />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
