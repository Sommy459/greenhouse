import { AdminShell } from "@/components/AdminShell";
import { RequireAdmin } from "@/features/auth/RequireAdmin";

/** Admins only (A1). */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<RequireAdmin>
			<AdminShell>{children}</AdminShell>
		</RequireAdmin>
	);
}
