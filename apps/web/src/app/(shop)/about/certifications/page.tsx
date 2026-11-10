import { redirect } from "next/navigation";
import { aboutRoutes } from "@/lib/routes";

/** Eco-certification is a section of the About Us page (Figma). */
export default function Page() {
	redirect(`${aboutRoutes.ABOUT}#certification`);
}
