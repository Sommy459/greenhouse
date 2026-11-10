import { redirect } from "next/navigation";
import { aboutRoutes } from "@/lib/routes";

/** Mission is a section of the About Us page (Figma). */
export default function Page() {
	redirect(`${aboutRoutes.ABOUT}#mission`);
}
