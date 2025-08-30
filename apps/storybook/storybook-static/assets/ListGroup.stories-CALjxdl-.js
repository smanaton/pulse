import {
	r as _,
	t as b,
	a as E,
	g as h,
	c as Q,
	u as R,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as H } from "./iframe-ByD-PdrA.js";
import { j as J, k as K, h as q, i as z } from "./index-CK8OVH7d.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const A = Q({
		root: {
			base: "list-none rounded-lg border border-gray-200 bg-white text-left text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
		},
		item: {
			base: "[&>*]:first:rounded-t-lg [&>*]:last:rounded-b-lg [&>*]:last:border-b-0",
			link: {
				base: "flex w-full items-center border-b border-gray-200 px-4 py-2 dark:border-gray-600",
				active: {
					off: "hover:bg-gray-100 hover:text-cyan-700 focus:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-gray-500",
					on: "bg-cyan-700 text-white dark:bg-gray-800",
				},
				disabled: {
					off: "",
					on: "cursor-not-allowed bg-gray-100 text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:text-gray-900",
				},
				href: { off: "", on: "" },
				icon: "mr-2 h-4 w-4 fill-current",
			},
		},
	}),
	y = H.forwardRef((s, g) => {
		var m, l, d;
		const t = R(),
			o = E(
				[
					A.root,
					(l = (m = t.theme) == null ? void 0 : m.listGroup) == null
						? void 0
						: l.root,
					s.theme,
				],
				[h(t.clearTheme, "listGroup.root"), s.clearTheme],
				[h(t.applyTheme, "listGroup.root"), s.applyTheme],
			),
			{ className: p, ...f } = _(
				s,
				(d = t.props) == null ? void 0 : d.listGroup,
			);
		return e.jsx("ul", { ref: g, className: b(o.base, p), ...f });
	});
y.displayName = "ListGroup";
const r = H.forwardRef((s, g) => {
	var k, G, v;
	const t = R(),
		o = E(
			[
				A.item,
				(G = (k = t.theme) == null ? void 0 : k.listGroup) == null
					? void 0
					: G.item,
				s.theme,
			],
			[h(t.clearTheme, "listGroup.item"), s.clearTheme],
			[h(t.applyTheme, "listGroup.item"), s.applyTheme],
		),
		{
			active: p,
			children: f,
			className: m,
			href: l,
			icon: d,
			onClick: B,
			disabled: j,
			...O
		} = _(s, (v = t.props) == null ? void 0 : v.listGroupItem),
		x = typeof l < "u",
		U = x ? "a" : "button";
	return e.jsx("li", {
		ref: g,
		className: b(o.base, m),
		children: e.jsxs(U, {
			href: l,
			onClick: B,
			type: x ? void 0 : "button",
			disabled: j,
			className: b(
				o.link.active[p ? "on" : "off"],
				o.link.disabled[j ? "on" : "off"],
				o.link.base,
				o.link.href[x ? "on" : "off"],
			),
			...O,
			children: [
				d &&
					e.jsx(d, {
						"aria-hidden": !0,
						"data-testid": "flowbite-list-group-item-icon",
						className: o.link.icon,
					}),
				f,
			],
		}),
	});
});
r.displayName = "ListGroupItem";
const ee = { title: "Components/ListGroup", component: y },
	u = (s) => e.jsx(y, { ...s }),
	a = u.bind({});
a.storyName = "Default";
a.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(r, { children: "Profile" }),
			e.jsx(r, { children: "Settings" }),
			e.jsx(r, { children: "Messages" }),
			e.jsx(r, { children: "Download" }),
		],
	}),
};
const i = u.bind({});
i.storyName = "With links";
i.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(r, { active: !0, href: "#", children: "Profile" }),
			e.jsx(r, { href: "#", children: "Settings" }),
			e.jsx(r, { href: "#", children: "Messages" }),
			e.jsx(r, { href: "#", children: "Download" }),
		],
	}),
};
const n = u.bind({});
n.storyName = "With buttons";
n.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(r, {
				active: !0,
				onClick: () => alert("Profile clicked!"),
				children: "Profile",
			}),
			e.jsx(r, { children: "Settings" }),
			e.jsx(r, { children: "Messages" }),
			e.jsx(r, { children: "Download" }),
		],
	}),
};
const c = u.bind({});
c.storyName = "With icons";
c.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(r, { active: !0, icon: q, children: "Profile" }),
			e.jsx(r, { icon: z, children: "Settings" }),
			e.jsx(r, { icon: J, children: "Messages" }),
			e.jsx(r, { icon: K, children: "Download" }),
		],
	}),
};
var w, L, T;
a.parameters = {
	...a.parameters,
	docs: {
		...((w = a.parameters) == null ? void 0 : w.docs),
		source: {
			originalSource: "args => <ListGroup {...args} />",
			...((T = (L = a.parameters) == null ? void 0 : L.docs) == null
				? void 0
				: T.source),
		},
	},
};
var N, P, W;
i.parameters = {
	...i.parameters,
	docs: {
		...((N = i.parameters) == null ? void 0 : N.docs),
		source: {
			originalSource: "args => <ListGroup {...args} />",
			...((W = (P = i.parameters) == null ? void 0 : P.docs) == null
				? void 0
				: W.source),
		},
	},
};
var D, S, I;
n.parameters = {
	...n.parameters,
	docs: {
		...((D = n.parameters) == null ? void 0 : D.docs),
		source: {
			originalSource: "args => <ListGroup {...args} />",
			...((I = (S = n.parameters) == null ? void 0 : S.docs) == null
				? void 0
				: I.source),
		},
	},
};
var C, M, F;
c.parameters = {
	...c.parameters,
	docs: {
		...((C = c.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: "args => <ListGroup {...args} />",
			...((F = (M = c.parameters) == null ? void 0 : M.docs) == null
				? void 0
				: F.source),
		},
	},
};
const re = ["DefaultListGroup", "WithLinks", "WithButtons", "WithIcons"];
export {
	a as DefaultListGroup,
	n as WithButtons,
	c as WithIcons,
	i as WithLinks,
	re as __namedExportsOrder,
	ee as default,
};
