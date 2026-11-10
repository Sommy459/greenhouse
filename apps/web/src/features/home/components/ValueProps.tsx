import { FileBadge, Leaf, Package, Truck } from "lucide-react";

/** The four promises under the hero (PRD design notes: value props). */
const PROPS = [
	{ label: "Eco friendly products", icon: Leaf },
	{ label: "Eco packaging", icon: Package },
	{ label: "Fastest Delivery", icon: Truck },
	{ label: "Certified vendors & products", icon: FileBadge },
];

export function ValueProps() {
	return (
		<section className="shop-container animate-reveal mt-6 grid grid-cols-2 gap-4 lg:mt-3 lg:grid-cols-4">
			{PROPS.map(({ label, icon: Icon }, i) => (
				<div
					key={label}
					className="animate-rise flex h-[130px] flex-col items-center justify-center gap-4 rounded-sm bg-primary-50 px-3 text-center lg:h-[200px]"
					style={{ "--i": i } as React.CSSProperties}
				>
					<Icon className="size-9 text-primary-500 lg:size-12" strokeWidth={1.25} aria-hidden />
					<p className="text-[11px] font-medium text-primary-500 lg:text-sm lg:font-semibold">{label}</p>
				</div>
			))}
		</section>
	);
}
