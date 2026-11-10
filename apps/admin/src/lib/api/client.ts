import axios from "axios";
import { useSession } from "@/features/auth/session";
import { mockAdapter } from "@/lib/api/mock";

/** The API client: adds the admin's token, and a 401 ends the session. */
export const api = axios.create({
	// The same-origin /api/v1 proxy, or a direct URL (next.config.ts sets NEXT_PUBLIC_API_URL).
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: { "Content-Type": "application/json" },
	// TEMPORARY: mocked admin answers until the external API is connected (lib/api/mock.ts).
	...(process.env.NEXT_PUBLIC_MOCK_API === "1" ? { adapter: mockAdapter() } : {}),
});

api.interceptors.request.use((config) => {
	const token = useSession.getState().token;
	if (token) config.headers.set("Authorization", `Bearer ${token}`);
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isAxiosError(error) && error.response?.status === 401 && useSession.getState().token) {
			useSession.getState().signOut();
		}
		return Promise.reject(error);
	},
);

/** The API's `{ status_code, message, data }` envelope, unwrapped. */
export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
	const { data } = await api.get(url, { params });
	return data.data as T;
}

/** The message to show for a failed request. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
	if (axios.isAxiosError(error)) return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
	return fallback;
}
