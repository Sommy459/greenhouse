import clsx from "clsx";
import { Building2, CalendarDays, Lock, Mail, MapPin, Phone, Tag, User } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { VENDOR_STATUS_LABEL, VENDOR_STATUS_TONE } from "@/features/vendors/options";
import type { VendorDetail } from "@/features/vendors/types";
import { longDate } from "@/lib/format";

/** The vendor's card, in the Customer Details style: green banner, photo, shop and owner, then the facts. */
export function VendorProfile({ vendor }: { vendor: VendorDetail }) {
	const facts = [
		{ icon: Lock, label: "Vendor ID", value: vendor.code },
		{ icon: User, label: "Owner", value: vendor.owner_name },
		{ icon: Mail, label: "Email", value: vendor.email },
		{ icon: Phone, label: "Phone Number", value: vendor.phone_number },
		{ icon: MapPin, label: "Business Address", value: vendor.business_address },
		{ icon: Tag, label: "Category", value: vendor.category },
		{
			icon: Building2,
			label: "Account Type",
			value: vendor.account_type === "business" ? "Registered business" : "Individual seller",
		},
		{ icon: CalendarDays, label: "Applied", value: longDate(new Date(vendor.submitted_at)) },
	];

	return (
		<section aria-label={`${vendor.shop_name} profile`} className="rounded-xl border border-grey-600 bg-white p-2.5 pb-8">
			<div className="h-[150px] rounded-md bg-primary-500 lg:h-[190px]" />
			<div className="-mt-[85px] flex flex-col items-center px-4 text-center lg:-mt-[120px]">
				<UserAvatar
					name={vendor.shop_name}
					src={vendor.avatar_url}
					className="size-[170px] ring-8 ring-white lg:size-[210px]"
					textClassName="text-5xl"
				/>
				<div className="mt-3 flex flex-wrap items-center justify-center gap-2">
					<h2 className="text-xl font-medium text-ink lg:text-[22px]">{vendor.shop_name}</h2>
					<span className={clsx("rounded-full px-2.5 py-0.5 text-sm font-medium", VENDOR_STATUS_TONE[vendor.status])}>
						{VENDOR_STATUS_LABEL[vendor.status]}
					</span>
				</div>
				<p className="mt-1 text-base text-grey-900">{vendor.owner_name}</p>
			</div>

			<dl className="mx-4 mt-6 space-y-5 border-t border-grey-600 pt-6 lg:mx-6">
				{facts.map(({ icon: Icon, label, value }) => (
					<div key={label} className="flex items-start gap-4">
						<span className="grid size-12 shrink-0 place-items-center rounded-full bg-grey-500 text-grey-900">
							<Icon className="size-5" aria-hidden />
						</span>
						<div className="min-w-0">
							<dt className="text-base text-grey-900">{label}</dt>
							<dd className="mt-0.5 text-base break-words text-ink">{value}</dd>
						</div>
					</div>
				))}
			</dl>
		</section>
	);
}
