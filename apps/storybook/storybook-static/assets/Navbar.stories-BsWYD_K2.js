import { A as S } from "./Avatar-bF8jgGr_.js";
import { B as N } from "./Button-BrGC8bZN.js";
import { D as u } from "./Dropdown-C07Gup1O.js";
import { b as D, a as F, D as o } from "./DropdownItem-C7ZqAEgu.js";
import { j as r } from "./iframe-ByD-PdrA.js";
import { c, d as e, N as g, a as i, b as n } from "./NavbarToggle-DjlUAlma.js";
import "./preload-helper-Dp1pzeXC.js";
import "./create-theme-ol-6nsx3.js";
import "./floating-ui.react-Dgys7JzL.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
import "./use-floating-DojRaj4Q.js";
import "./chevron-down-icon-CQF9w6vi.js";
import "./chevron-left-icon-RFu8Vxl9.js";
import "./chevron-right-icon-DzP0OM3K.js";
const R = { title: "Components/Navbar", component: g },
	l = (w) => r.jsx("div", { className: "w-4/5", children: r.jsx(g, { ...w }) }),
	s = l.bind({});
s.storyName = "Default";
s.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsxs(i, {
				href: "https://flowbite.com/",
				children: [
					r.jsx("img", {
						src: "https://flowbite.com/docs/images/logo.svg",
						className: "mr-3 h-6 sm:h-9",
						alt: "Flowbite Logo",
					}),
					r.jsx("span", {
						className:
							"self-center whitespace-nowrap font-semibold text-xl dark:text-white",
						children: "Flowbite",
					}),
				],
			}),
			r.jsx(n, {}),
			r.jsxs(c, {
				children: [
					r.jsx(e, { href: "/navbars", active: !0, children: "Home" }),
					r.jsx(e, { href: "/navbars", children: "About" }),
					r.jsx(e, { href: "/navbars", children: "Services" }),
					r.jsx(e, { href: "/navbars", children: "Pricing" }),
					r.jsx(e, { href: "/navbars", children: "Contact" }),
				],
			}),
		],
	}),
};
const t = l.bind({});
t.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsxs(i, {
				href: "https://flowbite.com/",
				children: [
					r.jsx("img", {
						src: "https://flowbite.com/docs/images/logo.svg",
						className: "mr-3 h-6 sm:h-9",
						alt: "Flowbite Logo",
					}),
					r.jsx("span", {
						className:
							"self-center whitespace-nowrap font-semibold text-xl dark:text-white",
						children: "Flowbite",
					}),
				],
			}),
			r.jsxs("div", {
				className: "flex gap-3 md:order-2",
				children: [r.jsx(N, { children: "Get started" }), r.jsx(n, {})],
			}),
			r.jsxs(c, {
				children: [
					r.jsx(e, { href: "/navbars", active: !0, children: "Home" }),
					r.jsx(e, { href: "/navbars", children: "About" }),
					r.jsx(e, { href: "/navbars", children: "Services" }),
					r.jsx(e, { href: "/navbars", children: "Pricing" }),
					r.jsx(e, { href: "/navbars", children: "Contact" }),
				],
			}),
		],
	}),
};
const a = l.bind({});
a.storyName = "With dropdown";
a.args = {
	children: r.jsxs(r.Fragment, {
		children: [
			r.jsxs(i, {
				href: "https://flowbite.com/",
				children: [
					r.jsx("img", {
						src: "https://flowbite.com/docs/images/logo.svg",
						className: "mr-3 h-6 sm:h-9",
						alt: "Flowbite Logo",
					}),
					r.jsx("span", {
						className:
							"self-center whitespace-nowrap font-semibold text-xl dark:text-white",
						children: "Flowbite",
					}),
				],
			}),
			r.jsxs("div", {
				className: "flex gap-3 md:order-2",
				children: [
					r.jsxs(u, {
						arrowIcon: !1,
						inline: !0,
						label: r.jsx(S, {
							alt: "User settings",
							img: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
							rounded: !0,
						}),
						children: [
							r.jsxs(D, {
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
							r.jsx(o, { children: "Dashboard" }),
							r.jsx(o, { children: "Settings" }),
							r.jsx(o, { children: "Earnings" }),
							r.jsx(F, {}),
							r.jsx(o, { children: "Sign out" }),
						],
					}),
					r.jsx(n, {}),
				],
			}),
			r.jsxs(c, {
				children: [
					r.jsx(e, { href: "/navbars", active: !0, children: "Home" }),
					r.jsx(e, { href: "/navbars", children: "About" }),
					r.jsx(e, { href: "/navbars", children: "Services" }),
					r.jsx(e, { href: "/navbars", children: "Pricing" }),
					r.jsx(e, { href: "/navbars", children: "Contact" }),
				],
			}),
		],
	}),
};
var d, m, h;
s.parameters = {
	...s.parameters,
	docs: {
		...((d = s.parameters) == null ? void 0 : d.docs),
		source: {
			originalSource: `args => <div className="w-4/5">\r
        <Navbar {...args} />\r
    </div>`,
			...((h = (m = s.parameters) == null ? void 0 : m.docs) == null
				? void 0
				: h.source),
		},
	},
};
var p, x, b;
t.parameters = {
	...t.parameters,
	docs: {
		...((p = t.parameters) == null ? void 0 : p.docs),
		source: {
			originalSource: `args => <div className="w-4/5">\r
        <Navbar {...args} />\r
    </div>`,
			...((b = (x = t.parameters) == null ? void 0 : x.docs) == null
				? void 0
				: b.source),
		},
	},
};
var j, f, v;
a.parameters = {
	...a.parameters,
	docs: {
		...((j = a.parameters) == null ? void 0 : j.docs),
		source: {
			originalSource: `args => <div className="w-4/5">\r
        <Navbar {...args} />\r
    </div>`,
			...((v = (f = a.parameters) == null ? void 0 : f.docs) == null
				? void 0
				: v.source),
		},
	},
};
const U = ["DefaultNavbar", "WithCTA", "WithDropdown"];
export {
	s as DefaultNavbar,
	t as WithCTA,
	a as WithDropdown,
	U as __namedExportsOrder,
	R as default,
};
