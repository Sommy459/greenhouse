/**
 * Server-side only (route files' generateMetadata): reads from the Fysi API for page metadata (link previews of products and stores). Public endpoints only,
 * cached for 5 minutes; any failure returns null so the page still renders with the default title and preview.
 */
const API_BASE = process.env.API_PROXY_TARGET || "https://fysi-backend-production.up.railway.app/api/v1";

export async function getPublic<T>(path: string): Promise<T | null> {
	try {
		const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
		if (!res.ok) return null;
		return ((await res.json()) as { data?: T }).data ?? null;
	} catch {
		return null;
	}
}

/** Plain text for a description tag: no line breaks, at most `max` characters. */
export const snippet = (text: string | null | undefined, max = 160) => {
	const flat = (text ?? "").replace(/\s+/g, " ").trim();
	return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};
