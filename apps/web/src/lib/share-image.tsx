import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

/**
 * Draws the app's icons and link-preview images at build time (next/og). Logos come from public/images; colours from
 * BRAND (the design tokens, as hex). DM Sans is fetched from Google Fonts when the build can reach it.
 */

const dataUri = async (file: string) =>
	`data:image/png;base64,${(await readFile(join(process.cwd(), "public/images", file))).toString("base64")}`;

async function dmSans(weight: 500 | 700) {
	try {
		const css = await (
			await fetch(`https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}`, {
				headers: { "User-Agent": "Mozilla/5.0 (compatible; FysiBuild/1.0)" },
			})
		).text();
		const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
		return url ? await (await fetch(url)).arrayBuffer() : null;
	} catch {
		return null;
	}
}

async function fonts() {
	const [medium, bold] = await Promise.all([dmSans(500), dmSans(700)]);
	return [
		...(medium ? [{ name: "DM Sans", data: medium, weight: 500 as const, style: "normal" as const }] : []),
		...(bold ? [{ name: "DM Sans", data: bold, weight: 700 as const, style: "normal" as const }] : []),
	];
}

/** The favicon / app icon: the white bag mark on a rounded brand-green square. */
export async function brandIcon(size: number) {
	const mark = await dataUri("logo-mark-white.png");
	const markHeight = Math.round(size * 0.62);
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: BRAND.green,
				borderRadius: Math.round(size * 0.22),
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
			<img src={mark} alt="" height={markHeight} width={Math.round((markHeight * 93) / 114)} />
		</div>,
		{ width: size, height: size },
	);
}

export const SHARE_SIZE = { width: 1200, height: 630 };

/** A 1200×630 link preview: logo, headline, a line of detail and the domain, on brand green (or a darkened photo). */
export async function shareImage({
	eyebrow,
	title,
	subtitle,
	footer,
	background,
}: {
	eyebrow?: string;
	title: string;
	subtitle: string;
	footer: string;
	/** A file in public/images to show behind, darkened. */
	background?: string;
}) {
	const [mark, wordmark, photo, font] = await Promise.all([
		dataUri("logo-mark-white.png"),
		dataUri("logo-wordmark-white.png"),
		background ? dataUri(background) : Promise.resolve(null),
		fonts(),
	]);
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				position: "relative",
				background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDeep} 100%)`,
				fontFamily: font.length ? "DM Sans" : undefined,
			}}
		>
			{photo && (
				// eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img>
				<img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
			)}
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					background: `linear-gradient(90deg, ${BRAND.greenDeep}f2 0%, ${BRAND.greenDeep}cc 55%, ${BRAND.greenDeep}33 100%)`,
				}}
			/>
			<div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "64px 72px", width: "100%" }}>
				<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
					{/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
					<img src={mark} alt="" width={57} height={70} />
					{/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
					<img src={wordmark} alt="" width={128} height={44} />
					{eyebrow && (
						<div
							style={{
								marginLeft: 12,
								padding: "8px 18px",
								borderRadius: 999,
								border: `2px solid ${BRAND.lime}`,
								color: BRAND.lime,
								fontSize: 24,
								fontWeight: 500,
							}}
						>
							{eyebrow}
						</div>
					)}
				</div>
				<div
					style={{
						display: "flex",
						marginTop: 64,
						maxWidth: 820,
						fontSize: title.length > 40 ? 64 : 78,
						fontWeight: 700,
						lineHeight: 1.05,
						color: "white",
						letterSpacing: -1.5,
					}}
				>
					{title}
				</div>
				<div style={{ display: "flex", marginTop: 26, maxWidth: 760, fontSize: 30, lineHeight: 1.35, color: BRAND.mist }}>
					{subtitle}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: "auto", fontSize: 26, fontWeight: 500 }}>
					<div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: BRAND.lime }} />
					<div style={{ display: "flex", color: "white" }}>{footer}</div>
				</div>
			</div>
		</div>,
		{ ...SHARE_SIZE, fonts: font.length ? font : undefined },
	);
}
