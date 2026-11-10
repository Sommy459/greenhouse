import { brandIcon } from "@/lib/share-image";

/** The home-screen icon on iPhone and iPad. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return brandIcon(size.width);
}
