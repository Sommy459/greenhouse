import { z } from "zod";

/** Figma upload boxes: SVG, PNG, JPG or GIF, at most 800×400px. The byte cap keeps a stray huge file out. */
export const IMAGE_ACCEPT = "image/svg+xml,image/png,image/jpeg,image/gif";
export const IMAGE_MAX = { width: 800, height: 400, bytes: 2 * 1024 * 1024 };

const image = z
	.instanceof(File, { message: "Upload an image." })
	.refine((file) => IMAGE_ACCEPT.split(",").includes(file.type), "Use an SVG, PNG, JPG or GIF.")
	.refine((file) => file.size <= IMAGE_MAX.bytes, "Keep each image under 2MB.");

export const categorySchema = z.object({
	name: z.string().trim().min(2, "Give the category a name.").max(40, "Keep the name under 40 characters."),
	description: z.string().trim().max(300, "Keep the description under 300 characters."),
	thumbnail: image.nullable(),
});

export type CategoryValues = z.infer<typeof categorySchema>;

/** Figma "Upload Product Images": six slots; the first filled one is the main photo. */
export const PRODUCT_IMAGE_SLOTS = 6;

const optionalText = (max: number, label: string) => z.string().trim().max(max, `Keep ${label} under ${max} characters.`);
const wholeNaira = /^\d+$/;

/** Inputs stay strings while typing; `toProductBody` turns them into numbers. Prices are whole naira. */
export const productSchema = z
	.object({
		name: z.string().trim().min(2, "Enter the product's name.").max(120, "Keep the name under 120 characters."),
		category: z.string().min(1, "Choose a category."),
		brand: optionalText(60, "the brand"),
		colour: z.string(),
		weight: z
			.string()
			.trim()
			.refine((v) => v === "" || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) > 0), "Enter the weight in kg, e.g. 0.5."),
		description: z
			.string()
			.trim()
			.min(20, "Describe the product in at least 20 characters.")
			.max(2000, "Keep the description under 2,000 characters."),
		images: z.array(image.nullable()).refine((slots) => slots.some(Boolean), "Add at least one product photo."),
		variants: z
			.array(
				z.object({
					variation: optionalText(40, "the variation"),
					sku: optionalText(40, "the SKU"),
					barcode: z
						.string()
						.trim()
						.refine((v) => v === "" || /^\d{8,14}$/.test(v), "A barcode is 8 to 14 digits."),
					quantity: z.string().trim().regex(/^\d+$/, "Enter how many are in stock."),
				}),
			)
			.min(1),
		certifications: optionalText(200, "certifications"),
		model: optionalText(60, "the model"),
		material: optionalText(80, "the material"),
		size: z
			.string()
			.trim()
			.refine(
				(v) => v === "" || /^\d+(\.\d+)?\s*[x×]\s*\d+(\.\d+)?\s*[x×]\s*\d+(\.\d+)?$/i.test(v),
				"Use L × W × H in cm, e.g. 30 × 20 × 10.",
			),
		warranty_duration: z.string(),
		warranty_type: optionalText(80, "the warranty type"),
		product_line: optionalText(80, "the product line"),
		notes: optionalText(500, "the notes"),
		base_price: z
			.string()
			.trim()
			.regex(wholeNaira, "Enter the price in whole naira.")
			.refine((v) => Number(v) > 0, "The price must be above ₦0."),
		sale_price: z
			.string()
			.trim()
			.refine((v) => v === "" || wholeNaira.test(v), "Enter the sale price in whole naira."),
		sale_start: z.string(),
		sale_end: z.string(),
	})
	.superRefine((v, ctx) => {
		if (v.sale_price && wholeNaira.test(v.base_price) && Number(v.sale_price) >= Number(v.base_price)) {
			ctx.addIssue({ code: "custom", path: ["sale_price"], message: "The sale price must be below the base price." });
		}
		if (!v.sale_price && (v.sale_start || v.sale_end)) {
			ctx.addIssue({ code: "custom", path: ["sale_price"], message: "Add a sale price for these dates, or clear the dates." });
		}
		if (v.sale_start && v.sale_end && v.sale_end < v.sale_start) {
			ctx.addIssue({ code: "custom", path: ["sale_end"], message: "The sale can't end before it starts." });
		}
		// With more than one variant, each needs a name so customers can tell them apart.
		if (v.variants.length > 1) {
			v.variants.forEach((variant, i) => {
				if (!variant.variation)
					ctx.addIssue({ code: "custom", path: ["variants", i, "variation"], message: "Name this variation, e.g. Large." });
			});
		}
		const skus = v.variants.map((variant) => variant.sku.toLowerCase()).filter(Boolean);
		skus.forEach((sku, i) => {
			if (skus.indexOf(sku) !== i)
				ctx.addIssue({ code: "custom", path: ["variants", i, "sku"], message: "Each variation needs its own SKU." });
		});
	});

export type ProductValues = z.infer<typeof productSchema>;

export const emptyVariant = { variation: "", sku: "", barcode: "", quantity: "" };

export const emptyProduct: ProductValues = {
	name: "",
	category: "",
	brand: "",
	colour: "",
	weight: "",
	description: "",
	images: Array.from({ length: PRODUCT_IMAGE_SLOTS }, () => null),
	variants: [emptyVariant],
	certifications: "",
	model: "",
	material: "",
	size: "",
	warranty_duration: "",
	warranty_type: "",
	product_line: "",
	notes: "",
	base_price: "",
	sale_price: "",
	sale_start: "",
	sale_end: "",
};

/**
 * The multipart body for POST /admin/products: plain fields, one `images` part per photo (in slot order), and the
 * variants and specification as JSON.
 */
export function toProductBody(v: ProductValues) {
	const body = new FormData();
	const put = (key: string, value: string) => value && body.append(key, value);
	put("name", v.name);
	put("category_id", v.category);
	put("brand", v.brand);
	put("colour", v.colour);
	put("weight_kg", v.weight);
	put("description", v.description);
	for (const file of v.images) if (file) body.append("images", file);
	body.append(
		"variants",
		JSON.stringify(
			v.variants.map((variant) => ({
				name: variant.variation || null,
				sku: variant.sku || null,
				barcode: variant.barcode || null,
				quantity: Number(variant.quantity),
			})),
		),
	);
	body.append(
		"specification",
		JSON.stringify({
			certifications: v.certifications || null,
			model: v.model || null,
			material: v.material || null,
			size_cm: v.size || null,
			warranty_months: v.warranty_duration ? Number(v.warranty_duration) : null,
			warranty_type: v.warranty_type || null,
			product_line: v.product_line || null,
			notes: v.notes || null,
		}),
	);
	put("price", v.base_price);
	put("sale_price", v.sale_price);
	put("sale_starts_at", v.sale_start);
	put("sale_ends_at", v.sale_end);
	return body;
}
