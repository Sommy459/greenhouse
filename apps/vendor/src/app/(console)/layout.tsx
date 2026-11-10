import { VendorShell } from "@/components/VendorShell";
import { RequireVendor } from "@/features/auth/RequireVendor";
import { ShopGate } from "@/features/shop/ShopGate";

/** Signed-in vendors with an approved shop only (V1). */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<RequireVendor>
			<ShopGate>
				<VendorShell>{children}</VendorShell>
			</ShopGate>
		</RequireVendor>
	);
}
