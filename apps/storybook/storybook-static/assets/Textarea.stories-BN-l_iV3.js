import {
	g as c,
	c as h,
	a as k,
	t as T,
	r as w,
	u as x,
} from "./create-theme-ol-6nsx3.js";
import { r as p, j as u } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const j = h({
		base: "block w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
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
		withShadow: { on: "shadow-sm dark:shadow-sm-light", off: "" },
	}),
	s = p.forwardRef((e, i) => {
		var t, d;
		const a = x(),
			o = k(
				[j, (t = a.theme) == null ? void 0 : t.textarea, e.theme],
				[c(a.clearTheme, "textarea"), e.clearTheme],
				[c(a.applyTheme, "textarea"), e.applyTheme],
			),
			{
				className: y,
				color: b = "gray",
				shadow: f,
				...m
			} = w(e, (d = a.props) == null ? void 0 : d.textarea);
		return u.jsx("textarea", {
			ref: i,
			className: T(o.base, o.colors[b], o.withShadow[f ? "on" : "off"], y),
			...m,
		});
	});
s.displayName = "Textarea";
const R = { title: "Components/Textarea", component: s },
	v = (e) => u.jsx(s, { ...e }),
	r = v.bind({});
r.storyName = "Textarea";
r.args = { defaultValue: "Text", placeholder: "Write your thoughts here..." };
var l, n, g;
r.parameters = {
	...r.parameters,
	docs: {
		...((l = r.parameters) == null ? void 0 : l.docs),
		source: {
			originalSource: "args => <Textarea {...args} />",
			...((g = (n = r.parameters) == null ? void 0 : n.docs) == null
				? void 0
				: g.source),
		},
	},
};
const S = ["DefaultTextarea"];
export { r as DefaultTextarea, S as __namedExportsOrder, R as default };
