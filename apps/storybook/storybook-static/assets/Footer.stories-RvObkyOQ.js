import {
	t as b,
	g as m,
	r as v,
	a as w,
	u as y,
	c as Z,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as u } from "./iframe-ByD-PdrA.js";
import { B as K, a as Q, b as V, c as X, d as Y } from "./index-CTr8uqg5.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const N = Z({
		root: {
			base: "w-full rounded-lg bg-white shadow md:flex md:items-center md:justify-between dark:bg-gray-800",
			container: "w-full p-6",
			bgDark: "bg-gray-800",
		},
		groupLink: {
			base: "flex flex-wrap text-sm text-gray-500 dark:text-white",
			link: { base: "me-4 last:mr-0 md:mr-6", href: "hover:underline" },
			col: "flex-col space-y-4",
		},
		icon: { base: "text-gray-500 dark:hover:text-white", size: "h-5 w-5" },
		title: {
			base: "mb-6 text-sm font-semibold uppercase text-gray-500 dark:text-white",
		},
		divider: {
			base: "my-6 w-full border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700",
		},
		copyright: {
			base: "text-sm text-gray-500 sm:text-center dark:text-gray-400",
			href: "ml-1 hover:underline",
			span: "ml-1",
		},
		brand: {
			base: "mb-4 flex items-center sm:mb-0",
			img: "mr-3 h-8",
			span: "self-center whitespace-nowrap text-2xl font-semibold text-gray-800 dark:text-white",
		},
	}),
	S = u.forwardRef((r, f) => {
		var a, d;
		const s = y(),
			o = w(
				[N, (a = s.theme) == null ? void 0 : a.footer, r.theme],
				[m(s.clearTheme, "footer"), r.clearTheme],
				[m(s.applyTheme, "footer"), r.applyTheme],
			),
			{
				bgDark: n = !1,
				children: h,
				className: c,
				container: l = !1,
				...i
			} = v(r, (d = s.props) == null ? void 0 : d.footer);
		return e.jsx("footer", {
			ref: f,
			"data-testid": "flowbite-footer",
			className: b(o.root.base, n && o.root.bgDark, l && o.root.container, c),
			...i,
			children: h,
		});
	});
S.displayName = "Footer";
const D = u.forwardRef((r, f) => {
	var x, R, I;
	const s = y(),
		o = w(
			[
				N.brand,
				(R = (x = s.theme) == null ? void 0 : x.footer) == null
					? void 0
					: R.brand,
				r.theme,
			],
			[m(s.clearTheme, "footer.brand"), r.clearTheme],
			[m(s.applyTheme, "footer.brand"), r.applyTheme],
		),
		{
			alt: n,
			className: h,
			children: c,
			href: l,
			name: i,
			src: a,
			...d
		} = v(r, (I = s.props) == null ? void 0 : I.footerBrand);
	return e.jsx("div", {
		ref: f,
		children: l
			? e.jsxs("a", {
					"data-testid": "flowbite-footer-brand",
					href: l,
					className: b(o.base, h),
					...d,
					children: [
						e.jsx("img", { alt: n, src: a, className: o.img }),
						e.jsx("span", {
							"data-testid": "flowbite-footer-brand-span",
							className: o.span,
							children: i,
						}),
						c,
					],
				})
			: e.jsx("img", {
					alt: n,
					"data-testid": "flowbite-footer-brand",
					src: a,
					className: b(o.img, h),
					...d,
				}),
	});
});
D.displayName = "FooterBrand";
const P = u.forwardRef((r, f) => {
	var a, d, x;
	const s = y(),
		o = w(
			[
				N.copyright,
				(d = (a = s.theme) == null ? void 0 : a.footer) == null
					? void 0
					: d.copyright,
				r.theme,
			],
			[m(s.clearTheme, "footer.copyright"), r.clearTheme],
			[m(s.applyTheme, "footer.copyright"), r.applyTheme],
		),
		{
			by: n,
			className: h,
			href: c,
			year: l,
			...i
		} = v(r, (x = s.props) == null ? void 0 : x.footerCopyright);
	return e.jsxs("div", {
		ref: f,
		"data-testid": "flowbite-footer-copyright",
		className: b(o.base, h),
		...i,
		children: [
			"© ",
			l,
			c
				? e.jsx("a", { href: c, className: o.href, children: n })
				: e.jsx("span", {
						"data-testid": "flowbite-footer-copyright-span",
						className: o.span,
						children: n,
					}),
		],
	});
});
P.displayName = "FooterCopyright";
const B = u.forwardRef((r, f) => {
	var c, l, i;
	const s = y(),
		o = w(
			[
				N.divider,
				(l = (c = s.theme) == null ? void 0 : c.footer) == null
					? void 0
					: l.divider,
				r.theme,
			],
			[m(s.clearTheme, "footer.divider"), r.clearTheme],
			[m(s.applyTheme, "footer.divider"), r.applyTheme],
		),
		{ className: n, ...h } = v(
			r,
			(i = s.props) == null ? void 0 : i.footerDivider,
		);
	return e.jsx("hr", {
		ref: f,
		"data-testid": "footer-divider",
		className: b(o.base, n),
		...h,
	});
});
B.displayName = "FooterDivider";
const j = u.forwardRef((r, f) => {
	var a, d, x;
	const s = y(),
		o = w(
			[
				N.icon,
				(d = (a = s.theme) == null ? void 0 : a.footer) == null
					? void 0
					: d.icon,
				r.theme,
			],
			[m(s.clearTheme, "footer.icon"), r.clearTheme],
			[m(s.applyTheme, "footer.icon"), r.applyTheme],
		),
		{
			ariaLabel: n,
			className: h,
			href: c,
			icon: l,
			...i
		} = v(r, (x = s.props) == null ? void 0 : x.footerIcon);
	return e.jsx("div", {
		ref: f,
		children: c
			? e.jsx("a", {
					"aria-label": n,
					"data-testid": "flowbite-footer-icon",
					href: c,
					className: b(o.base, h),
					...i,
					children: e.jsx(l, { className: o.size }),
				})
			: e.jsx(l, {
					"data-testid": "flowbite-footer-icon",
					className: o.size,
					...i,
				}),
	});
});
j.displayName = "FooterIcon";
const t = u.forwardRef((r, f) => {
	var i, a, d, x;
	const s = y(),
		o = w(
			[
				N.groupLink.link,
				(d =
					(a = (i = s.theme) == null ? void 0 : i.footer) == null
						? void 0
						: a.groupLink) == null
					? void 0
					: d.link,
				r.theme,
			],
			[m(s.clearTheme, "footer.groupLink.link"), r.clearTheme],
			[m(s.applyTheme, "footer.groupLink.link"), r.applyTheme],
		),
		{
			as: n = "a",
			className: h,
			href: c,
			...l
		} = v(r, (x = s.props) == null ? void 0 : x.footerLink);
	return e.jsx("li", {
		ref: f,
		className: b(o.base, h),
		children: e.jsx(n, { href: c, className: o.href, ...l }),
	});
});
t.displayName = "FooterLink";
const p = u.forwardRef((r, f) => {
	var l, i, a;
	const s = y(),
		o = w(
			[
				N.groupLink,
				(i = (l = s.theme) == null ? void 0 : l.footer) == null
					? void 0
					: i.groupLink,
				r.theme,
			],
			[m(s.clearTheme, "footer.groupLink"), r.clearTheme],
			[m(s.applyTheme, "footer.groupLink"), r.applyTheme],
		),
		{
			className: n,
			col: h = !1,
			...c
		} = v(r, (a = s.props) == null ? void 0 : a.footerLinkGroup);
	return e.jsx("ul", {
		ref: f,
		"data-testid": "footer-groupLink",
		className: b(o.base, h && o.col, n),
		...c,
	});
});
p.displayName = "FooterLinkGroup";
const g = u.forwardRef((r, f) => {
	var i, a, d;
	const s = y(),
		o = w(
			[
				N.title,
				(a = (i = s.theme) == null ? void 0 : i.footer) == null
					? void 0
					: a.title,
				r.theme,
			],
			[m(s.clearTheme, "footer.title"), r.clearTheme],
			[m(s.applyTheme, "footer.title"), r.applyTheme],
		),
		{
			as: n = "h2",
			className: h,
			title: c,
			...l
		} = v(r, (d = s.props) == null ? void 0 : d.footerTitle);
	return e.jsx(n, {
		ref: f,
		"data-testid": "flowbite-footer-title",
		className: b(o.base, h),
		...l,
		children: c,
	});
});
g.displayName = "FooterTitle";
const oe = { title: "Components/Footer", component: S },
	C = ({ children: r }) => e.jsx(S, { children: r }),
	F = C.bind({});
F.storyName = "Default";
F.args = {
	children: e.jsxs("div", {
		className: "flex w-full justify-between p-6",
		children: [
			e.jsx(P, { href: "#", by: "Flowbite™", year: 2022 }),
			e.jsxs(p, {
				children: [
					e.jsx(t, { href: "#", children: "About" }),
					e.jsx(t, { href: "#", children: "Privacy Policy" }),
					e.jsx(t, { href: "#", children: "Licensing" }),
					e.jsx(t, { href: "#", children: "Contact" }),
				],
			}),
		],
	}),
};
const T = C.bind({});
T.storyName = "With Logo";
T.args = {
	children: e.jsxs("div", {
		className: "w-full p-6 text-center",
		children: [
			e.jsxs("div", {
				className:
					"w-full justify-between sm:flex sm:items-center sm:justify-between",
				children: [
					e.jsx(D, {
						href: "https://flowbite.com",
						src: "https://flowbite.com/docs/images/logo.svg",
						alt: "Flowbite Logo",
						name: "Flowbite",
					}),
					e.jsxs(p, {
						children: [
							e.jsx(t, { href: "#", children: "About" }),
							e.jsx(t, { href: "#", children: "Privacy Policy" }),
							e.jsx(t, { href: "#", children: "Licensing" }),
							e.jsx(t, { href: "#", children: "Contact" }),
						],
					}),
				],
			}),
			e.jsx(B, {}),
			e.jsx(P, { href: "#", by: "Flowbite™", year: 2022 }),
		],
	}),
};
const k = C.bind({});
k.storyName = "Social Media Icons";
k.args = {
	container: !0,
	children: e.jsxs("div", {
		className: "w-full p-6",
		children: [
			e.jsxs("div", {
				className:
					"grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1",
				children: [
					e.jsx("div", {
						children: e.jsx(D, {
							href: "https://flowbite.com",
							src: "https://flowbite.com/docs/images/logo.svg",
							alt: "Flowbite Logo",
							name: "Flowbite",
						}),
					}),
					e.jsxs("div", {
						className: "grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6",
						children: [
							e.jsxs("div", {
								children: [
									e.jsx(g, { title: "about" }),
									e.jsxs(p, {
										col: !0,
										children: [
											e.jsx(t, { href: "#", children: "Flowbite" }),
											e.jsx(t, { href: "#", children: "Tailwind CSS" }),
										],
									}),
								],
							}),
							e.jsxs("div", {
								children: [
									e.jsx(g, { title: "Follow us" }),
									e.jsxs(p, {
										col: !0,
										children: [
											e.jsx(t, { href: "#", children: "Github" }),
											e.jsx(t, { href: "#", children: "Discord" }),
										],
									}),
								],
							}),
							e.jsxs("div", {
								children: [
									e.jsx(g, { title: "Legal" }),
									e.jsxs(p, {
										col: !0,
										children: [
											e.jsx(t, { href: "#", children: "Privacy Policy" }),
											e.jsx(t, { href: "#", children: "Terms & Conditions" }),
										],
									}),
								],
							}),
						],
					}),
				],
			}),
			e.jsx(B, {}),
			e.jsxs("div", {
				className: "w-full sm:flex sm:items-center sm:justify-between",
				children: [
					e.jsx(P, { href: "#", by: "Flowbite™", year: 2022 }),
					e.jsxs("div", {
						className: "mt-4 flex space-x-6 sm:mt-0 sm:justify-center",
						children: [
							e.jsx(j, { href: "#", icon: K }),
							e.jsx(j, { href: "#", icon: Q }),
							e.jsx(j, { href: "#", icon: V }),
							e.jsx(j, { href: "#", icon: X }),
							e.jsx(j, { href: "#", icon: Y }),
						],
					}),
				],
			}),
		],
	}),
};
const L = C.bind({});
L.storyName = "Sitemap Links";
L.args = {
	children: e.jsxs("div", {
		className: "w-full bg-gray-800",
		children: [
			e.jsxs("div", {
				className: "grid w-full grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4",
				children: [
					e.jsxs("div", {
						children: [
							e.jsx(g, { title: "Company" }),
							e.jsxs(p, {
								col: !0,
								children: [
									e.jsx(t, { href: "#", children: "About" }),
									e.jsx(t, { href: "#", children: "Careers" }),
									e.jsx(t, { href: "#", children: "Brand Center" }),
									e.jsx(t, { href: "#", children: "Blog" }),
								],
							}),
						],
					}),
					e.jsxs("div", {
						children: [
							e.jsx(g, { title: "help center" }),
							e.jsxs(p, {
								col: !0,
								children: [
									e.jsx(t, { href: "#", children: "Discord Server" }),
									e.jsx(t, { href: "#", children: "Twitter" }),
									e.jsx(t, { href: "#", children: "Facebook" }),
									e.jsx(t, { href: "#", children: "Contact Us" }),
								],
							}),
						],
					}),
					e.jsxs("div", {
						children: [
							e.jsx(g, { title: "legal" }),
							e.jsxs(p, {
								col: !0,
								children: [
									e.jsx(t, { href: "#", children: "Privacy Policy" }),
									e.jsx(t, { href: "#", children: "Licensing" }),
									e.jsx(t, { href: "#", children: "Terms & Conditions" }),
								],
							}),
						],
					}),
					e.jsxs("div", {
						children: [
							e.jsx(g, { title: "download" }),
							e.jsxs(p, {
								col: !0,
								children: [
									e.jsx(t, { href: "#", children: "iOS" }),
									e.jsx(t, { href: "#", children: "Android" }),
									e.jsx(t, { href: "#", children: "Windows" }),
									e.jsx(t, { href: "#", children: "MacOS" }),
								],
							}),
						],
					}),
				],
			}),
			e.jsxs("div", {
				className:
					"w-full bg-gray-700 px-4 py-6 sm:flex sm:items-center sm:justify-between",
				children: [
					e.jsx(P, { href: "#", by: "Flowbite™", year: 2022 }),
					e.jsxs("div", {
						className: "mt-4 flex space-x-6 sm:mt-0 sm:justify-center",
						children: [
							e.jsx(j, { href: "#", icon: K }),
							e.jsx(j, { href: "#", icon: Q }),
							e.jsx(j, { href: "#", icon: V }),
							e.jsx(j, { href: "#", icon: X }),
							e.jsx(j, { href: "#", icon: Y }),
						],
					}),
				],
			}),
		],
	}),
};
var W, A, G;
F.parameters = {
	...F.parameters,
	docs: {
		...((W = F.parameters) == null ? void 0 : W.docs),
		source: {
			originalSource: `({
  children
}) => <Footer>{children}</Footer>`,
			...((G = (A = F.parameters) == null ? void 0 : A.docs) == null
				? void 0
				: G.source),
		},
	},
};
var M, z, E;
T.parameters = {
	...T.parameters,
	docs: {
		...((M = T.parameters) == null ? void 0 : M.docs),
		source: {
			originalSource: `({
  children
}) => <Footer>{children}</Footer>`,
			...((E = (z = T.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: E.source),
		},
	},
};
var O, _, U;
k.parameters = {
	...k.parameters,
	docs: {
		...((O = k.parameters) == null ? void 0 : O.docs),
		source: {
			originalSource: `({
  children
}) => <Footer>{children}</Footer>`,
			...((U = (_ = k.parameters) == null ? void 0 : _.docs) == null
				? void 0
				: U.source),
		},
	},
};
var q, H, J;
L.parameters = {
	...L.parameters,
	docs: {
		...((q = L.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: `({
  children
}) => <Footer>{children}</Footer>`,
			...((J = (H = L.parameters) == null ? void 0 : H.docs) == null
				? void 0
				: J.source),
		},
	},
};
const ie = [
	"DefaultFooter",
	"WithLogoFooter",
	"WithSocialMediaFooter",
	"SitemapLinksFooter",
];
export {
	F as DefaultFooter,
	L as SitemapLinksFooter,
	T as WithLogoFooter,
	k as WithSocialMediaFooter,
	ie as __namedExportsOrder,
	oe as default,
};
