import { A as g } from "./Avatar-bF8jgGr_.js";
import {
	t as k,
	g as N,
	c as se,
	u as V,
	a as X,
	r as Z,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as K } from "./iframe-ByD-PdrA.js";
import { g as L } from "./index-CK8OVH7d.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const ee = se({
		root: {
			base: "list-inside space-y-1 text-gray-500 dark:text-gray-400",
			ordered: { off: "list-disc", on: "list-decimal" },
			horizontal:
				"flex list-none flex-wrap items-center justify-center space-x-4 space-y-0",
			unstyled: "list-none",
			nested: "mt-2 ps-5",
		},
		item: {
			withIcon: { off: "", on: "flex items-center" },
			icon: "me-2 h-3.5 w-3.5 shrink-0",
		},
	}),
	h = K.forwardRef((t, w) => {
		var A, I, T;
		const r = V(),
			a = X(
				[
					ee.root,
					(I = (A = r.theme) == null ? void 0 : A.list) == null
						? void 0
						: I.root,
					t.theme,
				],
				[N(r.clearTheme, "list.root"), t.clearTheme],
				[N(r.applyTheme, "list.root"), t.applyTheme],
			),
			{
				className: b,
				horizontal: v,
				nested: p,
				ordered: u,
				unstyled: j,
				...f
			} = Z(t, (T = r.props) == null ? void 0 : T.list),
			y = u ? "ol" : "ul";
		return e.jsx(y, {
			ref: w,
			className: k(
				a.base,
				a.ordered[u ? "on" : "off"],
				j && a.unstyled,
				p && a.nested,
				v && a.horizontal,
				b,
			),
			...f,
		});
	});
h.displayName = "List";
const s = K.forwardRef((t, w) => {
	var j, f, y;
	const r = V(),
		a = X(
			[
				ee.item,
				(f = (j = r.theme) == null ? void 0 : j.list) == null ? void 0 : f.item,
				t.theme,
			],
			[N(r.clearTheme, "list.item"), t.clearTheme],
			[N(r.applyTheme, "list.item"), t.applyTheme],
		),
		{
			children: b,
			className: v,
			icon: p,
			...u
		} = Z(t, (y = r.props) == null ? void 0 : y.listItem);
	return e.jsxs("li", {
		ref: w,
		className: k(a.withIcon[p ? "on" : "off"], v),
		...u,
		children: [p && e.jsx(p, { className: k(a.icon) }), b],
	});
});
s.displayName = "ListItem";
const ne = { title: "Components/List", component: h },
	i = (t) => e.jsx(h, { ...t }),
	c = i.bind({});
c.storyName = "Default";
c.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(s, {
				children: "At least 10 characters (and up to 100 characters)",
			}),
			e.jsx(s, { children: "At least one lowercase character" }),
			e.jsx(s, {
				children: "Inclusion of at least one special character, e.g., ! @ # ?",
			}),
		],
	}),
};
const l = i.bind({});
l.storyName = "Unstyled";
l.args = {
	unstyled: !0,
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(s, {
				children: "At least 10 characters (and up to 100 characters)",
			}),
			e.jsx(s, { children: "At least one lowercase character" }),
			e.jsx(s, {
				children: "Inclusion of at least one special character, e.g., ! @ # ?",
			}),
		],
	}),
};
const n = i.bind({});
n.storyName = "Nested";
n.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsxs(s, {
				children: [
					"List item one",
					e.jsxs(h, {
						ordered: !0,
						nested: !0,
						children: [
							e.jsx(s, {
								children:
									'You might feel like you are being really "organized" o',
							}),
							e.jsx(s, {
								children:
									"Nested navigation in UIs is a bad idea too, keep things as flat as possible.",
							}),
							e.jsx(s, {
								children:
									"Nesting tons of folders in your source code is also not helpful.",
							}),
						],
					}),
				],
			}),
			e.jsxs(s, {
				children: [
					"List item two",
					e.jsxs(h, {
						ordered: !0,
						nested: !0,
						children: [
							e.jsx(s, {
								children:
									"I'm not sure if we'll bother styling more than two levels deep.",
							}),
							e.jsx(s, {
								children:
									"Two is already too much, three is guaranteed to be a bad idea.",
							}),
							e.jsx(s, {
								children: "If you nest four levels deep you belong in prison.",
							}),
						],
					}),
				],
			}),
			e.jsxs(s, {
				children: [
					"List item three",
					e.jsxs(h, {
						ordered: !0,
						nested: !0,
						children: [
							e.jsx(s, {
								children: "Again please don't nest lists if you want",
							}),
							e.jsx(s, { children: "Nobody wants to look at this." }),
							e.jsx(s, {
								children: "I'm upset that we even have to bother styling this.",
							}),
						],
					}),
				],
			}),
		],
	}),
};
const o = i.bind({});
o.storyName = "Ordered";
o.args = {
	ordered: !0,
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(s, {
				children: "At least 10 characters (and up to 100 characters)",
			}),
			e.jsx(s, { children: "At least one lowercase character" }),
			e.jsx(s, {
				children: "Inclusion of at least one special character, e.g., ! @ # ?",
			}),
		],
	}),
};
const d = i.bind({});
d.storyName = "Horizontal";
d.args = {
	horizontal: !0,
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(s, { children: "About" }),
			e.jsx(s, { children: "Premium" }),
			e.jsx(s, { children: "Campaigns" }),
			e.jsx(s, { children: "Blog" }),
			e.jsx(s, { children: "Affiliate Program" }),
			e.jsx(s, { children: "FAQs" }),
			e.jsx(s, { children: "Contact" }),
		],
	}),
};
const m = i.bind({});
m.storyName = "With Icon";
m.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(s, {
				icon: L,
				children: "At least 10 characters (and up to 100 characters)",
			}),
			e.jsx(s, { icon: L, children: "At least one lowercase character" }),
			e.jsx(s, {
				icon: L,
				children: "Inclusion of at least one special character, e.g., ! @ # ?",
			}),
		],
	}),
};
const x = i.bind({});
x.storyName = "Advanced";
x.args = {
	unstyled: !0,
	className: "max-w-md divide-y divide-gray-200 dark:divide-gray-700",
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(s, {
				className: "pb-3 sm:pb-4",
				children: e.jsxs("div", {
					className: "flex items-center space-x-4 rtl:space-x-reverse",
					children: [
						e.jsx(g, {
							img: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
							alt: "Neil image",
							rounded: !0,
							size: "sm",
						}),
						e.jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								e.jsx("p", {
									className:
										"truncate font-medium text-gray-900 text-sm dark:text-white",
									children: "Neil Sims",
								}),
								e.jsx("p", {
									className:
										"truncate text-gray-500 text-sm dark:text-gray-400",
									children: "email@flowbite.com",
								}),
							],
						}),
						e.jsx("div", {
							className:
								"inline-flex items-center font-semibold text-base text-gray-900 dark:text-white",
							children: "$320",
						}),
					],
				}),
			}),
			e.jsx(s, {
				className: "py-3 sm:py-4",
				children: e.jsxs("div", {
					className: "flex items-center space-x-4 rtl:space-x-reverse",
					children: [
						e.jsx(g, {
							img: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
							alt: "Neil image",
							rounded: !0,
							size: "sm",
						}),
						e.jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								e.jsx("p", {
									className:
										"truncate font-medium text-gray-900 text-sm dark:text-white",
									children: "Bonnie Green",
								}),
								e.jsx("p", {
									className:
										"truncate text-gray-500 text-sm dark:text-gray-400",
									children: "email@flowbite.com",
								}),
							],
						}),
						e.jsx("div", {
							className:
								"inline-flex items-center font-semibold text-base text-gray-900 dark:text-white",
							children: "$3467",
						}),
					],
				}),
			}),
			e.jsx(s, {
				className: "py-3 sm:py-4",
				children: e.jsxs("div", {
					className: "flex items-center space-x-4 rtl:space-x-reverse",
					children: [
						e.jsx(g, {
							img: "https://flowbite.com/docs/images/people/profile-picture-2.jpg",
							alt: "Neil image",
							rounded: !0,
							size: "sm",
						}),
						e.jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								e.jsx("p", {
									className:
										"truncate font-medium text-gray-900 text-sm dark:text-white",
									children: "Michael Gough",
								}),
								e.jsx("p", {
									className:
										"truncate text-gray-500 text-sm dark:text-gray-400",
									children: "email@flowbite.com",
								}),
							],
						}),
						e.jsx("div", {
							className:
								"inline-flex items-center font-semibold text-base text-gray-900 dark:text-white",
							children: "$67",
						}),
					],
				}),
			}),
			e.jsx(s, {
				className: "py-3 sm:py-4",
				children: e.jsxs("div", {
					className: "flex items-center space-x-4 rtl:space-x-reverse",
					children: [
						e.jsx(g, {
							img: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
							alt: "Neil image",
							rounded: !0,
							size: "sm",
						}),
						e.jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								e.jsx("p", {
									className:
										"truncate font-medium text-gray-900 text-sm dark:text-white",
									children: "Thomas Lean",
								}),
								e.jsx("p", {
									className:
										"truncate text-gray-500 text-sm dark:text-gray-400",
									children: "email@flowbite.com",
								}),
							],
						}),
						e.jsx("div", {
							className:
								"inline-flex items-center font-semibold text-base text-gray-900 dark:text-white",
							children: "$2367",
						}),
					],
				}),
			}),
			e.jsx(s, {
				className: "pt-3 pb-0 sm:pt-4",
				children: e.jsxs("div", {
					className: "flex items-center space-x-4 rtl:space-x-reverse",
					children: [
						e.jsx(g, {
							img: "https://flowbite.com/docs/images/people/profile-picture-4.jpg",
							alt: "Neil image",
							rounded: !0,
							size: "sm",
						}),
						e.jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								e.jsx("p", {
									className:
										"truncate font-medium text-gray-900 text-sm dark:text-white",
									children: "Lana Byrd",
								}),
								e.jsx("p", {
									className:
										"truncate text-gray-500 text-sm dark:text-gray-400",
									children: "email@flowbite.com",
								}),
							],
						}),
						e.jsx("div", {
							className:
								"inline-flex items-center font-semibold text-base text-gray-900 dark:text-white",
							children: "$367",
						}),
					],
				}),
			}),
		],
	}),
};
var z, F, S;
c.parameters = {
	...c.parameters,
	docs: {
		...((z = c.parameters) == null ? void 0 : z.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...((S = (F = c.parameters) == null ? void 0 : F.docs) == null
				? void 0
				: S.source),
		},
	},
};
var C, P, $;
l.parameters = {
	...l.parameters,
	docs: {
		...((C = l.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...(($ = (P = l.parameters) == null ? void 0 : P.docs) == null
				? void 0
				: $.source),
		},
	},
};
var H, O, R;
n.parameters = {
	...n.parameters,
	docs: {
		...((H = n.parameters) == null ? void 0 : H.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...((R = (O = n.parameters) == null ? void 0 : O.docs) == null
				? void 0
				: R.source),
		},
	},
};
var U, B, D;
o.parameters = {
	...o.parameters,
	docs: {
		...((U = o.parameters) == null ? void 0 : U.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...((D = (B = o.parameters) == null ? void 0 : B.docs) == null
				? void 0
				: D.source),
		},
	},
};
var E, W, _;
d.parameters = {
	...d.parameters,
	docs: {
		...((E = d.parameters) == null ? void 0 : E.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...((_ = (W = d.parameters) == null ? void 0 : W.docs) == null
				? void 0
				: _.source),
		},
	},
};
var G, M, Q;
m.parameters = {
	...m.parameters,
	docs: {
		...((G = m.parameters) == null ? void 0 : G.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...((Q = (M = m.parameters) == null ? void 0 : M.docs) == null
				? void 0
				: Q.source),
		},
	},
};
var Y, q, J;
x.parameters = {
	...x.parameters,
	docs: {
		...((Y = x.parameters) == null ? void 0 : Y.docs),
		source: {
			originalSource: "args => <List {...args} />",
			...((J = (q = x.parameters) == null ? void 0 : q.docs) == null
				? void 0
				: J.source),
		},
	},
};
const oe = [
	"DefaultList",
	"UnstyledList",
	"NestedList",
	"OrderedList",
	"HorizontalList",
	"WithIconList",
	"AdvancedList",
];
export {
	x as AdvancedList,
	c as DefaultList,
	d as HorizontalList,
	n as NestedList,
	o as OrderedList,
	l as UnstyledList,
	m as WithIconList,
	oe as __namedExportsOrder,
	ne as default,
};
