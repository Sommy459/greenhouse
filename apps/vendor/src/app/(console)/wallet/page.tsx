import type { Metadata } from "next";
import { WalletView } from "@/features/wallet/components/WalletView";

export const metadata: Metadata = { title: "Wallet" };

export default function Page() {
	return <WalletView />;
}
