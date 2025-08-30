import {
	t as c,
	r as I,
	a as k,
	g as l,
	u as w,
	c as x,
} from "./create-theme-ol-6nsx3.js";
import { r as m, j as r } from "./iframe-ByD-PdrA.js";
const v = x({
		base: "flex",
		addon:
			"inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400",
		field: {
			base: "relative w-full",
			icon: {
				base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
				svg: "h-5 w-5 text-gray-500 dark:text-gray-400",
			},
			rightIcon: {
				base: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
				svg: "h-5 w-5 text-gray-500 dark:text-gray-400",
			},
			input: {
				base: "block w-full border focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
				sizes: {
					sm: "p-2 sm:text-xs",
					md: "p-2.5 text-sm",
					lg: "p-4 sm:text-base",
				},
				colors: {
					gray: "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500",
					info: "border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
					failure:
						"border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:focus:border-red-500 dark:focus:ring-red-500",
					warning:
						"border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:focus:border-yellow-500 dark:focus:ring-yellow-500",
					success:
						"border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:focus:border-green-500 dark:focus:ring-green-500",
				},
				withRightIcon: { on: "pr-10", off: "" },
				withIcon: { on: "pl-10", off: "" },
				withAddon: { on: "rounded-r-lg", off: "rounded-lg" },
				withShadow: { on: "shadow-sm dark:shadow-sm-light", off: "" },
			},
		},
	}),
	T = m.forwardRef((o, g) => {
		var n, i;
		const a = w(),
			e = k(
				[v, (n = a.theme) == null ? void 0 : n.textInput, o.theme],
				[l(a.clearTheme, "textInput"), o.clearTheme],
				[l(a.applyTheme, "textInput"), o.applyTheme],
			),
			{
				addon: d,
				className: f,
				color: u = "gray",
				icon: t,
				rightIcon: s,
				shadow: b,
				sizing: y = "md",
				type: h = "text",
				...p
			} = I(o, (i = a.props) == null ? void 0 : i.textInput);
		return r.jsxs("div", {
			className: c(e.base, f),
			children: [
				d && r.jsx("span", { className: e.addon, children: d }),
				r.jsxs("div", {
					className: e.field.base,
					children: [
						t &&
							r.jsx("div", {
								className: e.field.icon.base,
								children: r.jsx(t, { className: e.field.icon.svg }),
							}),
						s &&
							r.jsx("div", {
								"data-testid": "right-icon",
								className: e.field.rightIcon.base,
								children: r.jsx(s, { className: e.field.rightIcon.svg }),
							}),
						r.jsx("input", {
							className: c(
								e.field.input.base,
								e.field.input.colors[u],
								e.field.input.sizes[y],
								e.field.input.withIcon[t ? "on" : "off"],
								e.field.input.withRightIcon[s ? "on" : "off"],
								e.field.input.withAddon[d ? "on" : "off"],
								e.field.input.withShadow[b ? "on" : "off"],
							),
							type: h,
							...p,
							ref: g,
						}),
					],
				}),
			],
		});
	});
T.displayName = "TextInput";
export { T };
