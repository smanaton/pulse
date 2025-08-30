import {
	c as b,
	u as f,
	a as g,
	r as k,
	g as l,
	t as q,
} from "./create-theme-ol-6nsx3.js";
import { j as t, r as x } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const T = b({
		root: {
			base: "text-xl font-semibold italic text-gray-900 dark:text-white",
		},
	}),
	r = x.forwardRef((e, p) => {
		var a, c;
		const s = f(),
			u = g(
				[T, (a = s.theme) == null ? void 0 : a.blockquote, e.theme],
				[l(s.clearTheme, "blockquote"), e.clearTheme],
				[l(s.applyTheme, "blockquote"), e.applyTheme],
			),
			{ className: d, ...h } = k(
				e,
				(c = s.props) == null ? void 0 : c.blockquote,
			);
		return t.jsx("blockquote", {
			ref: p,
			className: q(u.root.base, d),
			"data-testid": "flowbite-blockquote",
			...h,
		});
	});
r.displayName = "Blockquote";
const v = { title: "Components/Blockquote", component: r },
	j = (e) => t.jsx(r, { ...e }),
	o = j.bind({});
o.args = {
	children: t.jsx(t.Fragment, {
		children: t.jsx("p", {
			children:
				'"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."',
		}),
	}),
};
var n, m, i;
o.parameters = {
	...o.parameters,
	docs: {
		...((n = o.parameters) == null ? void 0 : n.docs),
		source: {
			originalSource: "args => <Blockquote {...args} />",
			...((i = (m = o.parameters) == null ? void 0 : m.docs) == null
				? void 0
				: i.source),
		},
	},
};
const P = ["Default"];
export { o as Default, P as __namedExportsOrder, v as default };
