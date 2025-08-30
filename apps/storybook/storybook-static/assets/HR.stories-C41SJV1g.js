import {
	c as F,
	t as f,
	g as n,
	r as R,
	u as T,
	a as y,
} from "./create-theme-ol-6nsx3.js";
import { j as a, r as d } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const w = F({
		root: { base: "my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" },
		trimmed: {
			base: "mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700",
		},
		icon: {
			base: "inline-flex w-full items-center justify-center",
			hrLine: "my-8 h-1 w-64 rounded border-0 bg-gray-200 dark:bg-gray-700",
			icon: {
				base: "absolute left-1/2 -translate-x-1/2 bg-white px-4 dark:bg-gray-900",
				icon: "h-4 w-4 text-gray-700 dark:text-gray-300",
			},
		},
		text: {
			base: "inline-flex w-full items-center justify-center",
			hrLine: "my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700",
			text: "absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white",
		},
		square: {
			base: "mx-auto my-8 h-8 w-8 rounded border-0 bg-gray-200 md:my-12 dark:bg-gray-700",
		},
	}),
	H = d.forwardRef((e, c) => {
		var m, t, o;
		const r = T(),
			s = y(
				[
					w.root,
					(t = (m = r.theme) == null ? void 0 : m.hr) == null ? void 0 : t.root,
					e.theme,
				],
				[n(r.clearTheme, "hr.root"), e.clearTheme],
				[n(r.applyTheme, "hr.root"), e.applyTheme],
			),
			{ className: h, ...i } = R(e, (o = r.props) == null ? void 0 : o.hr);
		return a.jsx("hr", {
			ref: c,
			className: f(s.base, h),
			"data-testid": "flowbite-hr",
			role: "separator",
			...i,
		});
	});
H.displayName = "HR";
const Q = d.forwardRef((e, c) =>
	a.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 448 512",
		ref: c,
		...e,
		children: a.jsx("path", {
			stroke: "none",
			d: "M448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8h-64c-35.3 0-64-28.7-64-64v-64c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v136zm-256 0c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H64c-35.3 0-64-28.7-64-64v-64c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v136z",
		}),
	}),
);
Q.displayName = "QuoteRightIcon";
const B = d.forwardRef((e, c) => {
	var t, o, l;
	const r = T(),
		s = y(
			[
				w.icon,
				(o = (t = r.theme) == null ? void 0 : t.hr) == null ? void 0 : o.icon,
				e.theme,
			],
			[n(r.clearTheme, "hr.icon"), e.clearTheme],
			[n(r.applyTheme, "hr.icon"), e.applyTheme],
		),
		{
			icon: h = Q,
			className: i,
			...m
		} = R(e, (l = r.props) == null ? void 0 : l.hrIcon);
	return a.jsxs("div", {
		className: s.base,
		children: [
			a.jsx("hr", {
				ref: c,
				className: f(s.hrLine, i),
				"data-testid": "flowbite-hr-icon",
				role: "separator",
				...m,
			}),
			a.jsx("div", {
				className: s.icon.base,
				children: a.jsx(h, { "aria-hidden": !0, className: s.icon.icon }),
			}),
		],
	});
});
B.displayName = "HRIcon";
const O = d.forwardRef((e, c) => {
	var m, t, o;
	const r = T(),
		s = y(
			[
				w.square,
				(t = (m = r.theme) == null ? void 0 : m.hr) == null ? void 0 : t.square,
				e.theme,
			],
			[n(r.clearTheme, "hr.square"), e.clearTheme],
			[n(r.applyTheme, "hr.square"), e.applyTheme],
		),
		{ className: h, ...i } = R(e, (o = r.props) == null ? void 0 : o.hrSquare);
	return a.jsx("hr", {
		ref: c,
		className: f(s.base, h),
		"data-testid": "flowbite-hr-square",
		role: "separator",
		...i,
	});
});
O.displayName = "HRSquare";
const W = d.forwardRef((e, c) => {
	var t, o, l;
	const r = T(),
		s = y(
			[
				w.text,
				(o = (t = r.theme) == null ? void 0 : t.hr) == null ? void 0 : o.text,
				e.theme,
			],
			[n(r.clearTheme, "hr.text"), e.clearTheme],
			[n(r.applyTheme, "hr.text"), e.applyTheme],
		),
		{
			className: h,
			text: i,
			...m
		} = R(e, (l = r.props) == null ? void 0 : l.hrText);
	return a.jsxs("div", {
		className: s.base,
		children: [
			a.jsx("hr", {
				ref: c,
				className: f(s.hrLine, h),
				"data-testid": "flowbite-hr-text",
				role: "separator",
				...m,
			}),
			a.jsx("span", { className: s.text, children: i }),
		],
	});
});
W.displayName = "HRText";
const A = d.forwardRef((e, c) => {
	var m, t, o;
	const r = T(),
		s = y(
			[
				w.trimmed,
				(t = (m = r.theme) == null ? void 0 : m.hr) == null
					? void 0
					: t.trimmed,
				e.theme,
			],
			[n(r.clearTheme, "hr.trimmed"), e.clearTheme],
			[n(r.applyTheme, "hr.trimmed"), e.applyTheme],
		),
		{ className: h, ...i } = R(e, (o = r.props) == null ? void 0 : o.hrTrimmed);
	return a.jsx("hr", {
		ref: c,
		className: f(s.base, h),
		"data-testid": "flowbite-hr-trimmed",
		role: "separator",
		...i,
	});
});
A.displayName = "HRTrimmed";
const $ = { title: "Components/HR", component: H },
	G = (e) => a.jsx(H, { ...e }),
	p = G.bind({});
p.args = {};
const J = (e) => a.jsx(A, { ...e }),
	g = J.bind({});
g.args = {};
const K = (e) => a.jsx(B, { ...e }),
	u = K.bind({});
u.args = {};
const U = (e) => a.jsx(W, { ...e }),
	x = U.bind({});
x.args = { text: "or" };
const V = (e) => a.jsx(O, { ...e }),
	b = V.bind({});
b.args = {};
var j, N, v;
p.parameters = {
	...p.parameters,
	docs: {
		...((j = p.parameters) == null ? void 0 : j.docs),
		source: {
			originalSource: "args => <HR {...args} />",
			...((v = (N = p.parameters) == null ? void 0 : N.docs) == null
				? void 0
				: v.source),
		},
	},
};
var q, k, S;
g.parameters = {
	...g.parameters,
	docs: {
		...((q = g.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: "args => <HRTrimmed {...args} />",
			...((S = (k = g.parameters) == null ? void 0 : k.docs) == null
				? void 0
				: S.source),
		},
	},
};
var I, P, L;
u.parameters = {
	...u.parameters,
	docs: {
		...((I = u.parameters) == null ? void 0 : I.docs),
		source: {
			originalSource: "args => <HRIcon {...args} />",
			...((L = (P = u.parameters) == null ? void 0 : P.docs) == null
				? void 0
				: L.source),
		},
	},
};
var C, E, _;
x.parameters = {
	...x.parameters,
	docs: {
		...((C = x.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: "args => <HRText {...args} />",
			...((_ = (E = x.parameters) == null ? void 0 : E.docs) == null
				? void 0
				: _.source),
		},
	},
};
var z, D, M;
b.parameters = {
	...b.parameters,
	docs: {
		...((z = b.parameters) == null ? void 0 : z.docs),
		source: {
			originalSource: "args => <HRSquare {...args} />",
			...((M = (D = b.parameters) == null ? void 0 : D.docs) == null
				? void 0
				: M.source),
		},
	},
};
const ee = ["DefaultHR", "TrimmedHR", "IconHR", "TextHR", "SquareHR"];
export {
	p as DefaultHR,
	u as IconHR,
	b as SquareHR,
	x as TextHR,
	g as TrimmedHR,
	ee as __namedExportsOrder,
	$ as default,
};
