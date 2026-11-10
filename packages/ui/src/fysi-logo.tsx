import { cn } from "./lib/utils";

/** Each app serves these from its own public folder (apps/{web,vendor,admin}/public/images). Exported from Figma. */
const MARK_SRC = "/images/logo-mark.png"; // the shopping bag, 93×114 file (62×76 at 1x)
const WORDMARK_SRC = "/images/logo-wordmark.png"; // "FYSI", 201×69 file (67×23 at 1x)

/**
 * The PNG is used as a mask filled with `currentColor`, so the logo takes the text colour: brand green by default,
 * white inside a `text-white` parent. Height comes from `className`; the width follows the file's proportions.
 */
function MaskedImage({ src, width, height, className }: { src: string; width: number; height: number; className?: string }) {
	const mask = `url("${src}") center / contain no-repeat`;
	return (
		<svg viewBox={`0 0 ${width} ${height}`} aria-hidden className={cn("w-auto shrink-0", className)} style={{ aspectRatio: `${width} / ${height}`, mask, WebkitMask: mask }}>
			<rect width={width} height={height} fill="currentColor" />
		</svg>
	);
}

/** Heights of the mark and the wordmark (Figma: the sign-in screens use lg, 37px and 23px). */
const SIZES = {
	sm: { mark: "h-6", wordmark: "h-[15px]", gap: "gap-1.5" },
	md: { mark: "h-[30px]", wordmark: "h-[19px]", gap: "gap-2" },
	lg: { mark: "h-[37px]", wordmark: "h-[23px]", gap: "gap-2.5" },
	/** The admin sidebar (Figma): a tall mark beside a small wordmark. */
	console: { mark: "h-[50px]", wordmark: "h-[13px]", gap: "gap-3" },
	/** The order "Thank you!" page (Figma). */
	xl: { mark: "h-[70px] lg:h-20", wordmark: "h-[43px] lg:h-[50px]", gap: "gap-4 lg:gap-5" },
};

export type FysiLogoSize = keyof typeof SIZES;

/** The Fysi logo: bag mark and FYSI wordmark side by side. Wrap it in a link; give the link an accessible name. */
export function FysiLogo({ size = "md", className }: { size?: FysiLogoSize; className?: string }) {
	const s = SIZES[size];
	return (
		<span className={cn("inline-flex items-center", s.gap, className)}>
			<MaskedImage src={MARK_SRC} width={62} height={76} className={s.mark} />
			<MaskedImage src={WORDMARK_SRC} width={67} height={23} className={s.wordmark} />
		</span>
	);
}
