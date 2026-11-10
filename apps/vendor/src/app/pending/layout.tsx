import { RequireVendor } from "@/features/auth/RequireVendor";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <RequireVendor>{children}</RequireVendor>;
}
