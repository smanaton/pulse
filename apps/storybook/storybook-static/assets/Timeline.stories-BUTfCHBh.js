import {
	u as A,
	r as P,
	g as t,
	t as v,
	c as W,
	a as z,
} from "./create-theme-ol-6nsx3.js";
import { r as b, j as n } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const I = W({
		root: {
			direction: {
				horizontal: "sm:flex",
				vertical: "relative border-l border-gray-200 dark:border-gray-700",
			},
		},
		item: {
			root: { horizontal: "relative mb-6 sm:mb-0", vertical: "mb-10 ml-6" },
			content: {
				root: { base: "", horizontal: "mt-3 sm:pr-8", vertical: "" },
				body: {
					base: "mb-4 text-base font-normal text-gray-500 dark:text-gray-400",
				},
				time: {
					base: "mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500",
				},
				title: { base: "text-lg font-semibold text-gray-900 dark:text-white" },
			},
			point: {
				horizontal: "flex items-center",
				line: "hidden h-0.5 w-full bg-gray-200 sm:flex dark:bg-gray-700",
				marker: {
					base: {
						horizontal:
							"absolute -left-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700",
						vertical:
							"absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700",
					},
					icon: {
						base: "h-3 w-3 text-primary-600 dark:text-primary-300",
						wrapper:
							"absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-200 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-900",
					},
				},
				vertical: "",
			},
		},
	}),
	L = b.createContext(void 0);
function R() {
	const e = b.useContext(L);
	if (!e)
		throw new Error(
			"useTimelineContext should be used within the TimelineContext provider!",
		);
	return e;
}
const G = b.forwardRef((e, T) => {
	var s, a;
	const i = A(),
		h = z(
			[I, (s = i.theme) == null ? void 0 : s.timeline, e.theme],
			[t(i.clearTheme, "timeline"), e.clearTheme],
			[t(i.applyTheme, "timeline"), e.applyTheme],
		),
		{
			className: y,
			horizontal: m,
			...o
		} = P(e, (a = i.props) == null ? void 0 : a.timeline);
	return n.jsx(L.Provider, {
		value: {
			theme: e.theme,
			clearTheme: e.clearTheme,
			applyTheme: e.applyTheme,
			horizontal: m,
		},
		children: n.jsx("ol", {
			ref: T,
			"data-testid": "timeline-component",
			className: v(
				m && h.root.direction.horizontal,
				!m && h.root.direction.vertical,
				y,
			),
			...o,
		}),
	});
});
G.displayName = "Timeline";
const Q = b.createContext(void 0);
function O() {
	const e = b.useContext(Q);
	if (!e)
		throw new Error(
			"useTimelineContentContext should be used within the TimelineContentContext provider!",
		);
	return e;
}
const V = b.createContext(void 0);
function S() {
	const e = b.useContext(V);
	if (!e)
		throw new Error(
			"useTimelineItemContext should be used within the TimelineItemContext provider!",
		);
	return e;
}
const F = b.forwardRef((e, T) => {
	var x, d, p, C, f, w, N, k;
	const { theme: i, clearTheme: h, applyTheme: y } = R(),
		{ theme: m, clearTheme: o, applyTheme: s } = S(),
		{ theme: a, clearTheme: c, applyTheme: l } = O(),
		r = A(),
		u = z(
			[
				I.item.content.body,
				(C =
					(p =
						(d = (x = r.theme) == null ? void 0 : x.timeline) == null
							? void 0
							: d.item) == null
						? void 0
						: p.content) == null
					? void 0
					: C.body,
				(w = (f = i == null ? void 0 : i.item) == null ? void 0 : f.content) ==
				null
					? void 0
					: w.body,
				(N = m == null ? void 0 : m.content) == null ? void 0 : N.body,
				a == null ? void 0 : a.body,
				e.theme,
			],
			[
				t(r.clearTheme, "timeline.item.content.body"),
				t(h, "item.content.body"),
				t(o, "content.body"),
				t(c, "body"),
				e.clearTheme,
			],
			[
				t(r.applyTheme, "timeline.item.content.body"),
				t(y, "item.content.body"),
				t(s, "content.body"),
				t(l, "body"),
				e.applyTheme,
			],
		),
		{ className: g, ...j } = P(
			e,
			(k = r.props) == null ? void 0 : k.timelineBody,
		);
	return n.jsx("div", { ref: T, className: v(u.base, g), ...j });
});
F.displayName = "TimelineBody";
const M = b.forwardRef((e, T) => {
	var g, j, x, d, p;
	const { theme: i, clearTheme: h, applyTheme: y, horizontal: m } = R(),
		{ theme: o, clearTheme: s, applyTheme: a } = S(),
		c = A(),
		l = z(
			[
				I.item.content,
				(x =
					(j = (g = c.theme) == null ? void 0 : g.timeline) == null
						? void 0
						: j.item) == null
					? void 0
					: x.content,
				(d = i == null ? void 0 : i.item) == null ? void 0 : d.content,
				o == null ? void 0 : o.content,
				e.theme,
			],
			[
				t(c.clearTheme, "timeline.item.content"),
				t(h, "item.content"),
				t(s, "content"),
				e.clearTheme,
			],
			[
				t(c.applyTheme, "timeline.item.content"),
				t(y, "item.content"),
				t(a, "content"),
				e.applyTheme,
			],
		),
		{ className: r, ...u } = P(
			e,
			(p = c.props) == null ? void 0 : p.timelineContent,
		);
	return n.jsx(Q.Provider, {
		value: {
			theme: e.theme,
			clearTheme: e.clearTheme,
			applyTheme: e.applyTheme,
		},
		children: n.jsx("div", {
			ref: T,
			"data-testid": "timeline-content",
			className: v(l.root.base, m ? l.root.horizontal : l.root.vertical, r),
			...u,
		}),
	});
});
M.displayName = "TimelineContent";
const B = b.forwardRef((e, T) => {
	var l, r, u;
	const { theme: i, clearTheme: h, applyTheme: y, horizontal: m } = R(),
		o = A(),
		s = z(
			[
				I.item,
				(r = (l = o.theme) == null ? void 0 : l.timeline) == null
					? void 0
					: r.item,
				i == null ? void 0 : i.item,
				e.theme,
			],
			[t(o.clearTheme, "timeline.item"), t(h, "item"), e.clearTheme],
			[t(o.applyTheme, "timeline.item"), t(y, "item"), e.applyTheme],
		),
		{ className: a, ...c } = P(
			e,
			(u = o.props) == null ? void 0 : u.timelineItem,
		);
	return n.jsx(V.Provider, {
		value: {
			theme: e.theme,
			clearTheme: e.clearTheme,
			applyTheme: e.applyTheme,
		},
		children: n.jsx("li", {
			ref: T,
			"data-testid": "timeline-item",
			className: v(m && s.root.horizontal, !m && s.root.vertical, a),
			...c,
		}),
	});
});
B.displayName = "TimelineItem";
const U = b.forwardRef((e, T) => {
	var x, d, p, C, f;
	const { theme: i, clearTheme: h, applyTheme: y, horizontal: m } = R(),
		{ theme: o, clearTheme: s, applyTheme: a } = S(),
		c = A(),
		l = z(
			[
				I.item.point,
				(p =
					(d = (x = c.theme) == null ? void 0 : x.timeline) == null
						? void 0
						: d.item) == null
					? void 0
					: p.point,
				(C = i == null ? void 0 : i.item) == null ? void 0 : C.point,
				o == null ? void 0 : o.point,
				e.theme,
			],
			[
				t(c.clearTheme, "timeline.item.point"),
				t(h, "item.point"),
				t(s, "point"),
				e.clearTheme,
			],
			[
				t(c.applyTheme, "timeline.item.point"),
				t(y, "item.point"),
				t(a, "point"),
				e.applyTheme,
			],
		),
		{
			children: r,
			className: u,
			icon: g,
			...j
		} = P(e, (f = c.props) == null ? void 0 : f.timelinePoint);
	return n.jsxs("div", {
		ref: T,
		"data-testid": "timeline-point",
		className: v(m && l.horizontal, !m && l.vertical, u),
		...j,
		children: [
			r,
			g
				? n.jsx("span", {
						className: v(l.marker.icon.wrapper),
						children: n.jsx(g, {
							"aria-hidden": !0,
							className: v(l.marker.icon.base),
						}),
					})
				: n.jsx("div", {
						className: v(
							m && l.marker.base.horizontal,
							!m && l.marker.base.vertical,
						),
					}),
			m && n.jsx("div", { className: v(l.line) }),
		],
	});
});
U.displayName = "TimelinePoint";
const _ = b.forwardRef((e, T) => {
	var x, d, p, C, f, w, N, k;
	const { theme: i, clearTheme: h, applyTheme: y } = R(),
		{ theme: m, clearTheme: o, applyTheme: s } = S(),
		{ theme: a, clearTheme: c, applyTheme: l } = O(),
		r = A(),
		u = z(
			[
				I.item.content.time,
				(C =
					(p =
						(d = (x = r.theme) == null ? void 0 : x.timeline) == null
							? void 0
							: d.item) == null
						? void 0
						: p.content) == null
					? void 0
					: C.time,
				(w = (f = i == null ? void 0 : i.item) == null ? void 0 : f.content) ==
				null
					? void 0
					: w.time,
				(N = m == null ? void 0 : m.content) == null ? void 0 : N.time,
				a == null ? void 0 : a.time,
				e.theme,
			],
			[
				t(r.clearTheme, "timeline.item.content.time"),
				t(h, "item.content.time"),
				t(o, "content.time"),
				t(c, "time"),
				e.clearTheme,
			],
			[
				t(r.applyTheme, "timeline.item.content.time"),
				t(y, "item.content.time"),
				t(s, "content.time"),
				t(l, "time"),
				e.applyTheme,
			],
		),
		{ className: g, ...j } = P(
			e,
			(k = r.props) == null ? void 0 : k.timelineTime,
		);
	return n.jsx("time", { ref: T, className: v(u.base, g), ...j });
});
_.displayName = "TimelineTime";
const D = b.forwardRef((e, T) => {
	var d, p, C, f, w, N, k, q;
	const { theme: i, clearTheme: h, applyTheme: y } = R(),
		{ theme: m, clearTheme: o, applyTheme: s } = S(),
		{ theme: a, clearTheme: c, applyTheme: l } = O(),
		r = A(),
		u = z(
			[
				I.item.content.title,
				(f =
					(C =
						(p = (d = r.theme) == null ? void 0 : d.timeline) == null
							? void 0
							: p.item) == null
						? void 0
						: C.content) == null
					? void 0
					: f.title,
				(N = (w = i == null ? void 0 : i.item) == null ? void 0 : w.content) ==
				null
					? void 0
					: N.title,
				(k = m == null ? void 0 : m.content) == null ? void 0 : k.title,
				a == null ? void 0 : a.title,
				e.theme,
			],
			[
				t(r.clearTheme, "timeline.item.content.title"),
				t(h, "item.content.title"),
				t(o, "content.title"),
				t(c, "title"),
				e.clearTheme,
			],
			[
				t(r.applyTheme, "timeline.item.content.title"),
				t(y, "item.content.title"),
				t(s, "content.title"),
				t(l, "title"),
				e.applyTheme,
			],
		),
		{
			as: g = "h3",
			className: j,
			...x
		} = P(e, (q = r.props) == null ? void 0 : q.timelineTitle);
	return n.jsx(g, { ref: T, className: v(u.base, j), ...x });
});
D.displayName = "TimelineTitle";
const ee = { title: "Components/Timeline", component: G },
	X = (e) => n.jsx(G, { ...e }),
	E = X.bind({});
E.args = {
	children: n.jsxs(n.Fragment, {
		children: [
			n.jsxs(B, {
				children: [
					n.jsx(U, {}),
					n.jsxs(M, {
						children: [
							n.jsx(_, { children: "February 2022" }),
							n.jsx(D, { children: "Application UI code in Tailwind CSS" }),
							n.jsx(F, {
								children:
									"Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.",
							}),
						],
					}),
				],
			}),
			n.jsxs(B, {
				children: [
					n.jsx(U, {}),
					n.jsxs(M, {
						children: [
							n.jsx(_, { children: "March 2022" }),
							n.jsx(D, { children: "Marketing UI design in Figma" }),
							n.jsx(F, {
								children:
									"All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.",
							}),
						],
					}),
				],
			}),
			n.jsxs(B, {
				children: [
					n.jsx(U, {}),
					n.jsxs(M, {
						children: [
							n.jsx(_, { children: "April 2022" }),
							n.jsx(D, { children: "E-Commerce UI code in Tailwind CSS" }),
							n.jsx(F, {
								children:
									"Get started with dozens of web components and interactive elements built on top of Tailwind CSS.",
							}),
						],
					}),
				],
			}),
		],
	}),
};
var H, J, K;
E.parameters = {
	...E.parameters,
	docs: {
		...((H = E.parameters) == null ? void 0 : H.docs),
		source: {
			originalSource: "args => <Timeline {...args} />",
			...((K = (J = E.parameters) == null ? void 0 : J.docs) == null
				? void 0
				: K.source),
		},
	},
};
const te = ["Default"];
export { E as Default, te as __namedExportsOrder, ee as default };
