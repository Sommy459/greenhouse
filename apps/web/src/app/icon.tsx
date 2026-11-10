import { brandIcon } from "@/lib/share-image";

/** The browser-tab icon (Next adds the <link rel="icon">). */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
	return brandIcon(size.width);
}
