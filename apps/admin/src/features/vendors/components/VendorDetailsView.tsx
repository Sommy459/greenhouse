"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Ban, Check, ExternalLink, FileText, RotateCcw, Store, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import { useAdminVendor, useDecideVendor } from "@/features/vendors/hooks";
import { day, DOCUMENT_LABEL, VENDOR_STATUS_LABEL, VENDOR_STATUS_TONE } from "@/features/vendors/options";
import { CERTIFICATION_NAMES, type CertificationId, type VendorDetail } from "@/features/vendors/types";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const kb = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

/**
 * Review one vendor (PRD A1–A2): business details, the owner, documents (private download links), decision history, and
 * the decision: approve (confirming which labels are verified, and founding-vendor status for 0% commission), reject or
 * suspend with a reason the vendor sees, reinstate. Every decision lands in the audit log.
 */
export function VendorDetailsView({ vendorId }: { vendorId: string }) {
	const { data: vendor, isPending, isError, error, refetch } = useAdminVendor(vendorId);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title={vendor?.businessName ?? "Vendor"}
				crumb={vendor?.businessName ?? "Vendor"}
				parents={[{ label: "Vendors", href: consoleRoutes.VENDORS }]}
			/>
			<div className="mt-6">
				{isError ? (
					<div className={clsx(CARD, "text-center text-sm text-grey-900")}>
						<p>{errorMessage(error, "Couldn't load this vendor.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-96 rounded-xl" />
				) : (
					<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
						<div className="space-y-6">
							<Profile vendor={vendor} />
							<Documents vendor={vendor} />
							<History vendor={vendor} />
						</div>
						<Decision key={vendor.status} vendor={vendor} />
					</div>
				)}
			</div>
		</div>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-0.5 sm:grid-cols-[180px_minmax(0,1fr)]">
			<dt className="text-sm text-grey-900">{label}</dt>
			<dd className="text-sm text-ink">{children || "—"}</dd>
		</div>
	);
}

function Profile({ vendor: v }: { vendor: VendorDetail }) {
	return (
		<section className={CARD} aria-label="Business details">
			<div className="flex items-center gap-4">
				<span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-50 text-primary-500">
					{v.logoUrl ? (
						<Image src={v.logoUrl} alt="" fill unoptimized sizes="56px" className="object-cover" />
					) : (
						<Store className="size-6" aria-hidden />
					)}
				</span>
				<div className="min-w-0">
					<p className="text-lg font-semibold text-ink">{v.businessName ?? "Unnamed shop"}</p>
					<div className="mt-1 flex flex-wrap items-center gap-2">
						<span className={clsx("rounded-full px-3 py-0.5 text-xs font-medium", VENDOR_STATUS_TONE[v.status])}>
							{VENDOR_STATUS_LABEL[v.status]}
						</span>
						{v.badge && (
							<span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-500">
								<BadgeCheck className="size-3.5" aria-hidden />
								{v.badge === "certified" ? "Certified" : "Fysi Reviewed"}
							</span>
						)}
						{v.foundingVendor && (
							<span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-medium text-lime-800">Founding vendor</span>
						)}
					</div>
				</div>
			</div>
			<dl className="mt-5 space-y-2">
				<Row label="Owner">
					{v.owner.name} · {v.owner.email}
					{v.owner.phone && ` · ${v.owner.phone}`}
					{!v.owner.twoFactorEnabled && <span className="ml-2 text-xs text-warning-700">2FA off</span>}
				</Row>
				<Row label="Business phone">{v.phone}</Row>
				<Row label="Address">{[v.addressLine, v.city, v.state].filter(Boolean).join(", ")}</Row>
				<Row label="Category">{v.category?.name}</Row>
				<Row label="CAC number">{v.cacNumber}</Row>
				<Row label="Director's ID">
					{v.directorIdLast4 ? `${v.directorIdType?.toUpperCase()} ending ${v.directorIdLast4}` : null}
				</Row>
				<Row label="Labels claimed">{v.claimedCertifications.map((c) => c.name).join(", ")}</Row>
				<Row label="Labels verified">{v.verifiedCertifications.map((c) => c.name).join(", ")}</Row>
				<Row label="Submitted">
					{v.submittedAt ? `${day(v.submittedAt)}${v.submissionCount > 1 ? ` (submission ${v.submissionCount})` : ""}` : null}
				</Row>
				{v.description && <Row label="About">{v.description}</Row>}
			</dl>
			{v.slug && v.status === "approved" && (
				<Link
					href={`${consoleRoutes.PRODUCTS}?vendor=${v.id}`}
					className="mt-4 inline-block text-sm font-medium text-primary-500 hover:underline"
				>
					See this shop&apos;s products
				</Link>
			)}
		</section>
	);
}

function Documents({ vendor }: { vendor: VendorDetail }) {
	return (
		<section className={CARD} aria-labelledby="docs-title">
			<h2 id="docs-title" className="text-base font-semibold text-ink">
				Documents
			</h2>
			{vendor.documents.length === 0 ? (
				<p className="mt-2 text-sm text-grey-900">Nothing uploaded yet.</p>
			) : (
				<ul className="mt-3 divide-y divide-grey-600 rounded-lg border border-grey-600">
					{vendor.documents.map((d) => (
						<li key={d.id} className="flex items-center gap-3 px-4 py-3 text-sm">
							<FileText className="size-4 shrink-0 text-primary-500" aria-hidden />
							<span className="min-w-0 flex-1">
								<span className="font-medium text-ink">{DOCUMENT_LABEL[d.kind]}</span>
								{d.certification && <span className="text-grey-800"> · {CERTIFICATION_NAMES[d.certification]}</span>}
								<span className="block truncate text-xs text-grey-800">
									{d.fileName} · {kb(d.sizeBytes)} · {day(d.createdAt)}
								</span>
							</span>
							{d.url && (
								<a
									href={d.url}
									target="_blank"
									rel="noreferrer"
									className="inline-flex shrink-0 items-center gap-1 font-medium text-primary-500 hover:underline"
								>
									Open <ExternalLink className="size-3.5" aria-hidden />
									<span className="sr-only">{d.fileName} (new tab)</span>
								</a>
							)}
						</li>
					))}
				</ul>
			)}
			{vendor.missing.length > 0 && <p className="mt-3 text-xs text-warning-700">Still missing: {vendor.missing.join(", ")}</p>}
		</section>
	);
}

function History({ vendor }: { vendor: VendorDetail }) {
	if (!vendor.history.length) return null;
	return (
		<section className={CARD} aria-labelledby="history-title">
			<h2 id="history-title" className="text-base font-semibold text-ink">
				History
			</h2>
			<ol className="mt-3 space-y-3">
				{vendor.history.map((h, i) => (
					<li key={i} className="text-sm">
						<p className="text-ink">
							<span className="font-medium capitalize">{h.action.replace(/_/g, " ")}</span>
							{h.actorName && <span className="text-grey-900"> by {h.actorName}</span>}
							<span className="text-grey-800"> · {day(h.at)}</span>
						</p>
						{h.reason && <p className="text-grey-900">“{h.reason}”</p>}
					</li>
				))}
			</ol>
		</section>
	);
}

function Decision({ vendor }: { vendor: VendorDetail }) {
	const decide = useDecideVendor(vendor.id);
	const [mode, setMode] = useState<"approve" | "reject" | "suspend" | null>(null);
	const [labels, setLabels] = useState<CertificationId[]>(vendor.claimedCertifications.map((c) => c.id));
	const [founding, setFounding] = useState(vendor.foundingVendor);
	const [text, setText] = useState("");
	const busy = decide.isPending;
	const reasonOk = text.trim().length >= 10;

	return (
		<aside className={clsx(CARD, "h-fit xl:sticky xl:top-6")} aria-label="Decision">
			<h2 className="text-base font-semibold text-ink">Decision</h2>
			{vendor.decisionReason && vendor.status !== "approved" && (
				<p className="mt-2 rounded-md bg-grey-500 p-3 text-sm text-ink">Last reason: “{vendor.decisionReason}”</p>
			)}

			{vendor.status === "pending" && !mode && (
				<div className="mt-4 grid gap-2">
					<Button onClick={() => setMode("approve")} className="gap-2">
						<Check className="size-4" aria-hidden /> Approve
					</Button>
					<Button variant="outline" onClick={() => setMode("reject")} className="gap-2">
						<X className="size-4" aria-hidden /> Reject
					</Button>
				</div>
			)}
			{vendor.status === "approved" && !mode && (
				<Button
					variant="outline"
					onClick={() => setMode("suspend")}
					className="mt-4 w-full gap-2 border-error-500 text-error-500 hover:bg-error-50"
				>
					<Ban className="size-4" aria-hidden /> Suspend
				</Button>
			)}
			{vendor.status === "suspended" && (
				<Button onClick={() => decide.mutate({ action: "reinstate" })} isLoading={busy} className="mt-4 w-full gap-2">
					<RotateCcw className="size-4" aria-hidden /> Reinstate
				</Button>
			)}
			{(vendor.status === "draft" || vendor.status === "rejected") && (
				<p className="mt-3 text-sm text-grey-900">
					{vendor.status === "draft" ? "Not submitted yet." : "Waiting for the vendor to fix and resubmit."}
				</p>
			)}

			{mode === "approve" && (
				<form
					noValidate
					className="mt-4 space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						decide.mutate({
							action: "approve",
							certifications: labels,
							foundingVendor: founding,
							note: text.trim() || undefined,
						});
					}}
				>
					<fieldset>
						<legend className="text-sm font-medium text-ink">Labels you checked and confirm</legend>
						<p className="text-xs text-grey-800">
							Each earns the &ldquo;Certified&rdquo; badge. None ticked: &ldquo;Fysi Reviewed&rdquo; from the evidence.
						</p>
						<ul className="mt-2 space-y-1.5">
							{(Object.keys(CERTIFICATION_NAMES) as CertificationId[]).map((id) => (
								<li key={id}>
									<label className="flex items-center gap-2 text-sm text-ink">
										<Checkbox
											checked={labels.includes(id)}
											onCheckedChange={(on) => setLabels((l) => (on ? [...l, id] : l.filter((x) => x !== id)))}
										/>
										{CERTIFICATION_NAMES[id]}
										{vendor.claimedCertifications.some((c) => c.id === id) && (
											<span className="text-xs text-grey-800">(claimed)</span>
										)}
									</label>
								</li>
							))}
						</ul>
					</fieldset>
					<label className="flex items-start gap-2 text-sm text-ink">
						<Checkbox checked={founding} onCheckedChange={(on) => setFounding(on === true)} className="mt-0.5" />
						<span>
							Founding vendor
							<span className="block text-xs text-grey-800">0% commission for their first 3 months.</span>
						</span>
					</label>
					<Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Note (optional, internal)" rows={2} />
					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => setMode(null)} disabled={busy} className="flex-1">
							Back
						</Button>
						<Button type="submit" isLoading={busy} className="flex-1">
							Approve
						</Button>
					</div>
				</form>
			)}

			{(mode === "reject" || mode === "suspend") && (
				<form
					noValidate
					className="mt-4 space-y-3"
					onSubmit={(e) => {
						e.preventDefault();
						if (reasonOk) decide.mutate({ action: mode, reason: text.trim() });
					}}
				>
					<label htmlFor="decision-reason" className="text-sm font-medium text-ink">
						Reason (the vendor sees it)
					</label>
					<Textarea
						id="decision-reason"
						value={text}
						onChange={(e) => setText(e.target.value)}
						rows={4}
						placeholder={
							mode === "reject"
								? "e.g. The CAC certificate is unreadable. Upload a clearer scan."
								: "e.g. Repeated complaints about undelivered orders."
						}
					/>
					{!reasonOk && text.length > 0 && <p className="text-xs text-error-500">At least 10 characters.</p>}
					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => setMode(null)} disabled={busy} className="flex-1">
							Back
						</Button>
						<Button
							type="submit"
							isLoading={busy}
							disabled={!reasonOk}
							variant="destructive"
							className="flex-1 hover:bg-error-700"
						>
							{mode === "reject" ? "Reject" : "Suspend"}
						</Button>
					</div>
				</form>
			)}
		</aside>
	);
}
