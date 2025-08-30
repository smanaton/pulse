import { d as L } from "./Button-BrGC8bZN.js";
import {
	g as o,
	a as T,
	t as v,
	u as w,
	r as y,
} from "./create-theme-ol-6nsx3.js";
import { u, d as x } from "./Dropdown-C07Gup1O.js";
import { a as k, h as M } from "./floating-ui.react-Dgys7JzL.js";
import { r as g, j as h } from "./iframe-ByD-PdrA.js";
const O = g.forwardRef((e, m) => {
	var r, n, s;
	const { theme: t, clearTheme: l, applyTheme: i } = u(),
		a = w(),
		d = T(
			[
				x.floating,
				(n = (r = a.theme) == null ? void 0 : r.dropdown) == null
					? void 0
					: n.floating,
				t == null ? void 0 : t.floating,
				e.theme,
			],
			[o(a.clearTheme, "dropdown.floating"), o(l, "floating"), e.clearTheme],
			[o(a.applyTheme, "dropdown.floating"), o(i, "floating"), e.applyTheme],
		),
		{ className: p, ...c } = y(
			e,
			(s = a.props) == null ? void 0 : s.dropdownDivider,
		);
	return h.jsx("div", { ref: m, className: v(d.divider, p), ...c });
});
O.displayName = "DropdownDivider";
const S = g.forwardRef((e, m) => {
	var r, n, s;
	const { theme: t, clearTheme: l, applyTheme: i } = u(),
		a = w(),
		d = T(
			[
				x.floating,
				(n = (r = a.theme) == null ? void 0 : r.dropdown) == null
					? void 0
					: n.floating,
				t == null ? void 0 : t.floating,
				e.theme,
			],
			[o(a.clearTheme, "dropdown.floating"), o(l, "floating"), e.clearTheme],
			[o(a.applyTheme, "dropdown.floating"), o(i, "floating"), e.applyTheme],
		),
		{ className: p, ...c } = y(
			e,
			(s = a.props) == null ? void 0 : s.dropdownHeader,
		);
	return h.jsx("div", { ref: m, className: v(d.header, p), ...c });
});
S.displayName = "DropdownHeader";
const q = g.forwardRef((e, m) => {
	var N, I, j, R, P;
	const {
			theme: t,
			clearTheme: l,
			applyTheme: i,
			activeIndex: a,
			dismissOnClick: d,
			getItemProps: p,
			handleSelect: c,
		} = u(),
		r = w(),
		n = T(
			[
				x.floating.item,
				(j =
					(I = (N = r.theme) == null ? void 0 : N.dropdown) == null
						? void 0
						: I.floating) == null
					? void 0
					: j.item,
				(R = t == null ? void 0 : t.floating) == null ? void 0 : R.item,
				e.theme,
			],
			[
				o(r.clearTheme, "dropdown.floating.item"),
				o(l, "floating.item"),
				e.clearTheme,
			],
			[
				o(r.applyTheme, "dropdown.floating.item"),
				o(i, "floating.item"),
				e.applyTheme,
			],
		),
		{
			children: s,
			className: C,
			icon: D,
			onClick: f,
			...b
		} = y(e, (P = r.props) == null ? void 0 : P.dropdownItem),
		{ ref: A, index: H } = M({ label: typeof s == "string" ? s : void 0 }),
		B = k([m, A]),
		E = a === H;
	return h.jsx("li", {
		role: "menuitem",
		className: n.container,
		children: h.jsxs(L, {
			ref: B,
			className: v(n.base, C),
			...b,
			...p({
				onClick: () => {
					f == null || f(), d && c(null);
				},
			}),
			tabIndex: E ? 0 : -1,
			children: [D && h.jsx(D, { className: n.icon }), s],
		}),
	});
});
q.displayName = "DropdownItem";
export { q as D, O as a, S as b };
