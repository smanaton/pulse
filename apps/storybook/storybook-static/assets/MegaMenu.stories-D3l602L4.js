import { B as V } from "./Button-BrGC8bZN.js";
import {
	r as B,
	a as C,
	g as c,
	c as E,
	u as L,
	t as n,
} from "./create-theme-ol-6nsx3.js";
import { d as a, D as H } from "./Dropdown-C07Gup1O.js";
import { r as m, j as r } from "./iframe-ByD-PdrA.js";
import {
	b as _,
	c as A,
	a as F,
	d as g,
	N as U,
	n as x,
} from "./NavbarToggle-DjlUAlma.js";
import "./preload-helper-Dp1pzeXC.js";
import "./floating-ui.react-Dgys7JzL.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
import "./use-floating-DojRaj4Q.js";
import "./chevron-down-icon-CQF9w6vi.js";
import "./chevron-left-icon-RFu8Vxl9.js";
import "./chevron-right-icon-DzP0OM3K.js";
const D = E({
		...x,
		dropdown: {
			base: "",
			toggle: {
				...a,
				floating: {
					...a.floating,
					base: n(a.floating.base, "mt-2 block"),
					content: n(a.floating.content, "text-gray-500 dark:text-gray-400"),
					style: {
						...a.floating.style,
						auto: n(a.floating.style.auto, "text-gray-500 dark:text-gray-400"),
					},
				},
				inlineWrapper: n(
					a.inlineWrapper,
					"flex w-full items-center justify-between",
				),
			},
		},
		dropdownToggle: {
			base: n(
				x.link.base,
				x.link.active.off,
				"flex w-full items-center justify-between",
			),
		},
	}),
	v = m.forwardRef((e, h) => {
		var o, l;
		const s = L(),
			t = C(
				[D, (o = s.theme) == null ? void 0 : o.megaMenu, e.theme],
				[c(s.clearTheme, "megaMenu"), e.clearTheme],
				[c(s.applyTheme, "megaMenu"), e.applyTheme],
			),
			i = B(e, (l = s.props) == null ? void 0 : l.megaMenu);
		return r.jsx(U, { ref: h, theme: t, fluid: !0, ...i });
	});
v.displayName = "MegaMenu";
function P(e) {
	var u, N, b;
	const [h, s] = m.useState(void 0),
		t = L(),
		i = C(
			[
				D.dropdown,
				(N = (u = t.theme) == null ? void 0 : u.megaMenu) == null
					? void 0
					: N.dropdown,
				e.theme,
			],
			[c(t.clearTheme, "megaMenu.dropdown"), e.clearTheme],
			[c(t.applyTheme, "megaMenu.dropdown"), e.applyTheme],
		),
		{
			children: o,
			className: l,
			toggle: y,
			...S
		} = B(e, (b = t.props) == null ? void 0 : b.megaMenuDropdown);
	if (y)
		return r.jsx(H, {
			inline: !0,
			label: y,
			placement: "bottom",
			theme: i.toggle,
			className: n(i.base, l),
			children: o,
		});
	const R = m.useId(),
		f = m.useRef(null);
	return (
		m.useEffect(() => {
			var j, k;
			const p =
				(k = (j = f.current) == null ? void 0 : j.closest("nav")) == null
					? void 0
					: k.querySelector('[aria-haspopup="menu"]');
			s(p == null ? void 0 : p.id);
		}, []),
		r.jsx("div", {
			"aria-labelledby": h,
			id: R,
			ref: f,
			role: "menu",
			className: n(i.base, l),
			...S,
			children: o,
		})
	);
}
P.displayName = "MegaMenuDropdown";
const er = { title: "Components/MegaMenu", component: v },
	W = (e) =>
		r.jsxs(v, {
			...e,
			children: [
				r.jsxs(F, {
					href: "/",
					children: [
						r.jsx("img", {
							alt: "",
							src: "/favicon.svg",
							className: "mr-3 h-6 sm:h-9",
						}),
						r.jsx("span", {
							className:
								"self-center whitespace-nowrap font-semibold text-xl dark:text-white",
							children: "Flowbite",
						}),
					],
				}),
				r.jsxs("div", {
					className: "order-2 hidden items-center md:flex",
					children: [
						r.jsx("a", {
							href: "#",
							className:
								"mr-1 rounded-lg px-4 py-2 font-medium text-gray-800 text-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 md:mr-2 md:px-5 md:py-2.5 dark:text-white dark:focus:ring-gray-800 dark:hover:bg-gray-700",
							children: "Login",
						}),
						r.jsx(V, { href: "#", children: "Sign up" }),
					],
				}),
				r.jsx(_, {}),
				r.jsxs(A, {
					children: [
						r.jsx(g, { href: "#", children: "Home" }),
						r.jsx(P, {
							toggle: r.jsx(r.Fragment, { children: "Company" }),
							children: r.jsxs("ul", {
								className: "grid grid-cols-3",
								children: [
									r.jsxs("div", {
										className: "space-y-4 p-4",
										children: [
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "About Us",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Library",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Resources",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Pro Version",
												}),
											}),
										],
									}),
									r.jsxs("div", {
										className: "space-y-4 p-4",
										children: [
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Contact Us",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Support Center",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Terms",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Blog",
												}),
											}),
										],
									}),
									r.jsxs("div", {
										className: "space-y-4 p-4",
										children: [
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Newsletter",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "Playground",
												}),
											}),
											r.jsx("li", {
												children: r.jsx("a", {
													href: "#",
													className:
														"hover:text-primary-600 dark:hover:text-primary-500",
													children: "License",
												}),
											}),
										],
									}),
								],
							}),
						}),
						r.jsx(g, { href: "#", children: "Team" }),
						r.jsx(g, { href: "#", children: "Contact" }),
					],
				}),
			],
		}),
	d = W.bind({});
d.args = {};
var w, M, T;
d.parameters = {
	...d.parameters,
	docs: {
		...((w = d.parameters) == null ? void 0 : w.docs),
		source: {
			originalSource: `args => <MegaMenu {...args}>\r
        <NavbarBrand href="/">\r
            <img alt="" src="/favicon.svg" className="mr-3 h-6 sm:h-9" />\r
            <span className="self-center whitespace-nowrap font-semibold text-xl dark:text-white">\r
                Flowbite\r
            </span>\r
        </NavbarBrand>\r
        <div className="order-2 hidden items-center md:flex">\r
            <a href="#" className="mr-1 rounded-lg px-4 py-2 font-medium text-gray-800 text-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 md:mr-2 md:px-5 md:py-2.5 dark:text-white dark:focus:ring-gray-800 dark:hover:bg-gray-700">\r
                Login\r
            </a>\r
            <Button href="#">Sign up</Button>\r
        </div>\r
        <NavbarToggle />\r
        <NavbarCollapse>\r
            <NavbarLink href="#">Home</NavbarLink>\r
            <MegaMenuDropdown toggle={<>Company</>}>\r
                <ul className="grid grid-cols-3">\r
                    <div className="space-y-4 p-4">\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                About Us\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Library\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Resources\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Pro Version\r
                            </a>\r
                        </li>\r
                    </div>\r
                    <div className="space-y-4 p-4">\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Contact Us\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Support Center\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Terms\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Blog\r
                            </a>\r
                        </li>\r
                    </div>\r
                    <div className="space-y-4 p-4">\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Newsletter\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                Playground\r
                            </a>\r
                        </li>\r
                        <li>\r
                            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-500">\r
                                License\r
                            </a>\r
                        </li>\r
                    </div>\r
                </ul>\r
            </MegaMenuDropdown>\r
            <NavbarLink href="#">Team</NavbarLink>\r
            <NavbarLink href="#">Contact</NavbarLink>\r
        </NavbarCollapse>\r
    </MegaMenu>`,
			...((T = (M = d.parameters) == null ? void 0 : M.docs) == null
				? void 0
				: T.source),
		},
	},
};
const ar = ["Default"];
export { d as Default, ar as __namedExportsOrder, er as default };
