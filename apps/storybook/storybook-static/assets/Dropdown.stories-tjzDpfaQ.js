import { D as U } from "./Dropdown-C07Gup1O.js";
import { b as B, D as e, a as p } from "./DropdownItem-C7ZqAEgu.js";
import { j as r } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
import "./floating-ui.react-Dgys7JzL.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
import "./create-theme-ol-6nsx3.js";
import "./use-floating-DojRaj4Q.js";
import "./chevron-down-icon-CQF9w6vi.js";
import "./chevron-left-icon-RFu8Vxl9.js";
import "./chevron-right-icon-DzP0OM3K.js";
import "./Button-BrGC8bZN.js";
const { action: i } = __STORYBOOK_MODULE_ACTIONS__,
	$ = {
		title: "Components/Dropdown",
		component: U,
		args: {
			title: "Dropdown example",
			label: "Dropdown button",
			placement: "auto",
			disabled: !1,
		},
	},
	s = (R) => r.jsx(U, { ...R }),
	c = s.bind({});
c.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(e, { children: "Dashboard" }),
			r.jsx(e, { children: "Settings" }),
			r.jsx(e, { children: "Earnings" }),
			r.jsx(e, { children: "Sign out" }),
		],
	}),
};
const a = s.bind({});
a.storyName = "With divider";
a.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(e, { children: "Dashboard" }),
			r.jsx(e, { children: "Settings" }),
			r.jsx(e, { children: "Earnings" }),
			r.jsx(p, {}),
			r.jsx(e, { children: "Separated link" }),
		],
	}),
};
const n = s.bind({});
n.storyName = "With header";
n.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsxs(B, {
				children: [
					r.jsx("span", {
						className: "block text-sm",
						children: "Bonnie Green",
					}),
					r.jsx("span", {
						className: "block truncate font-medium text-sm",
						children: "name@flowbite.com",
					}),
				],
			}),
			r.jsx(e, { children: "Dashboard" }),
			r.jsx(e, { children: "Settings" }),
			r.jsx(e, { children: "Earnings" }),
			r.jsx(p, {}),
			r.jsx(e, { children: "Sign out" }),
		],
	}),
};
const o = s.bind({});
o.storyName = "With usable input header";
o.args = {
	enableTypeAhead: !1,
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(B, {
				children: r.jsx("input", {
					className: "text-black",
					onChange: i("onChange"),
				}),
			}),
			r.jsx(e, { children: "Dashboard" }),
			r.jsx(e, { children: "Settings" }),
			r.jsx(e, { children: "Earnings" }),
			r.jsx(e, { children: "Sign out" }),
		],
	}),
};
const d = s.bind({});
d.args = {
	inline: !0,
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(e, { children: "Dashboard" }),
			r.jsx(e, { children: "Settings" }),
			r.jsx(e, { children: "Earnings" }),
			r.jsx(e, { children: "Sign out" }),
		],
	}),
};
const l = s.bind({});
l.args = {
	renderTrigger: () => r.jsx("button", { children: "Custom button" }),
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(e, { children: "Dashboard" }),
			r.jsx(e, { children: "Settings" }),
			r.jsx(e, { children: "Earnings" }),
			r.jsx(e, { children: "Sign out" }),
		],
	}),
};
const m = s.bind({});
m.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(e, { children: "Default button" }),
			r.jsx(e, { as: "span", children: "As span" }),
			r.jsx(p, {}),
			r.jsx(e, {
				as: "a",
				href: "https://flowbite.com/",
				target: "_blank",
				children: "As link",
			}),
		],
	}),
};
const t = s.bind({});
t.storyName = "Item click handlers";
t.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsx(e, { onClick: i("Dashboard!"), children: "Dashboard" }),
			r.jsx(e, { onClick: i("Settings!"), children: "Settings" }),
			r.jsx(e, { onClick: i("Earnings!"), children: "Earnings" }),
			r.jsx(e, { onClick: i("Sign out!"), children: "Sign out" }),
		],
	}),
};
var h, g, x;
c.parameters = {
	...c.parameters,
	docs: {
		...((h = c.parameters) == null ? void 0 : h.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((x = (g = c.parameters) == null ? void 0 : g.docs) == null
				? void 0
				: x.source),
		},
	},
};
var u, j, b;
a.parameters = {
	...a.parameters,
	docs: {
		...((u = a.parameters) == null ? void 0 : u.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((b = (j = a.parameters) == null ? void 0 : j.docs) == null
				? void 0
				: b.source),
		},
	},
};
var D, S, w;
n.parameters = {
	...n.parameters,
	docs: {
		...((D = n.parameters) == null ? void 0 : D.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((w = (S = n.parameters) == null ? void 0 : S.docs) == null
				? void 0
				: w.source),
		},
	},
};
var C, f, k;
o.parameters = {
	...o.parameters,
	docs: {
		...((C = o.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((k = (f = o.parameters) == null ? void 0 : f.docs) == null
				? void 0
				: k.source),
		},
	},
};
var E, I, _;
d.parameters = {
	...d.parameters,
	docs: {
		...((E = d.parameters) == null ? void 0 : E.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((_ = (I = d.parameters) == null ? void 0 : I.docs) == null
				? void 0
				: _.source),
		},
	},
};
var W, F, N;
l.parameters = {
	...l.parameters,
	docs: {
		...((W = l.parameters) == null ? void 0 : W.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((N = (F = l.parameters) == null ? void 0 : F.docs) == null
				? void 0
				: N.source),
		},
	},
};
var H, T, O;
m.parameters = {
	...m.parameters,
	docs: {
		...((H = m.parameters) == null ? void 0 : H.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((O = (T = m.parameters) == null ? void 0 : T.docs) == null
				? void 0
				: O.source),
		},
	},
};
var y, v, A;
t.parameters = {
	...t.parameters,
	docs: {
		...((y = t.parameters) == null ? void 0 : y.docs),
		source: {
			originalSource: "args => <Dropdown {...args} />",
			...((A = (v = t.parameters) == null ? void 0 : v.docs) == null
				? void 0
				: A.source),
		},
	},
};
const rr = [
	"Default",
	"WithDivider",
	"WithHeader",
	"WithUsableInputHeader",
	"Inline",
	"CustomTrigger",
	"CustomItem",
	"ItemClickHandler",
];
export {
	m as CustomItem,
	l as CustomTrigger,
	c as Default,
	d as Inline,
	t as ItemClickHandler,
	a as WithDivider,
	n as WithHeader,
	o as WithUsableInputHeader,
	rr as __namedExportsOrder,
	$ as default,
};
