"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { CircleAlert, CircleCheck, FileText, Store, Trash2, Upload } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { cn } from "@repo/ui/lib/utils";
import { useSignOut } from "@/features/auth/hooks";
import {
	useCategories,
	useDeleteDocument,
	useProfile,
	useSubmitApplication,
	useUpdateProfile,
	useUploadDocument,
	useUploadLogo,
} from "@/features/shop/hooks";
import {
	CERTIFICATIONS,
	type CertificationId,
	type DocumentKind,
	type ProfileUpdate,
	type VendorProfile,
} from "@/features/shop/types";
import { NIGERIAN_STATES } from "@/lib/nigeria";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 sm:p-6";
const FIELD =
	"h-11 w-full rounded-md border border-grey-700 bg-white px-3 text-sm text-ink outline-none focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40 disabled:bg-grey-500 disabled:text-grey-900";
const LABEL = "text-sm font-medium text-ink";
const DOC_TYPES = "application/pdf,image/jpeg,image/png,image/webp";
const DOC_MAX = 10 * 1024 * 1024;

const DOC_LABEL: Record<DocumentKind, string> = {
	cac_certificate: "CAC certificate",
	director_id: "Director's ID",
	proof_of_address: "Proof of address",
	sustainability_certificate: "Eco certificate",
	sustainability_evidence: "Sustainability evidence",
};

/** Human names for the API's `missing` items (anything unknown is shown as it comes). */
const MISSING_LABEL: Record<string, string> = {
	businessName: "Shop name",
	description: "Shop description",
	phone: "Business phone",
	addressLine: "Business address",
	city: "City",
	state: "State",
	category: "Main category",
	categoryId: "Main category",
	cacNumber: "CAC registration number",
	directorId: "Director's NIN or BVN",
	logo: "Shop logo",
	cac_certificate: "CAC certificate",
	sustainability: "An eco certificate or sustainability evidence",
	sustainability_certificate: "An eco certificate or sustainability evidence",
	sustainability_evidence: "An eco certificate or sustainability evidence",
};

/**
 * Seller onboarding (PRD V2–V3): business details, logo and verification documents, then Submit for verification. The
 * checklist comes from the API (`missing`). A rejected application shows why and can be fixed and sent again.
 */
export function OnboardingView() {
	const { data: profile, isPending } = useProfile();
	const submit = useSubmitApplication();
	const signOut = useSignOut();

	if (isPending || !profile) return <div className="h-96 animate-pulse rounded-xl bg-grey-600" aria-busy />;

	return (
		<div className="space-y-5">
			<div className="text-center">
				<h1 className="text-xl font-semibold text-ink">Verify your shop</h1>
				<p className="mt-2 text-sm text-grey-900">
					Fysi checks every seller before they can list products. Fill in your business details and upload your documents, then
					submit.
				</p>
			</div>

			{profile.status === "rejected" && (
				<p role="alert" className="flex gap-3 rounded-xl border border-error-500 bg-error-50 p-4 text-sm text-ink">
					<CircleAlert className="size-5 shrink-0 text-error-500" aria-hidden />
					<span>
						<strong className="font-semibold">Your application wasn&apos;t approved.</strong>{" "}
						{profile.decisionReason ?? "Check your details and documents."} Fix what&apos;s needed and submit again.
					</span>
				</p>
			)}

			<BusinessDetails key={profile.businessName ?? "new"} profile={profile} />
			<Logo profile={profile} />
			<Documents profile={profile} />

			<section className={CARD} aria-labelledby="checklist-title">
				<h2 id="checklist-title" className="text-base font-semibold text-ink">
					Ready to submit?
				</h2>
				{profile.missing.length === 0 ? (
					<p className="mt-2 flex items-center gap-2 text-sm text-success-700">
						<CircleCheck className="size-4" aria-hidden /> Everything&apos;s in. Submit when you&apos;re ready.
					</p>
				) : (
					<ul className="mt-2 space-y-1 text-sm text-grey-900">
						{[...new Set(profile.missing.map((m) => MISSING_LABEL[m] ?? m))].map((m) => (
							<li key={m} className="flex items-center gap-2">
								<CircleAlert className="size-4 text-warning-700" aria-hidden /> Still needed: {m}
							</li>
						))}
					</ul>
				)}
				<Button
					type="button"
					onClick={() => submit.mutate()}
					isLoading={submit.isPending}
					disabled={profile.missing.length > 0}
					className="mt-4 h-12 w-full text-base"
				>
					Submit for verification
				</Button>
				<p className="mt-2 text-xs text-grey-800">
					Your details and documents lock while Fysi reviews them. We&apos;ll email you the decision.
				</p>
			</section>

			<button
				type="button"
				onClick={signOut}
				className="block w-full text-center text-sm font-medium text-grey-900 hover:text-ink"
			>
				Log out
			</button>
		</div>
	);
}

function BusinessDetails({ profile }: { profile: VendorProfile }) {
	const update = useUpdateProfile();
	const categories = useCategories();
	const locked = !profile.canEdit;
	const [values, setValues] = useState({
		businessName: profile.businessName ?? "",
		description: profile.description ?? "",
		phone: profile.phone ?? "",
		addressLine: profile.addressLine ?? "",
		city: profile.city ?? "",
		state: profile.state ?? "",
		categoryId: profile.category?.id ?? "",
		cacNumber: profile.cacNumber ?? "",
		directorIdType: (profile.directorIdType ?? "nin") as "nin" | "bvn",
		directorId: "",
	});
	const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
		setValues((v) => ({ ...v, [key]: e.target.value }));

	const save = () => {
		const changes: ProfileUpdate = { description: values.description || null, phone: values.phone };
		if (!locked) {
			Object.assign(changes, {
				businessName: values.businessName,
				addressLine: values.addressLine,
				city: values.city,
				state: values.state || undefined,
				categoryId: values.categoryId || undefined,
				cacNumber: values.cacNumber || undefined,
				directorIdType: values.directorIdType,
				directorId: values.directorId || undefined,
			});
		}
		update.mutate(Object.fromEntries(Object.entries(changes).filter(([, v]) => v !== undefined && v !== "")) as ProfileUpdate, {
			onSuccess: () => setValues((v) => ({ ...v, directorId: "" })),
		});
	};

	return (
		<form
			noValidate
			className={CARD}
			aria-labelledby="details-title"
			onSubmit={(e) => {
				e.preventDefault();
				save();
			}}
		>
			<h2 id="details-title" className="text-base font-semibold text-ink">
				Business details
			</h2>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<Field label="Shop name" className="sm:col-span-2">
					<Input value={values.businessName} onChange={set("businessName")} disabled={locked} className={FIELD} />
				</Field>
				<Field label="Main category">
					<select value={values.categoryId} onChange={set("categoryId")} disabled={locked} className={FIELD}>
						<option value="">Choose…</option>
						{categories.data?.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</Field>
				<Field label="Business phone">
					<Input type="tel" value={values.phone} onChange={set("phone")} placeholder="e.g. 0801 234 5678" className={FIELD} />
				</Field>
				<Field label="Business address" className="sm:col-span-2">
					<Input value={values.addressLine} onChange={set("addressLine")} disabled={locked} className={FIELD} />
				</Field>
				<Field label="City">
					<Input value={values.city} onChange={set("city")} disabled={locked} className={FIELD} />
				</Field>
				<Field label="State">
					<select value={values.state} onChange={set("state")} disabled={locked} className={FIELD}>
						<option value="">Choose…</option>
						{NIGERIAN_STATES.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</Field>
				<Field label="CAC registration number">
					<Input
						value={values.cacNumber}
						onChange={set("cacNumber")}
						disabled={locked}
						placeholder="e.g. RC1234567"
						className={FIELD}
					/>
				</Field>
				<Field
					label={`Director's ${values.directorIdType.toUpperCase()}${profile.directorIdLast4 ? ` (ends ${profile.directorIdLast4})` : ""}`}
				>
					<div className="flex gap-2">
						<select
							value={values.directorIdType}
							onChange={set("directorIdType")}
							disabled={locked}
							// cn, not clsx: FIELD has w-full, which would beat w-24 and squeeze the ID number input to nothing.
							className={cn(FIELD, "w-24 shrink-0")}
							aria-label="ID type"
						>
							<option value="nin">NIN</option>
							<option value="bvn">BVN</option>
						</select>
						<Input
							inputMode="numeric"
							value={values.directorId}
							onChange={set("directorId")}
							disabled={locked}
							placeholder={profile.directorIdLast4 ? "Enter again to change" : "11 digits"}
							className={FIELD}
						/>
					</div>
				</Field>
				<Field label="About your shop (what you sell, how it's made)" className="sm:col-span-2">
					<Textarea value={values.description} onChange={set("description")} rows={3} maxLength={1000} />
				</Field>
			</div>
			{locked && (
				<p className="mt-3 text-xs text-grey-800">
					Business identity is locked while it&apos;s reviewed; the phone and description can still change.
				</p>
			)}
			<Button type="submit" variant="outline" isLoading={update.isPending} className="mt-4">
				Save details
			</Button>
		</form>
	);
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
	return (
		<label className={clsx("grid gap-1.5", className)}>
			<span className={LABEL}>{label}</span>
			{children}
		</label>
	);
}

function Logo({ profile }: { profile: VendorProfile }) {
	const upload = useUploadLogo();
	return (
		<section className={clsx(CARD, "flex items-center gap-4")} aria-label="Shop logo">
			<span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-50 text-primary-500">
				{profile.logoUrl ? (
					<Image src={profile.logoUrl} alt="" fill unoptimized sizes="64px" className="object-cover" />
				) : (
					<Store className="size-6" aria-hidden />
				)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-base font-semibold text-ink">Shop logo</p>
				<p className="text-xs text-grey-800">Shown on your store page. JPG, PNG or WebP.</p>
			</div>
			<label
				className={clsx(
					"cursor-pointer rounded-md border border-grey-600 px-3 py-2 text-sm font-medium text-ink hover:border-primary-500",
					upload.isPending && "opacity-60",
				)}
			>
				{upload.isPending ? "Uploading…" : profile.logoUrl ? "Change" : "Upload"}
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					className="sr-only"
					disabled={upload.isPending}
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) upload.mutate(file);
						e.target.value = "";
					}}
				/>
			</label>
		</section>
	);
}

function Documents({ profile }: { profile: VendorProfile }) {
	const upload = useUploadDocument();
	const remove = useDeleteDocument();
	const [kind, setKind] = useState<DocumentKind>("cac_certificate");
	const [certification, setCertification] = useState<CertificationId>("gots");
	const [problem, setProblem] = useState<string | null>(null);
	const locked = !profile.canEdit;

	return (
		<section className={CARD} aria-labelledby="documents-title">
			<h2 id="documents-title" className="text-base font-semibold text-ink">
				Verification documents
			</h2>
			<p className="mt-1 text-sm text-grey-900">
				Needed: your <strong className="font-medium text-ink">CAC certificate</strong>, and either an{" "}
				<strong className="font-medium text-ink">eco certificate</strong> (GOTS, FSC, Fairtrade…: earns the
				&ldquo;Certified&rdquo; badge) or <strong className="font-medium text-ink">sustainability evidence</strong> (materials,
				sourcing, photos: earns &ldquo;Fysi Reviewed&rdquo;). A director&apos;s ID and proof of address are optional. PDF, JPG,
				PNG or WebP, up to 10 MB each.
			</p>

			{profile.documents.length > 0 && (
				<ul className="mt-4 divide-y divide-grey-600 rounded-md border border-grey-600">
					{profile.documents.map((d) => (
						<li key={d.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
							<FileText className="size-4 shrink-0 text-primary-500" aria-hidden />
							<span className="min-w-0 flex-1">
								<span className="font-medium text-ink">{DOC_LABEL[d.kind]}</span>
								{d.certification && (
									<span className="text-grey-800"> · {CERTIFICATIONS.find((c) => c.id === d.certification)?.name}</span>
								)}
								<span className="block truncate text-xs text-grey-800">
									{d.url ? (
										<a href={d.url} target="_blank" rel="noreferrer" className="hover:text-primary-500 hover:underline">
											{d.fileName}
										</a>
									) : (
										d.fileName
									)}
								</span>
							</span>
							{!locked && (
								<button
									type="button"
									onClick={() => remove.mutate(d.id)}
									disabled={remove.isPending}
									aria-label={`Remove ${d.fileName}`}
									className="grid size-8 place-items-center rounded-md text-grey-900 hover:bg-error-50 hover:text-error-500"
								>
									<Trash2 className="size-4" />
								</button>
							)}
						</li>
					))}
				</ul>
			)}

			{!locked && (
				<div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
					<label className="grid gap-1.5">
						<span className={LABEL}>Document</span>
						<select value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)} className={FIELD}>
							{(Object.keys(DOC_LABEL) as DocumentKind[]).map((k) => (
								<option key={k} value={k}>
									{DOC_LABEL[k]}
								</option>
							))}
						</select>
					</label>
					{kind === "sustainability_certificate" ? (
						<label className="grid gap-1.5">
							<span className={LABEL}>Which label</span>
							<select
								value={certification}
								onChange={(e) => setCertification(e.target.value as CertificationId)}
								className={FIELD}
							>
								{CERTIFICATIONS.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</label>
					) : (
						<span className="hidden sm:block" />
					)}
					<label
						className={clsx(
							"inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-400",
							upload.isPending && "pointer-events-none opacity-60",
						)}
					>
						<Upload className="size-4" aria-hidden />
						{upload.isPending ? "Uploading…" : "Upload file"}
						<input
							type="file"
							accept={DOC_TYPES}
							className="sr-only"
							onChange={(e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (!file) return;
								if (!DOC_TYPES.split(",").includes(file.type)) return setProblem("Upload a PDF, JPG, PNG or WebP file.");
								if (file.size > DOC_MAX) return setProblem("That file is over 10 MB.");
								setProblem(null);
								upload.mutate({ file, kind, certification: kind === "sustainability_certificate" ? certification : undefined });
							}}
						/>
					</label>
				</div>
			)}
			{problem && (
				<p role="alert" className="mt-2 text-sm text-error-500">
					{problem}
				</p>
			)}
		</section>
	);
}
