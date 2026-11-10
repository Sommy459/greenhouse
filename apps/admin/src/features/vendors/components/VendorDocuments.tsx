"use client";

import clsx from "clsx";
import { BadgeCheck, ExternalLink, FileText, IdCard, Leaf } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useSetCertificationStatus } from "@/features/vendors/hooks";
import type { BadgeType, CertificationStatus, VendorDetail } from "@/features/vendors/types";

const CERT_LABEL: Record<CertificationStatus, string> = {
	pending: "Awaiting review",
	verified: "Verified",
	rejected: "Rejected",
	revoked: "Revoked",
};
const CERT_TONE: Record<CertificationStatus, string> = {
	pending: "bg-warning-50 text-warning-700",
	verified: "bg-success-50 text-success-700",
	rejected: "bg-error-50 text-error-500",
	revoked: "bg-grey-500 text-grey-900",
};
const BADGE_LABEL: Record<BadgeType, string> = { certified: "Certified", fysi_reviewed: "Fysi Reviewed" };

/**
 * "Business verification" (PRD A1, KYB): the CAC registration, the director's ID and the sustainability certificates.
 * Certificates are verified one by one; a verified one puts its badge on the shop's products.
 */
export function VendorDocuments({ vendor }: { vendor: VendorDetail }) {
	const setCert = useSetCertificationStatus();
	const canSell = vendor.status === "approved";

	return (
		<section aria-labelledby="verification" className="rounded-xl border border-grey-600 bg-white">
			<div className="px-5 py-5 lg:px-9">
				<h2 id="verification" className="text-xl font-medium text-ink lg:text-2xl">
					Business verification
				</h2>
				{vendor.status === "rejected" && vendor.rejection_reason && (
					<p className="mt-3 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
						<span className="font-medium">Rejected:</span> {vendor.rejection_reason}
					</p>
				)}
				{vendor.status === "suspended" && (
					<p className="mt-3 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
						<span className="font-medium">Suspended</span>
						{vendor.suspension_reason ? `: ${vendor.suspension_reason}` : "."}
					</p>
				)}
			</div>

			<ul className="divide-y divide-grey-600 border-t border-grey-600">
				<DocumentRow
					icon={FileText}
					title="CAC registration"
					detail={
						vendor.account_type === "individual" ? "Not needed: individual seller" : vendor.cac ? vendor.cac.number : "Missing"
					}
					missing={vendor.account_type === "business" && !vendor.cac}
					href={vendor.cac?.certificate_url ?? null}
				/>
				<DocumentRow
					icon={IdCard}
					title="Director's ID"
					detail={vendor.director_id ? `${vendor.director_id.type.toUpperCase()} ending ${vendor.director_id.last4}` : "Missing"}
					missing={!vendor.director_id}
					href={null}
				/>

				{vendor.certifications.length === 0 ? (
					<li className="flex items-center gap-4 px-5 py-5 lg:px-9">
						<span className="grid size-12 shrink-0 place-items-center rounded-full bg-grey-500 text-grey-900">
							<Leaf className="size-5" aria-hidden />
						</span>
						<p className="text-base text-grey-900">No sustainability certificate or evidence submitted.</p>
					</li>
				) : (
					vendor.certifications.map((cert) => (
						<li key={cert.id} className="flex flex-wrap items-center gap-4 px-5 py-5 lg:px-9">
							<span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500">
								{cert.badge === "certified" ? (
									<BadgeCheck className="size-5" aria-hidden />
								) : (
									<Leaf className="size-5" aria-hidden />
								)}
							</span>
							<div className="min-w-0 flex-1">
								<p className="flex flex-wrap items-center gap-2 text-base text-ink">
									{cert.name}
									<span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-primary-600">
										{BADGE_LABEL[cert.badge]}
									</span>
								</p>
								<p className="mt-0.5 text-sm text-grey-900">
									{cert.issuer}
									{cert.document_url && (
										<>
											{" · "}
											<a
												href={cert.document_url}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 font-medium text-primary-500 hover:underline"
											>
												View document <ExternalLink className="size-3.5" aria-hidden />
											</a>
										</>
									)}
								</p>
							</div>
							<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", CERT_TONE[cert.status])}>
								{CERT_LABEL[cert.status]}
							</span>
							<div className="flex gap-2">
								{cert.status === "verified" ? (
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={setCert.isPending}
										onClick={() => setCert.mutate({ id: cert.id, status: "revoked" })}
										className="border-grey-600 bg-white text-grey-900 hover:bg-error-50 hover:text-error-500"
									>
										Revoke
									</Button>
								) : (
									<>
										{cert.status === "pending" && (
											<Button
												type="button"
												size="sm"
												variant="outline"
												disabled={setCert.isPending}
												onClick={() => setCert.mutate({ id: cert.id, status: "rejected" })}
												className="border-grey-600 bg-white text-grey-900 hover:bg-error-50 hover:text-error-500"
											>
												Reject
											</Button>
										)}
										<Button
											type="button"
											size="sm"
											disabled={setCert.isPending}
											onClick={() => setCert.mutate({ id: cert.id, status: "verified" })}
											title={canSell ? undefined : "The badge shows once the shop is approved"}
										>
											Verify
										</Button>
									</>
								)}
							</div>
						</li>
					))
				)}
			</ul>
		</section>
	);
}

function DocumentRow({
	icon: Icon,
	title,
	detail,
	missing,
	href,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	detail: string;
	missing: boolean;
	href: string | null;
}) {
	return (
		<li className="flex flex-wrap items-center gap-4 px-5 py-5 lg:px-9">
			<span className="grid size-12 shrink-0 place-items-center rounded-full bg-grey-500 text-grey-900">
				<Icon className="size-5" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-base text-ink">{title}</p>
				<p className={clsx("mt-0.5 text-sm", missing ? "font-medium text-error-500" : "text-grey-900")}>{detail}</p>
			</div>
			{href && (
				<a
					href={href}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:underline"
				>
					View document <ExternalLink className="size-4" aria-hidden />
				</a>
			)}
		</li>
	);
}
