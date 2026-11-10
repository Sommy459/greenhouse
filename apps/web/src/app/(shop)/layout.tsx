import { StoreFooter } from "@/components/layouts/StoreFooter";
import { StoreHeader } from "@/components/layouts/StoreHeader";

/** Every storefront page: header (search, categories, account, cart) and footer. */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<StoreHeader />
			<main className="min-h-[60dvh] min-w-0">{children}</main>
			<StoreFooter />
		</>
	);
}
