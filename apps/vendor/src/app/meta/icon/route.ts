import { brandIcon } from "@/lib/share-image";

/** The tab icon, linked from the root layout's metadata (built once, at build time). */
export const dynamic = "force-static";

export function GET() {
	return brandIcon(512);
}
