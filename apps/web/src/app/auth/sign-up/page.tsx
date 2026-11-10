import type { Metadata } from "next";
import { WelcomeScreen } from "@/features/auth/components/WelcomeScreen";

export const metadata: Metadata = { title: "Create an account" };

/** Figma "Welcome to Fysi": sign up starts with one email-or-phone field and a one-time code. */
export default function Page() {
	return <WelcomeScreen />;
}
