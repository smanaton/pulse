import {
	u as D,
	a as E,
	r as M,
	t as P,
	g as p,
	c as S,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as I } from "./iframe-ByD-PdrA.js";
import { b as O, a as v } from "./index-Dr3kFdZH.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const R = S({
		root: {
			base: "rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100",
			icon: "inline-block",
		},
	}),
	c = I.forwardRef((r, T) => {
		var i, l;
		const t = D(),
			n = E(
				[R, (i = t.theme) == null ? void 0 : i.kbd, r.theme],
				[p(t.clearTheme, "kbd"), r.clearTheme],
				[p(t.applyTheme, "kbd"), r.applyTheme],
			),
			{
				children: j,
				className: w,
				icon: m,
				...N
			} = M(r, (l = t.props) == null ? void 0 : l.hr);
		return e.jsxs("span", {
			ref: T,
			className: P(n.root.base, w),
			"data-testid": "flowbite-kbd",
			...N,
			children: [
				m &&
					e.jsx(m, {
						className: n.root.icon,
						"data-testid": "flowbite-kbd-icon",
					}),
				j,
			],
		});
	});
c.displayName = "Kbd";
const q = { title: "Components/Kbd", component: c },
	d = (r) => e.jsx(c, { ...r }),
	o = d.bind({});
o.args = { children: e.jsx(e.Fragment, { children: "Shift" }) };
const a = d.bind({});
a.storyName = "Only icon";
a.args = { icon: v };
const s = d.bind({});
s.storyName = "With icon";
s.args = { icon: O, children: e.jsx(e.Fragment, { children: "command" }) };
var b, g, h;
o.parameters = {
	...o.parameters,
	docs: {
		...((b = o.parameters) == null ? void 0 : b.docs),
		source: {
			originalSource: "args => <Kbd {...args} />",
			...((h = (g = o.parameters) == null ? void 0 : g.docs) == null
				? void 0
				: h.source),
		},
	},
};
var u, y, x;
a.parameters = {
	...a.parameters,
	docs: {
		...((u = a.parameters) == null ? void 0 : u.docs),
		source: {
			originalSource: "args => <Kbd {...args} />",
			...((x = (y = a.parameters) == null ? void 0 : y.docs) == null
				? void 0
				: x.source),
		},
	},
};
var f, k, K;
s.parameters = {
	...s.parameters,
	docs: {
		...((f = s.parameters) == null ? void 0 : f.docs),
		source: {
			originalSource: "args => <Kbd {...args} />",
			...((K = (k = s.parameters) == null ? void 0 : k.docs) == null
				? void 0
				: K.source),
		},
	},
};
const z = ["Default", "OnlyIcon", "WithIcon"];
export {
	o as Default,
	a as OnlyIcon,
	s as WithIcon,
	z as __namedExportsOrder,
	q as default,
};
