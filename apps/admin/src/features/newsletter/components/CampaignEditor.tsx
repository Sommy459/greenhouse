"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import {
	AUDIENCE_LABEL,
	CAMPAIGN_AUDIENCES,
	CAMPAIGN_STATUS_LABEL,
	CAMPAIGN_STATUS_TONE,
	useCampaign,
	useCancelCampaign,
	useDeleteCampaign,
	useSaveCampaign,
	useSendCampaign,
	useTestCampaign,
	type Campaign,
	type CampaignAudience,
} from "@/features/newsletter/hooks";
import { errorMessage } from "@/lib/api/client";
import { count } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const LABEL = "text-sm font-medium text-ink";
const when = (s: string) =>
	new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function CampaignView({ id }: { id: string }) {
	const { data, isPending, isError, error, refetch } = useCampaign(id);
	if (isError)
		return (
			<div className="px-4 py-16 text-center text-sm text-grey-900">
				<p>{errorMessage(error, "Couldn't load this campaign.")}</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	if (isPending) return <Skeleton className="m-8 h-96 rounded-xl" />;
	return <CampaignEditor key={`${data.id}-${data.status}`} campaign={data} />;
}

/**
 * An email campaign (POST/PATCH /admin/campaigns): subject, preview text, heading, body and an optional button, to
 * newsletter subscribers or accounts. Drafts can be edited, tested, sent now or scheduled; scheduled ones cancelled.
 */
export function CampaignEditor({ campaign }: { campaign?: Campaign }) {
	const router = useRouter();
	const save = useSaveCampaign(campaign?.id);
	const draft = !campaign || campaign.status === "draft";

	const [name, setName] = useState(campaign?.name ?? "");
	const [subject, setSubject] = useState(campaign?.subject ?? "");
	const [preheader, setPreheader] = useState(campaign?.preheader ?? "");
	const [heading, setHeading] = useState(campaign?.heading ?? "");
	const [body, setBody] = useState(campaign?.body ?? "");
	const [ctaLabel, setCtaLabel] = useState(campaign?.ctaLabel ?? "");
	const [ctaUrl, setCtaUrl] = useState(campaign?.ctaUrl ?? "");
	const [audience, setAudience] = useState<CampaignAudience>(campaign?.audience ?? "newsletter");
	const [problem, setProblem] = useState<string | null>(null);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!draft || save.isPending) return;
		if (!name.trim() || !subject.trim() || !heading.trim() || !body.trim())
			return setProblem("Fill in the name, subject, heading and message");
		if (!!ctaLabel.trim() !== !!ctaUrl.trim()) return setProblem("A button needs both a label and a link");
		if (ctaUrl.trim() && !/^https:\/\//.test(ctaUrl.trim())) return setProblem("The button link must start with https://");
		setProblem(null);
		save.mutate(
			{
				name: name.trim(),
				subject: subject.trim(),
				preheader: preheader.trim() || null,
				heading: heading.trim(),
				body: body.trim(),
				ctaLabel: ctaLabel.trim() || null,
				ctaUrl: ctaUrl.trim() || null,
				audience,
			},
			{ onSuccess: (c) => !campaign && router.replace(consoleRoutes.CAMPAIGN(c.id)) },
		);
	};

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title={campaign?.name ?? "New campaign"}
				crumb={campaign?.name ?? "New campaign"}
				parents={[{ label: "Newsletter", href: consoleRoutes.CAMPAIGNS }]}
			>
				{campaign && (
					<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", CAMPAIGN_STATUS_TONE[campaign.status])}>
						{CAMPAIGN_STATUS_LABEL[campaign.status]}
					</span>
				)}
			</ListHeader>

			<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
				<form noValidate onSubmit={onSubmit} className={clsx(CARD, "grid content-start gap-4")}>
					<fieldset disabled={!draft} className="grid gap-4">
						<label className="grid gap-1.5">
							<span className={LABEL}>Name (only admins see it)</span>
							<Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
						</label>
						<label className="grid gap-1.5">
							<span className={LABEL}>Send to</span>
							<select
								value={audience}
								onChange={(e) => setAudience(e.target.value as CampaignAudience)}
								className="h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm"
							>
								{CAMPAIGN_AUDIENCES.map((a) => (
									<option key={a} value={a}>
										{AUDIENCE_LABEL[a]}
									</option>
								))}
							</select>
						</label>
						<label className="grid gap-1.5">
							<span className={LABEL}>Subject</span>
							<Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} className="h-11" />
						</label>
						<label className="grid gap-1.5">
							<span className={LABEL}>Preview text (optional)</span>
							<Input value={preheader} onChange={(e) => setPreheader(e.target.value)} maxLength={200} className="h-11" />
						</label>
						<label className="grid gap-1.5">
							<span className={LABEL}>Heading</span>
							<Input value={heading} onChange={(e) => setHeading(e.target.value)} className="h-11" />
						</label>
						<label className="grid gap-1.5">
							<span className={LABEL}>Message</span>
							<Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
						</label>
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="grid gap-1.5">
								<span className={LABEL}>Button label (optional)</span>
								<Input
									value={ctaLabel}
									onChange={(e) => setCtaLabel(e.target.value)}
									placeholder="Shop the sale"
									className="h-11"
								/>
							</label>
							<label className="grid gap-1.5">
								<span className={LABEL}>Button link</span>
								<Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://…" className="h-11" />
							</label>
						</div>
					</fieldset>
					{problem && <p className="text-sm text-error-500">{problem}</p>}
					{draft ? (
						<Button type="submit" isLoading={save.isPending} className="h-12 rounded-lg">
							{campaign ? "Save draft" : "Create draft"}
						</Button>
					) : (
						<p className="text-sm text-grey-900">Only drafts can be changed.</p>
					)}
				</form>

				{campaign && <SendPanel campaign={campaign} />}
			</div>
		</div>
	);
}

function SendPanel({ campaign: c }: { campaign: Campaign }) {
	const router = useRouter();
	const test = useTestCampaign(c.id);
	const send = useSendCampaign(c.id);
	const cancel = useCancelCampaign(c.id);
	const remove = useDeleteCampaign(c.id);
	const [testEmail, setTestEmail] = useState("");
	const [later, setLater] = useState("");
	const [confirming, setConfirming] = useState(false);

	return (
		<aside className={clsx(CARD, "h-fit space-y-5")} aria-label="Send">
			{c.status !== "draft" && (
				<dl className="space-y-1.5 text-sm">
					<div className="flex justify-between">
						<dt className="text-grey-900">Recipients</dt>
						<dd className="text-ink">{count(c.recipientCount)}</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-grey-900">Delivered</dt>
						<dd className="text-ink">{count(c.sentCount)}</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-grey-900">Failed</dt>
						<dd className="text-ink">{count(c.failedCount)}</dd>
					</div>
					{c.scheduledAt && (
						<div className="flex justify-between">
							<dt className="text-grey-900">Scheduled for</dt>
							<dd className="text-ink">{when(c.scheduledAt)}</dd>
						</div>
					)}
					{c.sentAt && (
						<div className="flex justify-between">
							<dt className="text-grey-900">Sent</dt>
							<dd className="text-ink">{when(c.sentAt)}</dd>
						</div>
					)}
				</dl>
			)}

			{c.status === "draft" && (
				<>
					<form
						noValidate
						className="grid gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							test.mutate(testEmail.trim() || undefined);
						}}
					>
						<span className={LABEL}>Send a test</span>
						<Input
							value={testEmail}
							onChange={(e) => setTestEmail(e.target.value)}
							type="email"
							placeholder="Your email if left empty"
							className="h-11"
						/>
						<Button type="submit" variant="outline" isLoading={test.isPending} className="h-11">
							Send test
						</Button>
					</form>

					<div className="grid gap-2 border-t border-grey-600 pt-5">
						<span className={LABEL}>Send to {AUDIENCE_LABEL[c.audience].toLowerCase()}</span>
						<label className="grid gap-1 text-sm text-grey-900">
							Schedule for later (optional)
							<Input value={later} onChange={(e) => setLater(e.target.value)} type="datetime-local" className="h-11" />
						</label>
						{confirming ? (
							<div className="rounded-lg border border-warning-700/40 bg-warning-50 p-3 text-sm text-ink">
								<p>
									{later
										? `Schedule it for ${when(new Date(later).toISOString())}?`
										: "Send it to everyone now? This can't be undone."}
								</p>
								<div className="mt-3 flex gap-2">
									<Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
										Back
									</Button>
									<Button
										size="sm"
										isLoading={send.isPending}
										onClick={() =>
											send.mutate(later ? new Date(later).toISOString() : undefined, { onSettled: () => setConfirming(false) })
										}
									>
										{later ? "Schedule" : "Send now"}
									</Button>
								</div>
							</div>
						) : (
							<Button onClick={() => setConfirming(true)} className="h-11">
								{later ? "Schedule" : "Send now"}
							</Button>
						)}
					</div>

					<button
						type="button"
						disabled={remove.isPending}
						onClick={() => remove.mutate(undefined, { onSuccess: () => router.push(consoleRoutes.CAMPAIGNS) })}
						className="text-sm font-medium text-error-500 hover:underline"
					>
						Delete draft
					</button>
				</>
			)}

			{c.status === "scheduled" && (
				<Button
					variant="outline"
					isLoading={cancel.isPending}
					onClick={() => cancel.mutate(undefined)}
					className="h-11 w-full border-error-500 text-error-500"
				>
					Cancel the send
				</Button>
			)}
		</aside>
	);
}
