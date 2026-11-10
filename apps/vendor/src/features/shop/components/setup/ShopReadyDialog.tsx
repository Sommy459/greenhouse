"use client";

import { Button } from "@repo/ui/button";
import { DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { VerifiedSeal } from "@repo/ui/verified-seal";
import { SetupDialog } from "@/features/shop/components/setup/SetupDialog";
import { SETUP_SUBMIT } from "@/features/shop/styles";

/**
 * Figma "Congratulations — Your shop is ready!": the end of sign-up, once the shop is created. "Go to Dashboard" and the
 * × both continue (there is nothing to go back to). The shop is still pending approval, so the dashboard's ShopGate
 * shows the approval page until an admin approves it.
 */
export function ShopReadyDialog({ open, onContinue }: { open: boolean; onContinue: () => void }) {
	return (
		<SetupDialog
			open={open}
			onOpenChange={(next) => !next && onContinue()}
			className="pt-28 pb-[88px] sm:pt-[120px] sm:pb-[65px]"
		>
			<div className="text-center">
				<VerifiedSeal className="mx-auto size-[187px]" />
				<DialogTitle className="mt-7 text-[32px] leading-tight font-medium text-primary-400 sm:text-[26px]">
					Congratulations
				</DialogTitle>
				<DialogDescription className="mt-1 mb-0 text-lg text-grey-800 sm:text-base">Your shop is ready!</DialogDescription>
			</div>

			<div className="mx-auto mt-auto w-full max-w-[427px] sm:mt-[93px]">
				<Button type="button" onClick={onContinue} className={SETUP_SUBMIT}>
					Go to Dashboard
				</Button>
			</div>
		</SetupDialog>
	);
}
