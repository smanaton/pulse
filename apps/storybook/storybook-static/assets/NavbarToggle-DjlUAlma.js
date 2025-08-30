import {
	c as I,
	g as r,
	r as T,
	a as u,
	t as x,
	u as y,
} from "./create-theme-ol-6nsx3.js";
import { r as f, j as s } from "./iframe-ByD-PdrA.js";
const O = f.createContext(void 0);
function w() {
	const e = f.useContext(O);
	if (!e)
		throw new Error(
			"useNavBarContext should be used within the NavbarContext provider!",
		);
	return e;
}
const N = I({
		root: {
			base: "bg-white px-2 py-2.5 sm:px-4 dark:border-gray-700 dark:bg-gray-800",
			rounded: { on: "rounded", off: "" },
			bordered: { on: "border", off: "" },
			inner: {
				base: "mx-auto flex flex-wrap items-center justify-between",
				fluid: { on: "", off: "container" },
			},
		},
		brand: { base: "flex items-center" },
		collapse: {
			base: "w-full md:block md:w-auto",
			list: "mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-8 md:text-sm md:font-medium",
			hidden: { on: "hidden", off: "" },
		},
		link: {
			base: "block py-2 pl-3 pr-4 md:p-0",
			active: {
				on: "bg-primary-700 text-white md:bg-transparent md:text-primary-700 dark:text-white",
				off: "border-b border-gray-100 text-gray-700 hover:bg-gray-50 md:border-0 md:hover:bg-transparent md:hover:text-primary-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-white",
			},
			disabled: {
				on: "text-gray-400 hover:cursor-not-allowed dark:text-gray-600",
				off: "",
			},
		},
		toggle: {
			base: "inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600",
			icon: "h-6 w-6 shrink-0",
			title: "sr-only",
		},
	}),
	A = f.forwardRef((e, m) => {
		var c, g;
		const a = y(),
			n = u(
				[N, (c = a.theme) == null ? void 0 : c.navbar, e.theme],
				[r(a.clearTheme, "navbar"), e.clearTheme],
				[r(a.applyTheme, "navbar"), e.applyTheme],
			),
			{
				border: p,
				children: l,
				className: o,
				fluid: t = !1,
				menuOpen: d,
				rounded: v,
				...i
			} = T(e, (g = a.props) == null ? void 0 : g.navbar),
			[h, b] = f.useState(d);
		return s.jsx(O.Provider, {
			value: {
				theme: e.theme,
				clearTheme: e.clearTheme,
				applyTheme: e.applyTheme,
				isOpen: h,
				setIsOpen: b,
			},
			children: s.jsx("nav", {
				ref: m,
				className: x(
					n.root.base,
					n.root.bordered[p ? "on" : "off"],
					n.root.rounded[v ? "on" : "off"],
					o,
				),
				...i,
				children: s.jsx("div", {
					className: x(n.root.inner.base, n.root.inner.fluid[t ? "on" : "off"]),
					children: l,
				}),
			}),
		});
	});
A.displayName = "Navbar";
const z = f.forwardRef((e, m) => {
	var i, h, b;
	const { theme: a, clearTheme: n, applyTheme: p } = w(),
		l = y(),
		o = u(
			[
				N.brand,
				(h = (i = l.theme) == null ? void 0 : i.navbar) == null
					? void 0
					: h.brand,
				a == null ? void 0 : a.brand,
				e.theme,
			],
			[r(l.clearTheme, "navbar.brand"), r(n, "brand"), e.clearTheme],
			[r(l.applyTheme, "navbar.brand"), r(p, "brand"), e.applyTheme],
		),
		{
			as: t = "a",
			className: d,
			...v
		} = T(e, (b = l.props) == null ? void 0 : b.navbarBrand);
	return s.jsx(t, { ref: m, className: x(o.base, d), ...v });
});
z.displayName = "NavbarBrand";
const E = f.forwardRef((e, m) => {
	var h, b, c;
	const { theme: a, clearTheme: n, applyTheme: p, isOpen: l } = w(),
		o = y(),
		t = u(
			[
				N.collapse,
				(b = (h = o.theme) == null ? void 0 : h.navbar) == null
					? void 0
					: b.collapse,
				a == null ? void 0 : a.collapse,
				e.theme,
			],
			[r(o.clearTheme, "navbar.collapse"), r(n, "collapse"), e.clearTheme],
			[r(o.applyTheme, "navbar.collapse"), r(p, "collapse"), e.applyTheme],
		),
		{
			children: d,
			className: v,
			...i
		} = T(e, (c = o.props) == null ? void 0 : c.navbarCollapse);
	return s.jsx("div", {
		ref: m,
		"data-testid": "flowbite-navbar-collapse",
		className: x(t.base, t.hidden[l ? "off" : "on"], v),
		...i,
		children: s.jsx("ul", { className: t.list, children: d }),
	});
});
E.displayName = "NavbarCollapse";
const H = f.forwardRef((e, m) => {
	var C, j, B;
	const { theme: a, clearTheme: n, applyTheme: p, setIsOpen: l } = w(),
		o = y(),
		t = u(
			[
				N.link,
				(j = (C = o.theme) == null ? void 0 : C.navbar) == null
					? void 0
					: j.link,
				a == null ? void 0 : a.link,
				e.theme,
			],
			[r(o.clearTheme, "navbar.link"), r(n, "link"), e.clearTheme],
			[r(o.applyTheme, "navbar.link"), r(p, "link"), e.applyTheme],
		),
		{
			active: d,
			as: v = "a",
			disabled: i,
			children: h,
			className: b,
			onClick: c,
			...g
		} = T(e, (B = o.props) == null ? void 0 : B.navbarLink);
	function k(R) {
		l(!1), c == null || c(R);
	}
	return s.jsx("li", {
		ref: m,
		children: s.jsx(v, {
			className: x(
				t.base,
				d && t.active.on,
				!d && !i && t.active.off,
				t.disabled[i ? "on" : "off"],
				b,
			),
			onClick: k,
			...g,
			children: h,
		}),
	});
});
H.displayName = "NavbarLink";
const P = f.forwardRef((e, m) =>
	s.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 448 512",
		ref: m,
		...e,
		children: s.jsx("path", {
			stroke: "none",
			d: "M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z",
		}),
	}),
);
P.displayName = "BarsIcon";
const L = f.forwardRef((e, m) => {
	var c, g, k;
	const {
			theme: a,
			clearTheme: n,
			applyTheme: p,
			isOpen: l,
			setIsOpen: o,
		} = w(),
		t = y(),
		d = u(
			[
				N.toggle,
				(g = (c = t.theme) == null ? void 0 : c.navbar) == null
					? void 0
					: g.toggle,
				a == null ? void 0 : a.toggle,
				e.theme,
			],
			[r(t.clearTheme, "navbar.toggle"), r(n, "toggle"), e.clearTheme],
			[r(t.applyTheme, "navbar.toggle"), r(p, "toggle"), e.applyTheme],
		),
		{
			barIcon: v = P,
			className: i,
			...h
		} = T(e, (k = t.props) == null ? void 0 : k.navbarToggle);
	function b() {
		o(!l);
	}
	return s.jsxs("button", {
		ref: m,
		"data-testid": "flowbite-navbar-toggle",
		onClick: b,
		className: x(d.base, i),
		...h,
		children: [
			s.jsx("span", { className: d.title, children: "Open main menu" }),
			s.jsx(v, { "aria-hidden": !0, className: d.icon }),
		],
	});
});
L.displayName = "NavbarToggle";
export { A as N, z as a, L as b, E as c, H as d, N as n };
