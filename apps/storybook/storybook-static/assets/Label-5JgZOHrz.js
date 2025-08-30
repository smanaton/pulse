import {
	a as f,
	u as h,
	g as l,
	c as n,
	r as p,
	t as u,
} from "./create-theme-ol-6nsx3.js";
import { j as b, r as x } from "./iframe-ByD-PdrA.js";
const y = n({
		root: {
			base: "text-sm font-medium",
			disabled: "opacity-50",
			colors: {
				default: "text-gray-900 dark:text-white",
				info: "text-cyan-500 dark:text-cyan-600",
				failure: "text-red-700 dark:text-red-500",
				warning: "text-yellow-500 dark:text-yellow-600",
				success: "text-green-700 dark:text-green-500",
			},
		},
	}),
	T = x.forwardRef((e, o) => {
		var r, s;
		const t = h(),
			a = f(
				[y, (r = t.theme) == null ? void 0 : r.label, e.theme],
				[l(t.clearTheme, "label"), e.clearTheme],
				[l(t.applyTheme, "label"), e.applyTheme],
			),
			{
				className: d,
				color: m = "default",
				disabled: c = !1,
				...i
			} = p(e, (s = t.props) == null ? void 0 : s.label);
		return b.jsx("label", {
			ref: o,
			className: u(a.root.base, a.root.colors[m], c && a.root.disabled, d),
			"data-testid": "flowbite-label",
			...i,
		});
	});
T.displayName = "Label";
export { T as L };
