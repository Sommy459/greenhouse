"use client";

import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@repo/ui/lib/utils";

/** A QR code drawn in the browser (nothing is sent anywhere), e.g. a SEP-7 payment URI any Stellar wallet can scan. */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
	const { data } = useQuery({
		queryKey: ["qr", value],
		queryFn: () => QRCode.toDataURL(value, { margin: 1, width: 480, errorCorrectionLevel: "M" }),
		staleTime: Infinity,
	});
	return (
		<div className={cn("aspect-square rounded-lg border border-grey-600 bg-white p-3", className)}>
			{data ? (
				// A data: URL drawn here; next/image adds nothing for it.
				// eslint-disable-next-line @next/next/no-img-element
				<img src={data} alt={label} className="size-full" />
			) : (
				<div className="size-full animate-pulse rounded bg-grey-600" aria-hidden />
			)}
		</div>
	);
}
