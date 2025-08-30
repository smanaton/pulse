import {
	t as B,
	r as j,
	a as k,
	c as O,
	g as o,
	u as v,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as n } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const H = n.createContext(void 0);
function M() {
	const r = n.useContext(H);
	if (!r)
		throw new Error(
			"useDrawerContext should be used within the DrawerContext provider!",
		);
	return r;
}
const T = O({
		root: {
			base: "fixed z-40 overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800",
			backdrop: "fixed inset-0 z-30 bg-gray-900/50 dark:bg-gray-900/80",
			edge: "bottom-16",
			position: {
				top: {
					on: "left-0 right-0 top-0 w-full transform-none",
					off: "left-0 right-0 top-0 w-full -translate-y-full",
				},
				right: {
					on: "right-0 top-0 h-screen w-80 transform-none",
					off: "right-0 top-0 h-screen w-80 translate-x-full",
				},
				bottom: {
					on: "bottom-0 left-0 right-0 w-full transform-none",
					off: "bottom-0 left-0 right-0 w-full translate-y-full",
				},
				left: {
					on: "left-0 top-0 h-screen w-80 transform-none",
					off: "left-0 top-0 h-screen w-80 -translate-x-full",
				},
			},
		},
		header: {
			inner: {
				closeButton:
					"absolute end-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
				closeIcon: "h-4 w-4",
				titleCloseIcon: "sr-only",
				titleIcon: "me-2.5 h-4 w-4",
				titleText:
					"mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400",
			},
			collapsed: { on: "hidden", off: "block" },
		},
		items: { base: "" },
	}),
	N = n.forwardRef((r, s) => {
		var w, p;
		const i = n.useId(),
			d = v(),
			l = k(
				[T, (w = d.theme) == null ? void 0 : w.drawer, r.theme],
				[o(d.clearTheme, "drawer"), r.clearTheme],
				[o(d.applyTheme, "drawer"), r.applyTheme],
			),
			{
				backdrop: c = !0,
				children: h,
				className: f,
				edge: u = !1,
				position: m = "left",
				onClose: t,
				open: a = !1,
				...g
			} = j(r, (p = d.props) == null ? void 0 : p.drawer);
		return (
			n.useEffect(() => {
				const y = (b) => {
					b.key === "Escape" && a && t && t();
				};
				return (
					document.addEventListener("keydown", y),
					() => document.removeEventListener("keydown", y)
				);
			}, [t, a]),
			e.jsxs(H.Provider, {
				value: {
					theme: r.theme,
					clearTheme: r.clearTheme,
					applyTheme: r.applyTheme,
					onClose: t,
					isOpen: a,
					id: i,
				},
				children: [
					e.jsx("div", {
						ref: s,
						"aria-modal": !0,
						"aria-describedby": `drawer-dialog-${i}`,
						role: "dialog",
						tabIndex: -1,
						"data-testid": "flowbite-drawer",
						className: B(
							l.root.base,
							l.root.position[m][a ? "on" : "off"],
							u && !a && l.root.edge,
							f,
						),
						...g,
						children: h,
					}),
					a &&
						c &&
						e.jsx("div", { onClick: () => t(), className: l.root.backdrop }),
				],
			})
		);
	});
N.displayName = "Drawer";
const R = n.forwardRef((r, s) =>
	e.jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 24 24",
		ref: s,
		...r,
		children: [
			e.jsx("path", { fill: "none", stroke: "none", d: "M0 0h24v24H0z" }),
			e.jsx("path", {
				stroke: "none",
				d: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
			}),
		],
	}),
);
R.displayName = "CloseIcon";
const P = n.forwardRef((r, s) =>
	e.jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 24 24",
		ref: s,
		...r,
		children: [
			e.jsx("path", { fill: "none", stroke: "none", d: "M0 0h24v24H0z" }),
			e.jsx("path", {
				stroke: "none",
				d: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
			}),
		],
	}),
);
P.displayName = "HomeIcon";
const W = n.forwardRef((r, s) => {
	var C, D, I;
	const i = n.useId(),
		{
			id: d,
			isOpen: l,
			onClose: c,
			theme: h,
			clearTheme: f,
			applyTheme: u,
		} = M(),
		m = v(),
		t = k(
			[
				T.header,
				(D = (C = m.theme) == null ? void 0 : C.drawer) == null
					? void 0
					: D.header,
				h == null ? void 0 : h.header,
				r.theme,
			],
			[o(m.clearTheme, "drawer.header"), o(f, "header"), r.clearTheme],
			[o(m.applyTheme, "drawer.header"), o(u, "header"), r.applyTheme],
		),
		{
			children: a,
			className: g,
			closeIcon: w = R,
			title: p,
			titleIcon: y = P,
			...b
		} = j(r, (I = m.props) == null ? void 0 : I.drawerHeader);
	return e.jsxs("div", {
		ref: s,
		className: g,
		...b,
		children: [
			e.jsxs("h5", {
				className: t.inner.titleText,
				id: d,
				children: [
					e.jsx(y, { "aria-hidden": !0, className: t.inner.titleIcon }),
					p,
				],
			}),
			e.jsxs("button", {
				onClick: c,
				type: "button",
				"data-testid": "close-drawer",
				className: t.inner.closeButton,
				children: [
					e.jsx(w, { "aria-hidden": !0, className: t.inner.closeIcon }),
					e.jsx("span", {
						className: t.inner.titleCloseIcon,
						children: "Close menu",
					}),
				],
			}),
			e.jsx("span", {
				className: t.collapsed[l ? "on" : "off"],
				id: `flowbite-drawer-header-${i}`,
				children: a,
			}),
		],
	});
});
W.displayName = "DrawerHeader";
const K = n.forwardRef((r, s) => {
	var t, a, g;
	const { theme: i, clearTheme: d, applyTheme: l } = M(),
		c = v(),
		h = k(
			[
				T.items,
				(a = (t = c.theme) == null ? void 0 : t.drawer) == null
					? void 0
					: a.items,
				i == null ? void 0 : i.items,
				r.theme,
			],
			[o(c.clearTheme, "drawer.items"), o(d, "items"), r.clearTheme],
			[o(c.applyTheme, "drawer.items"), o(l, "items"), r.applyTheme],
		),
		{
			children: f,
			className: u,
			...m
		} = j(r, (g = c.props) == null ? void 0 : g.drawerItems);
	return e.jsx("div", {
		ref: s,
		"data-testid": "flowbite-drawer-items",
		className: B(h.base, u),
		...m,
		children: f,
	});
});
K.displayName = "DrawerItems";
const F = { title: "Components/Drawer", component: N },
	S = (r) =>
		e.jsxs(N, {
			...r,
			children: [
				e.jsx(W, { title: "Drawer" }),
				e.jsxs(K, {
					children: [
						e.jsxs("p", {
							className: "mb-6 text-gray-500 text-sm dark:text-gray-400",
							children: [
								"Supercharge your hiring by taking advantage of our ",
								e.jsx("a", {
									href: "#",
									className:
										"text-cyan-600 underline hover:no-underline dark:text-cyan-500",
									children: "limited-time sale",
								}),
								" for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.",
							],
						}),
						e.jsxs("div", {
							className: "grid grid-cols-1 gap-4 md:grid-cols-2",
							children: [
								e.jsx("a", {
									href: "#",
									className:
										"rounded-lg border border-gray-200 bg-white px-4 py-2 text-center font-medium text-gray-900 text-sm hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:focus:ring-gray-700 dark:hover:bg-gray-700 dark:hover:text-white",
									children: "Learn more",
								}),
								e.jsxs("a", {
									href: "#",
									className:
										"inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-center font-medium text-sm text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:focus:ring-cyan-800 dark:hover:bg-cyan-700",
									children: [
										"Get access ",
										e.jsx("svg", {
											className: "ms-2 size-3.5 rtl:rotate-180",
											"aria-hidden": "true",
											xmlns: "http://www.w3.org/2000/svg",
											fill: "none",
											viewBox: "0 0 14 10",
											children: e.jsx("path", {
												stroke: "currentColor",
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "2",
												d: "M1 5h12m0 0L9 1m4 4L9 9",
											}),
										}),
									],
								}),
							],
						}),
					],
				}),
			],
		}),
	x = S.bind({});
x.args = { backdrop: !0, open: !0, position: "left" };
var L, z, E;
x.parameters = {
	...x.parameters,
	docs: {
		...((L = x.parameters) == null ? void 0 : L.docs),
		source: {
			originalSource: `args => <Drawer {...args}>\r
        <DrawerHeader title="Drawer" />\r
        <DrawerItems>\r
            <p className="mb-6 text-gray-500 text-sm dark:text-gray-400">\r
                Supercharge your hiring by taking advantage of our&nbsp;\r
                <a href="#" className="text-cyan-600 underline hover:no-underline dark:text-cyan-500">\r
                    limited-time sale\r
                </a>\r
                &nbsp;for Flowbite Docs + Job Board. Unlimited access to over 190K\r
                top-ranked candidates and the #1 design job board.\r
            </p>\r
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">\r
                <a href="#" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center font-medium text-gray-900 text-sm hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:focus:ring-gray-700 dark:hover:bg-gray-700 dark:hover:text-white">\r
                    Learn more\r
                </a>\r
                <a href="#" className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-center font-medium text-sm text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:focus:ring-cyan-800 dark:hover:bg-cyan-700">\r
                    Get access&nbsp;\r
                    <svg className="ms-2 size-3.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">\r
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />\r
                    </svg>\r
                </a>\r
            </div>\r
        </DrawerItems>\r
    </Drawer>`,
			...((E = (z = x.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: E.source),
		},
	},
};
const G = ["Default"];
export { x as Default, G as __namedExportsOrder, F as default };
