import { redirect } from "next/navigation";
import { aboutRoutes } from "@/lib/routes";

/** Sustainability is covered by "Why Fysi?" on the About Us page (Figma). */
export default function Page() {
	redirect(`${aboutRoutes.ABOUT}#why-fysi`);
}
