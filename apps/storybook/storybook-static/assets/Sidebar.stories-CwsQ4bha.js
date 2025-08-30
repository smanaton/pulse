import { B as ve } from "./Badge-CCdaVxty.js";
import { B as Ue } from "./Button-BrGC8bZN.js";
import { C as Ae } from "./chevron-down-icon-CQF9w6vi.js";
import {
	t as g,
	a as k,
	u as N,
	g as o,
	r as P,
	c as Pe,
} from "./create-theme-ol-6nsx3.js";
import { G as ke } from "./iconBase-DsgIZlql.js";
import { j as e, r as x } from "./iframe-ByD-PdrA.js";
import {
	r as E,
	q as F,
	m as I,
	o as R,
	n as W,
	p as w,
	j as z,
} from "./index-CK8OVH7d.js";
import { T as Te } from "./Tooltip-rMIAfTv1.js";
import "./preload-helper-Dp1pzeXC.js";
import "./floating-ui.react-Dgys7JzL.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
import "./use-floating-DojRaj4Q.js";
const Se = x.createContext(void 0);
function M() {
	const a = x.useContext(Se);
	if (!a)
		throw new Error(
			"useSidebarContext should be used within the SidebarContext provider!",
		);
	return a;
}
const A = Pe({
		root: {
			base: "h-full",
			collapsed: { on: "w-16", off: "w-64" },
			inner:
				"h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 px-3 py-4 dark:bg-gray-800",
		},
		collapse: {
			button:
				"group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: {
				base: "h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
				open: { off: "", on: "text-gray-900" },
			},
			label: {
				base: "ml-3 flex-1 whitespace-nowrap text-left",
				title: "sr-only",
				icon: {
					base: "h-6 w-6 transition delay-0 ease-in-out",
					open: { on: "rotate-180", off: "" },
				},
			},
			list: "space-y-2 py-2",
		},
		cta: {
			base: "mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700",
			color: {
				blue: "bg-cyan-50 dark:bg-cyan-900",
				dark: "bg-dark-50 dark:bg-dark-900",
				failure: "bg-red-50 dark:bg-red-900",
				gray: "bg-gray-50 dark:bg-gray-900",
				green: "bg-green-50 dark:bg-green-900",
				light: "bg-light-50 dark:bg-light-900",
				red: "bg-red-50 dark:bg-red-900",
				purple: "bg-purple-50 dark:bg-purple-900",
				success: "bg-green-50 dark:bg-green-900",
				yellow: "bg-yellow-50 dark:bg-yellow-900",
				warning: "bg-yellow-50 dark:bg-yellow-900",
			},
		},
		item: {
			base: "flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			active: "bg-gray-100 dark:bg-gray-700",
			collapsed: {
				insideCollapse: "group w-full pl-8 transition duration-75",
				noIcon: "font-bold",
			},
			content: { base: "flex-1 whitespace-nowrap px-3" },
			icon: {
				base: "h-6 w-6 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
				active: "text-gray-700 dark:text-gray-100",
			},
			label: "",
			listItem: "",
		},
		items: { base: "" },
		itemGroup: {
			base: "mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700",
		},
		logo: {
			base: "mb-5 flex items-center pl-2.5",
			collapsed: {
				on: "hidden",
				off: "self-center whitespace-nowrap text-xl font-semibold dark:text-white",
			},
			img: "mr-3 h-6 sm:h-7",
		},
	}),
	Y = x.forwardRef((a, p) => {
		var m, h;
		const s = N(),
			c = k(
				[A, (m = s.theme) == null ? void 0 : m.sidebar, a.theme],
				[o(s.clearTheme, "sidebar"), a.clearTheme],
				[o(s.applyTheme, "sidebar"), a.applyTheme],
			),
			{
				as: b = "nav",
				children: l,
				className: t,
				collapseBehavior: i = "collapse",
				collapsed: d = !1,
				...n
			} = P(a, (h = s.props) == null ? void 0 : h.sidebar);
		return e.jsx(Se.Provider, {
			value: {
				theme: a.theme,
				clearTheme: a.clearTheme,
				applyTheme: a.applyTheme,
				isCollapsed: d,
			},
			children: e.jsx(b, {
				ref: p,
				"aria-label": "Sidebar",
				hidden: d && i === "hide",
				className: g(c.root.base, c.root.collapsed[d ? "on" : "off"], t),
				...n,
				children: e.jsx("div", { className: c.root.inner, children: l }),
			}),
		});
	});
Y.displayName = "Sidebar";
const J = x.createContext(void 0);
function Be() {
	const a = x.useContext(J);
	if (!a)
		throw new Error(
			"useSidebarItemContext should be used within the SidebarItemContext provider!",
		);
	return a;
}
const q = x.forwardRef((a, p) => {
	var $, X, Z;
	const { theme: s, clearTheme: c, applyTheme: b, isCollapsed: l } = M(),
		t = N(),
		i = k(
			[
				A.collapse,
				(X = ($ = t.theme) == null ? void 0 : $.sidebar) == null
					? void 0
					: X.collapse,
				s == null ? void 0 : s.collapse,
				a.theme,
			],
			[o(t.clearTheme, "sidebar.collapse"), o(c, "collapse"), a.clearTheme],
			[o(t.applyTheme, "sidebar.collapse"), o(b, "collapse"), a.applyTheme],
		),
		{
			children: d,
			className: n,
			icon: m,
			label: h,
			chevronIcon: u = Ae,
			renderChevronIcon: j,
			open: y = !1,
			...S
		} = P(a, (Z = t.props) == null ? void 0 : Z.sidebarCollapse),
		C = x.useId(),
		[f, V] = x.useState(y);
	x.useEffect(() => V(y), [y]);
	function _({ children: ee }) {
		return l && !f
			? e.jsx(Te, { content: h, placement: "right", children: ee })
			: ee;
	}
	return e.jsx("li", {
		ref: p,
		children: e.jsxs(_, {
			children: [
				e.jsxs("button", {
					id: `flowbite-sidebar-collapse-${C}`,
					onClick: () => V(!f),
					title: h,
					type: "button",
					className: g(i.button, n),
					...S,
					children: [
						m &&
							e.jsx(m, {
								"aria-hidden": !0,
								"data-testid": "flowbite-sidebar-collapse-icon",
								className: g(i.icon.base, i.icon.open[f ? "on" : "off"]),
							}),
						l
							? e.jsx("span", { className: i.label.title, children: h })
							: e.jsxs(e.Fragment, {
									children: [
										e.jsx("span", {
											"data-testid": "flowbite-sidebar-collapse-label",
											className: i.label.base,
											children: h,
										}),
										j
											? j(i, f)
											: e.jsx(u, {
													"aria-hidden": !0,
													className: g(
														i.label.icon.base,
														i.label.icon.open[f ? "on" : "off"],
													),
												}),
									],
								}),
					],
				}),
				e.jsx("ul", {
					"aria-labelledby": `flowbite-sidebar-collapse-${C}`,
					hidden: !f,
					className: i.list,
					children: e.jsx(J.Provider, {
						value: { isInsideCollapse: !0 },
						children: d,
					}),
				}),
			],
		}),
	});
});
q.displayName = "SidebarCollapse";
const Ce = x.forwardRef((a, p) => {
	var h, u, j;
	const { theme: s, clearTheme: c, applyTheme: b, isCollapsed: l } = M(),
		t = N(),
		i = k(
			[
				A.cta,
				(u = (h = t.theme) == null ? void 0 : h.sidebar) == null
					? void 0
					: u.cta,
				s == null ? void 0 : s.cta,
				a.theme,
			],
			[o(t.clearTheme, "sidebar.cta"), o(c, "cta"), a.clearTheme],
			[o(t.applyTheme, "sidebar.cta"), o(b, "cta"), a.applyTheme],
		),
		{
			color: d = "info",
			className: n,
			...m
		} = P(a, (j = t.props) == null ? void 0 : j.sidebarCTA);
	return e.jsx("div", {
		ref: p,
		"data-testid": "sidebar-cta",
		hidden: l,
		className: g(i.base, i.color[d], n),
		...m,
	});
});
Ce.displayName = "SidebarCTA";
const r = x.forwardRef((a, p) => {
	var V, _, $;
	const s = x.useId(),
		{ theme: c, clearTheme: b, applyTheme: l, isCollapsed: t } = M(),
		{ isInsideCollapse: i } = Be(),
		d = N(),
		n = k(
			[
				A.item,
				(_ = (V = d.theme) == null ? void 0 : V.sidebar) == null
					? void 0
					: _.item,
				c == null ? void 0 : c.item,
				a.theme,
			],
			[o(d.clearTheme, "sidebar.item"), o(b, "item"), a.clearTheme],
			[o(d.applyTheme, "sidebar.item"), o(l, "item"), a.applyTheme],
		),
		{
			active: m,
			as: h = "a",
			children: u,
			className: j,
			icon: y,
			label: S,
			labelColor: C = "info",
			...f
		} = P(a, ($ = d.props) == null ? void 0 : $.sidebarItem);
	return e.jsx(Q, {
		theme: n,
		className: n.listItem,
		id: s,
		isCollapsed: t,
		tooltipChildren: u,
		children: e.jsxs(h, {
			"aria-labelledby": `flowbite-sidebar-item-${s}`,
			ref: p,
			className: g(
				n.base,
				m && n.active,
				!t && i && n.collapsed.insideCollapse,
				j,
			),
			...f,
			children: [
				y &&
					e.jsx(y, {
						"aria-hidden": !0,
						"data-testid": "flowbite-sidebar-item-icon",
						className: g(n.icon.base, m && n.icon.active),
					}),
				t &&
					!y &&
					e.jsx("span", {
						className: n.collapsed.noIcon,
						children: u.charAt(0).toLocaleUpperCase() ?? "?",
					}),
				!t && e.jsx(Ie, { id: s, theme: n, children: u }),
				!t &&
					S &&
					e.jsx(ve, {
						color: C,
						"data-testid": "flowbite-sidebar-label",
						hidden: t,
						className: n.label,
						children: S,
					}),
			],
		}),
	});
});
r.displayName = "SidebarItem";
function Q({
	id: a,
	theme: p,
	isCollapsed: s,
	tooltipChildren: c,
	children: b,
	...l
}) {
	return e.jsx("li", {
		...l,
		children: s
			? e.jsx(Te, {
					content: e.jsx(Ie, { id: a, theme: p, children: c }),
					placement: "right",
					children: b,
				})
			: b,
	});
}
Q.displayName = "SidebarItem.ListItem";
function Ie({ id: a, theme: p, children: s }) {
	return e.jsx("span", {
		"data-testid": "flowbite-sidebar-item-content",
		id: `flowbite-sidebar-item-${a}`,
		className: g(p.content.base),
		children: s,
	});
}
Q.displayName = "SidebarItem.Children";
const v = x.forwardRef((a, p) => {
	var n, m, h;
	const { theme: s, clearTheme: c, applyTheme: b } = M(),
		l = N(),
		t = k(
			[
				A.itemGroup,
				(m = (n = l.theme) == null ? void 0 : n.sidebar) == null
					? void 0
					: m.itemGroup,
				s == null ? void 0 : s.itemGroup,
				a.theme,
			],
			[o(l.clearTheme, "sidebar.itemGroup"), o(c, "itemGroup"), a.clearTheme],
			[o(l.applyTheme, "sidebar.itemGroup"), o(b, "itemGroup"), a.applyTheme],
		),
		{ className: i, ...d } = P(
			a,
			(h = l.props) == null ? void 0 : h.sidebarItemGroup,
		);
	return e.jsx(J.Provider, {
		value: { isInsideCollapse: !1 },
		children: e.jsx("ul", {
			ref: p,
			"data-testid": "flowbite-sidebar-item-group",
			className: g(t.base, i),
			...d,
		}),
	});
});
v.displayName = "SidebarItemGroup";
const T = x.forwardRef((a, p) => {
	var n, m, h;
	const { theme: s, clearTheme: c, applyTheme: b } = M(),
		l = N(),
		t = k(
			[
				A.items,
				(m = (n = l.theme) == null ? void 0 : n.sidebar) == null
					? void 0
					: m.items,
				s == null ? void 0 : s.items,
				a.theme,
			],
			[o(l.clearTheme, "sidebar.items"), o(c, "items"), a.clearTheme],
			[o(l.applyTheme, "sidebar.items"), o(b, "items"), a.applyTheme],
		),
		{ className: i, ...d } = P(
			a,
			(h = l.props) == null ? void 0 : h.sidebarItems,
		);
	return e.jsx("div", {
		ref: p,
		className: g(t.base, i),
		"data-testid": "flowbite-sidebar-items",
		...d,
	});
});
T.displayName = "SidebarItems";
const Ne = x.forwardRef((a, p) => {
	var S, C, f;
	const s = x.useId(),
		{ theme: c, clearTheme: b, applyTheme: l, isCollapsed: t } = M(),
		i = N(),
		d = k(
			[
				A.logo,
				(C = (S = i.theme) == null ? void 0 : S.sidebar) == null
					? void 0
					: C.logo,
				c == null ? void 0 : c.logo,
				a.theme,
			],
			[o(i.clearTheme, "sidebar.logo"), o(b, "logo"), a.clearTheme],
			[o(i.applyTheme, "sidebar.logo"), o(l, "logo"), a.applyTheme],
		),
		{
			children: n,
			className: m,
			href: h,
			img: u,
			imgAlt: j = "",
			...y
		} = P(a, (f = i.props) == null ? void 0 : f.sidebarLogo);
	return e.jsxs("a", {
		ref: p,
		"aria-labelledby": `flowbite-sidebar-logo-${s}`,
		href: h,
		className: g(d.base, m),
		...y,
		children: [
			e.jsx("img", { alt: j, src: u, className: d.img }),
			e.jsx("span", {
				className: d.collapsed[t ? "on" : "off"],
				id: `flowbite-sidebar-logo-${s}`,
				children: n,
			}),
		],
	});
});
Ne.displayName = "SidebarLogo";
function De(a) {
	return ke({
		attr: { viewBox: "0 0 24 24" },
		child: [
			{
				tag: "path",
				attr: {
					d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.411 7H16v.031A5.037 5.037 0 0 0 14.969 8H15V4.589A8.039 8.039 0 0 1 19.411 9zM12 15c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm1-10.931v3.032a4.988 4.988 0 0 0-2 0V4.069c.328-.041.66-.069 1-.069s.672.028 1 .069zm-4 .52V8h.031A5.037 5.037 0 0 0 8 9.031V9H4.589C5.402 7 6.999 5.402 9 4.589zM4.069 11h3.032a4.995 4.995 0 0 0 .001 2H4.069C4.028 12.672 4 12.339 4 12s.028-.672.069-1zm.52 4H8v-.031c.284.381.621.718 1 1.005v3.437A8.039 8.039 0 0 1 4.589 15zM11 19.931v-3.032a4.988 4.988 0 0 0 2 0v3.032c-.328.041-.66.069-1 .069s-.672-.028-1-.069zm4-.52v-3.437a5.038 5.038 0 0 0 1-1.005V15h3.411A8.039 8.039 0 0 1 15 19.411zM19.931 13h-3.032a4.995 4.995 0 0 0-.001-2h3.032c.042.328.07.661.07 1s-.028.672-.069 1z",
				},
				child: [],
			},
		],
	})(a);
}
const _e = { title: "Components/Sidebar", component: Y },
	U = (a) => e.jsx(Y, { ...a }),
	K = U.bind({});
K.args = {
	children: e.jsx(e.Fragment, {
		children: e.jsx(T, {
			children: e.jsxs(v, {
				children: [
					e.jsx(r, { href: "#", icon: I, children: "Dashboard" }),
					e.jsx(r, {
						href: "#",
						icon: W,
						label: "Pro",
						labelColor: "gray",
						children: "Kanban",
					}),
					e.jsx(r, { href: "#", icon: z, label: "3", children: "Inbox" }),
					e.jsx(r, { href: "#", icon: R, children: "Users" }),
					e.jsx(r, { href: "#", icon: w, children: "Products" }),
					e.jsx(r, { href: "#", icon: F, children: "Sign In" }),
					e.jsx(r, { href: "#", icon: E, children: "Sign Up" }),
				],
			}),
		}),
	}),
	collapsed: !1,
};
const B = U.bind({});
B.storyName = "No icons";
B.args = {
	children: e.jsx(e.Fragment, {
		children: e.jsx(T, {
			children: e.jsxs(v, {
				children: [
					e.jsx(r, { href: "#", children: "Dashboard" }),
					e.jsx(r, {
						href: "#",
						label: "Pro",
						labelColor: "alternative",
						children: "Kanban",
					}),
					e.jsx(r, { href: "#", label: "3", children: "Inbox" }),
					e.jsx(r, { href: "#", children: "Users" }),
					e.jsx(r, { href: "#", children: "Products" }),
					e.jsx(r, { href: "#", children: "Sign In" }),
					e.jsx(r, { href: "#", children: "Sign Up" }),
				],
			}),
		}),
	}),
	collapsed: !1,
};
const D = U.bind({});
D.storyName = "Multi-level dropdown";
D.args = {
	children: e.jsx(e.Fragment, {
		children: e.jsx(T, {
			children: e.jsxs(v, {
				children: [
					e.jsx(r, { href: "#", icon: I, children: "Dashboard" }),
					e.jsx(q, {
						icon: w,
						label: "E-commerce",
						children: e.jsx(r, { href: "#", children: "Products" }),
					}),
					e.jsx(r, { href: "#", icon: z, children: "Inbox" }),
					e.jsx(r, { href: "#", icon: R, children: "Users" }),
					e.jsx(r, { href: "#", icon: w, children: "Products" }),
					e.jsx(r, { href: "#", icon: F, children: "Sign In" }),
					e.jsx(r, { href: "#", icon: E, children: "Sign Up" }),
				],
			}),
		}),
	}),
	collapsed: !1,
};
const O = U.bind({});
O.args = {
	children: e.jsx(e.Fragment, {
		children: e.jsx(T, {
			children: e.jsxs(v, {
				children: [
					e.jsx(r, { href: "#", icon: I, children: "Dashboard" }),
					e.jsx(q, {
						icon: w,
						label: "E-commerce",
						children: e.jsx(r, { href: "#", children: "Products" }),
					}),
					e.jsx(q, {
						icon: w,
						label: "Billing",
						open: !0,
						children: e.jsx(r, { href: "#", children: "Usage Summary" }),
					}),
					e.jsx(r, { href: "#", icon: z, children: "Inbox" }),
					e.jsx(r, { href: "#", icon: R, children: "Users" }),
					e.jsx(r, { href: "#", icon: w, children: "Products" }),
					e.jsx(r, { href: "#", icon: F, children: "Sign In" }),
					e.jsx(r, { href: "#", icon: E, children: "Sign Up" }),
				],
			}),
		}),
	}),
	collapsed: !1,
};
const L = U.bind({});
L.storyName = "Content separator";
L.args = {
	children: e.jsx(e.Fragment, {
		children: e.jsxs(T, {
			children: [
				e.jsxs(v, {
					children: [
						e.jsx(r, { href: "#", icon: I, children: "Dashboard" }),
						e.jsx(r, { href: "#", icon: W, children: "Kanban" }),
						e.jsx(r, { href: "#", icon: z, children: "Inbox" }),
						e.jsx(r, { href: "#", icon: R, children: "Users" }),
						e.jsx(r, { href: "#", icon: w, children: "Products" }),
						e.jsx(r, { href: "#", icon: F, children: "Sign In" }),
						e.jsx(r, { href: "#", icon: E, children: "Sign Up" }),
					],
				}),
				e.jsxs(v, {
					children: [
						e.jsx(r, { href: "#", icon: I, children: "Upgrade to Pro" }),
						e.jsx(r, { href: "#", icon: W, children: "Documentation" }),
						e.jsx(r, { href: "#", icon: De, children: "Help" }),
					],
				}),
			],
		}),
	}),
	collapsed: !1,
};
const G = U.bind({});
G.storyName = "CTA button";
G.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(T, {
				children: e.jsxs(v, {
					children: [
						e.jsx(r, { href: "#", icon: I, children: "Dashboard" }),
						e.jsx(r, { href: "#", icon: W, children: "Kanban" }),
						e.jsx(r, { href: "#", icon: z, children: "Inbox" }),
						e.jsx(r, { href: "#", icon: R, children: "Users" }),
						e.jsx(r, { href: "#", icon: w, children: "Products" }),
						e.jsx(r, { href: "#", icon: F, children: "Sign In" }),
						e.jsx(r, { href: "#", icon: E, children: "Sign Up" }),
					],
				}),
			}),
			e.jsxs(Ce, {
				children: [
					e.jsxs("div", {
						className: "mb-3 flex items-center",
						children: [
							e.jsx(ve, { color: "warning", children: "Beta" }),
							e.jsx("div", {
								className: "-m-1.5 ml-auto",
								children: e.jsx(Ue, {
									"aria-label": "Close",
									outline: !0,
									children: e.jsx("svg", {
										className: "size-4",
										fill: "currentColor",
										viewBox: "0 0 20 20",
										xmlns: "http://www.w3.org/2000/svg",
										children: e.jsx("path", {
											clipRule: "evenodd",
											d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
											fillRule: "evenodd",
										}),
									}),
								}),
							}),
						],
					}),
					e.jsx("p", {
						className: "mb-3 text-cyan-900 text-sm dark:text-cyan-400",
						children:
							"Preview the new Flowbite dashboard navigation! You can turn the new navigation off for a limited time in your profile.",
					}),
					e.jsx("a", {
						href: "#",
						className:
							"text-cyan-900 text-sm underline hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300",
						children: "Turn new navigation off",
					}),
				],
			}),
		],
	}),
	collapsed: !1,
};
const H = U.bind({});
H.storyName = "Logo branding";
H.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(Ne, {
				href: "#",
				img: "favicon.svg",
				imgAlt: "Flowbite logo",
				children: "Flowbite",
			}),
			e.jsx(T, {
				children: e.jsxs(v, {
					children: [
						e.jsx(r, { href: "#", icon: I, children: "Dashboard" }),
						e.jsx(r, { href: "#", icon: W, children: "Kanban" }),
						e.jsx(r, { href: "#", icon: z, children: "Inbox" }),
						e.jsx(r, { href: "#", icon: R, children: "Users" }),
						e.jsx(r, { href: "#", icon: w, children: "Products" }),
						e.jsx(r, { href: "#", icon: F, children: "Sign In" }),
						e.jsx(r, { href: "#", icon: E, children: "Sign Up" }),
					],
				}),
			}),
		],
	}),
	collapsed: !1,
};
var re, ae, se;
K.parameters = {
	...K.parameters,
	docs: {
		...((re = K.parameters) == null ? void 0 : re.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((se = (ae = K.parameters) == null ? void 0 : ae.docs) == null
				? void 0
				: se.source),
		},
	},
};
var oe, ie, te;
B.parameters = {
	...B.parameters,
	docs: {
		...((oe = B.parameters) == null ? void 0 : oe.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((te = (ie = B.parameters) == null ? void 0 : ie.docs) == null
				? void 0
				: te.source),
		},
	},
};
var ne, le, ce;
D.parameters = {
	...D.parameters,
	docs: {
		...((ne = D.parameters) == null ? void 0 : ne.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((ce = (le = D.parameters) == null ? void 0 : le.docs) == null
				? void 0
				: ce.source),
		},
	},
};
var de, he, me;
O.parameters = {
	...O.parameters,
	docs: {
		...((de = O.parameters) == null ? void 0 : de.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((me = (he = O.parameters) == null ? void 0 : he.docs) == null
				? void 0
				: me.source),
		},
	},
};
var pe, be, xe;
L.parameters = {
	...L.parameters,
	docs: {
		...((pe = L.parameters) == null ? void 0 : pe.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((xe = (be = L.parameters) == null ? void 0 : be.docs) == null
				? void 0
				: xe.source),
		},
	},
};
var fe, ge, ue;
G.parameters = {
	...G.parameters,
	docs: {
		...((fe = G.parameters) == null ? void 0 : fe.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((ue = (ge = G.parameters) == null ? void 0 : ge.docs) == null
				? void 0
				: ue.source),
		},
	},
};
var je, ye, we;
H.parameters = {
	...H.parameters,
	docs: {
		...((je = H.parameters) == null ? void 0 : je.docs),
		source: {
			originalSource: "props => <Sidebar {...props} />",
			...((we = (ye = H.parameters) == null ? void 0 : ye.docs) == null
				? void 0
				: we.source),
		},
	},
};
const qe = [
	"Default",
	"WithoutIcons",
	"MultiLevelDropdown",
	"DefaultExpandedDropdown",
	"ContentSeparator",
	"CTAButton",
	"LogoBranding",
];
export {
	G as CTAButton,
	L as ContentSeparator,
	K as Default,
	O as DefaultExpandedDropdown,
	H as LogoBranding,
	D as MultiLevelDropdown,
	B as WithoutIcons,
	qe as __namedExportsOrder,
	_e as default,
};
