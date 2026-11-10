"use client";

import { Button } from "@repo/ui/button";
import { DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { SetupDialog } from "@/features/shop/components/setup/SetupDialog";
import { ACCOUNT_TYPES, type AccountType } from "@/features/shop/options";
import { SETUP_SUBMIT } from "@/features/shop/styles";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	accountType: AccountType | undefined;
	isSubmitting: boolean;
	onConfirm: () => void;
}

/**
 * Figma "Confirm your Account Type": shown when the shop details are submitted, because the type can't be changed later.
 * Submit here creates the shop; closing goes back to the form with everything kept.
 */
export function ConfirmAccountTypeDialog({ open, onOpenChange, accountType, isSubmitting, onConfirm }: Props) {
	const chosen = ACCOUNT_TYPES.find((t) => t.value === accountType)?.label;

	return (
		<SetupDialog open={open} onOpenChange={onOpenChange} locked={isSubmitting}>
			<div className="mx-auto w-full max-w-[427px] text-center">
				<DialogTitle className="text-[32px] leading-tight font-medium text-ink sm:text-[28px]">
					Confirm your Account Type
				</DialogTitle>
				<DialogDescription className="mt-6 mb-0 text-lg leading-snug text-grey-800 sm:mt-4 sm:text-base">
					Kindly validate your account type as once confirmed, it cannot be changed later
				</DialogDescription>
				{/* Not in the design: says which type is about to be confirmed. */}
				{chosen && (
					<p className="mt-3 text-base text-ink sm:text-sm">
						You chose <strong className="font-semibold">{chosen}</strong>.
					</p>
				)}
			</div>

			<dl className="mx-auto mt-14 w-full max-w-[427px] space-y-12 text-lg leading-snug text-ink/80 sm:mt-[60px] sm:space-y-[52px] sm:text-base">
				<div>
					<dt className="inline text-primary-400">Individual: </dt>
					<dd className="inline">If you are a seller without any registered or incorporated company.</dd>
				</div>
				<div>
					<dt className="inline text-primary-400">Business: </dt>
					<dd className="inline">If you are a registered or incorporated company with the required documents.</dd>
				</div>
			</dl>

			<div className="mx-auto mt-auto w-full max-w-[427px] sm:mt-[110px]">
				<Button type="button" onClick={onConfirm} isLoading={isSubmitting} className={SETUP_SUBMIT}>
					Submit
				</Button>
			</div>
		</SetupDialog>
	);
}
