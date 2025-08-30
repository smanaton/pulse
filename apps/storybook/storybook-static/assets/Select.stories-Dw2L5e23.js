import {
	c as _,
	r as C,
	g,
	u as I,
	t as m,
	a as z,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as T } from "./iframe-ByD-PdrA.js";
import { e as F } from "./index-CTr8uqg5.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const E = _({
		base: "flex",
		addon:
			"inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400",
		field: {
			base: "relative w-full",
			icon: {
				base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
				svg: "h-5 w-5 text-gray-500 dark:text-gray-400",
			},
			select: {
				base: "block w-full appearance-none border bg-arrow-down-icon bg-[length:0.75em_0.75em] bg-[position:right_12px_center] bg-no-repeat pr-10 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
				withIcon: { on: "pl-10", off: "" },
				withAddon: { on: "rounded-r-lg", off: "rounded-lg" },
				withShadow: { on: "shadow-sm dark:shadow-sm-light", off: "" },
				sizes: {
					sm: "p-2 sm:text-xs",
					md: "p-2.5 text-sm",
					lg: "p-4 sm:text-base",
				},
				colors: {
					gray: "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500",
					info: "border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
					failure:
						"border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:focus:border-red-500 dark:focus:ring-red-500",
					warning:
						"border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:focus:border-yellow-500 dark:focus:ring-yellow-500",
					success:
						"border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:focus:border-green-500 dark:focus:ring-green-500",
				},
			},
		},
	}),
	c = T.forwardRef((o, w) => {
		var l, i;
		const d = I(),
			r = z(
				[E, (l = d.theme) == null ? void 0 : l.select, o.theme],
				[g(d.clearTheme, "select"), o.clearTheme],
				[g(d.applyTheme, "select"), o.applyTheme],
			),
			{
				addon: t,
				className: k,
				color: j = "gray",
				icon: n,
				shadow: S,
				sizing: v = "md",
				...N
			} = C(o, (i = d.props) == null ? void 0 : i.select);
		return e.jsxs("div", {
			className: m(r.base, k),
			children: [
				t && e.jsx("span", { className: r.addon, children: t }),
				e.jsxs("div", {
					className: r.field.base,
					children: [
						n &&
							e.jsx("div", {
								className: r.field.icon.base,
								children: e.jsx(n, { className: r.field.icon.svg }),
							}),
						e.jsx("select", {
							ref: w,
							className: m(
								r.field.select.base,
								r.field.select.colors[j],
								r.field.select.sizes[v],
								r.field.select.withIcon[n ? "on" : "off"],
								r.field.select.withAddon[t ? "on" : "off"],
								r.field.select.withShadow[S ? "on" : "off"],
							),
							...N,
						}),
					],
				}),
			],
		});
	});
c.displayName = "Select";
const U = { title: "Components/Select", component: c },
	x = (o) => e.jsx(c, { ...o }),
	s = x.bind({});
s.storyName = "Select";
s.args = {
	id: "countries",
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx("option", { children: "United States" }),
			e.jsx("option", { children: "Canada" }),
			e.jsx("option", { children: "France" }),
			e.jsx("option", { children: "Germany" }),
		],
	}),
};
const a = x.bind({});
a.args = {
	id: "countries",
	icon: F,
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx("option", { children: "United States" }),
			e.jsx("option", { children: "Canada" }),
			e.jsx("option", { children: "France" }),
			e.jsx("option", { children: "Germany" }),
		],
	}),
};
var f, b, p;
s.parameters = {
	...s.parameters,
	docs: {
		...((f = s.parameters) == null ? void 0 : f.docs),
		source: {
			originalSource: "args => <Select {...args} />",
			...((p = (b = s.parameters) == null ? void 0 : b.docs) == null
				? void 0
				: p.source),
		},
	},
};
var h, u, y;
a.parameters = {
	...a.parameters,
	docs: {
		...((h = a.parameters) == null ? void 0 : h.docs),
		source: {
			originalSource: "args => <Select {...args} />",
			...((y = (u = a.parameters) == null ? void 0 : u.docs) == null
				? void 0
				: y.source),
		},
	},
};
const W = ["DefaultSelect", "WithIcon"];
export {
	s as DefaultSelect,
	a as WithIcon,
	W as __namedExportsOrder,
	U as default,
};
