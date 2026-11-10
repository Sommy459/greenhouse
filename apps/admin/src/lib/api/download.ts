import { api } from "@/lib/api/client";

/** Saves a file in the browser as `<name>-<yyyy-mm-dd>.csv`. */
function save(blob: Blob, name: string) {
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
	link.click();
	setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/** Fetches a file the API builds (e.g. a CSV export) and saves it as `<name>-<yyyy-mm-dd>.csv`. */
export async function downloadCsv(url: string, params: Record<string, unknown>, name: string) {
	const { data } = await api.get(url, { params, responseType: "blob" });
	save(data instanceof Blob ? data : new Blob([String(data)], { type: "text/csv" }), name);
}

/** Builds a CSV from rows already in the page (first row = headings) and saves it. */
export function saveCsv(rows: (string | number | null | undefined)[][], name: string) {
	const cell = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
	save(new Blob([rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv" }), name);
}
