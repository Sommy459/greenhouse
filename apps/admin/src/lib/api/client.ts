import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSession } from "@/features/auth/session";
import type { TokenSet } from "@/features/auth/types";
import { backendRoutes } from "@/lib/routes";

/**
 * The Fysi API client (https://fysi-backend-production.up.railway.app/docs). Successes are `{ statusCode, message,
 * data }`; errors `{ statusCode, message, data: null, error: { code, details, … } }`. Adds the access token, and on a
 * 401 swaps the refresh token for a new pair once, then retries; if that fails, the session ends.
 */
export const api = axios.create({
	// The same-origin /api/v1 proxy, or a direct URL (next.config.ts sets NEXT_PUBLIC_API_URL).
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
	const token = useSession.getState().accessToken;
	if (token && !config.headers.has("Authorization")) config.headers.set("Authorization", `Bearer ${token}`);
	return config;
});

/** One refresh at a time: requests that fail together wait for the same new token. */
let refreshing: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
	const { refreshToken, setTokens, signOut } = useSession.getState();
	if (!refreshToken) return null;
	try {
		const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${backendRoutes.REFRESH}`, { refreshToken });
		const tokens = data.data as TokenSet;
		setTokens(tokens);
		return tokens.accessToken;
	} catch {
		signOut();
		return null;
	}
}

/** Requests whose 401 means "wrong details", not "session expired". */
const NO_REFRESH: string[] = [
	backendRoutes.SIGN_IN,
	backendRoutes.REFRESH,
	backendRoutes.VERIFY_EMAIL,
	backendRoutes.CHANGE_PASSWORD,
	backendRoutes.LOGIN_2FA,
	backendRoutes.ENABLE_2FA,
];

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
		if (
			error.response?.status === 401 &&
			config &&
			!config._retried &&
			!NO_REFRESH.some((url) => (config.url ?? "").startsWith(url))
		) {
			refreshing ??= refreshTokens().finally(() => (refreshing = null));
			const token = await refreshing;
			if (token) {
				config._retried = true;
				config.headers.set("Authorization", `Bearer ${token}`);
				return api(config);
			}
		}
		return Promise.reject(error);
	},
);

/** The `data` of a success. */
export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
	const { data } = await api.get(url, { params });
	return data.data as T;
}

/** A page of a list. The app counts pages from 1; the API takes `limit` and `offset`. */
export interface Paginated<T> {
	items: T[];
	meta: { page: number; limit: number; total: number; total_pages: number };
}

interface ApiPage<T> {
	result?: T[];
	paginationMeta?: { currentPage: number; totalPage: number; totalCount: number };
}

/** GET a list page: `page` (from 1) and `limit` become `offset`/`limit`; empty filters are left out. */
export async function getPage<T>(
	url: string,
	{ page = 1, limit = 20, ...params }: { page?: number; limit?: number } & Record<string, unknown>,
): Promise<Paginated<T>> {
	const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
	const data = await getData<ApiPage<T>>(url, { ...query, limit, offset: (Math.max(1, page) - 1) * limit });
	const meta = data.paginationMeta;
	return {
		items: data.result ?? [],
		meta: {
			page: meta?.currentPage || page,
			limit,
			total: meta?.totalCount ?? 0,
			total_pages: Math.max(1, meta?.totalPage ?? 1),
		},
	};
}

interface ApiError {
	message?: string | string[];
	error?: { code?: string; details?: unknown };
}

/** The message to show for a failed request: the first validation problem, the API's message, or the fallback. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
	if (!axios.isAxiosError(error)) return fallback;
	if (!error.response) return "Can't reach Fysi right now. Check your connection and try again.";
	if (error.response.status === 429) {
		const wait = Number(error.response.headers["retry-after"]);
		return wait ? `Too many tries. Try again in ${wait} seconds.` : "Too many tries. Wait a moment and try again.";
	}
	const body = error.response.data as ApiError | undefined;
	const details = body?.error?.details;
	if (Array.isArray(details) && details.length) {
		const first = details[0] as string | { message?: string };
		const text = typeof first === "string" ? first : first?.message;
		if (text) return text;
	}
	const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
	return message || fallback;
}
