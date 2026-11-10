import { toast } from "@repo/ui/sonner";

/** Toasts (sonner; the <Toaster /> sits in the root layout). Kept as a hook so call sites stay the same. */
export const useToast = () => ({
	success: (message: string) => toast.success(message),
	error: (message: string) => toast.error(message),
	warning: (message: string) => toast.warning(message),
	info: (message: string) => toast.info(message),
});
