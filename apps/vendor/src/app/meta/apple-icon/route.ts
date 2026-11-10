import { brandIcon } from "@/lib/share-image";

/** The iPhone / iPad home-screen icon, linked from the root layout's metadata. */
export const dynamic = "force-static";

export function GET() {
	return brandIcon(180);
}
