import { C as Z } from "./chevron-down-icon-CQF9w6vi.js";
import {
	u as I,
	a as P,
	g as p,
	r as S,
	t as v,
	c as Y,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as l } from "./iframe-ByD-PdrA.js";
import { H as V, a as X } from "./index-CK8OVH7d.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const j = Y({
	root: {
		base: "divide-y divide-gray-200 border-gray-200 dark:divide-gray-700 dark:border-gray-700",
		flush: { off: "rounded-lg border", on: "border-b" },
	},
	content: {
		base: "p-5 first:rounded-t-lg last:rounded-b-lg dark:bg-gray-900",
	},
	title: {
		arrow: { base: "h-6 w-6 shrink-0", open: { off: "", on: "rotate-180" } },
		base: "flex w-full items-center justify-between p-5 text-left font-medium text-gray-500 first:rounded-t-lg last:rounded-b-lg dark:text-gray-400",
		flush: {
			off: "hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-800",
			on: "bg-transparent dark:bg-transparent",
		},
		heading: "",
		open: {
			off: "",
			on: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white",
		},
	},
});
function U(n) {
	var w, f, O;
	const r = I(),
		t = P(
			[
				j.root,
				(f = (w = r.theme) == null ? void 0 : w.accordion) == null
					? void 0
					: f.root,
				n.theme,
			],
			[p(r.clearTheme, "accordion.root"), n.clearTheme],
			[p(r.applyTheme, "accordion.root"), n.applyTheme],
		),
		{
			alwaysOpen: i = !1,
			arrowIcon: s = Z,
			children: c,
			flush: o = !1,
			collapseAll: a = !1,
			className: d,
			...N
		} = S(n, (O = r.props) == null ? void 0 : O.accordion),
		[g, F] = l.useState(a ? -1 : 0),
		b = l.useMemo(
			() =>
				l.Children.map(c, (Q, C) =>
					l.cloneElement(Q, {
						alwaysOpen: i,
						arrowIcon: s,
						flush: o,
						isOpen: g === C,
						setOpen: () => F(g === C ? -1 : C),
					}),
				),
			[i, s, c, o, g],
		);
	return e.jsx("div", {
		className: v(t.base, t.flush[o ? "on" : "off"], d),
		"data-testid": "flowbite-accordion",
		...N,
		children: b,
	});
}
U.displayName = "Accordion";
const J = l.createContext(void 0);
function K() {
	const n = l.useContext(J);
	if (!n)
		throw new Error(
			"useAccordionContext should be used within the AccordionPanelContext provider!",
		);
	return n;
}
function x(n) {
	var o, a, d;
	const { isOpen: r } = K(),
		t = I(),
		i = P(
			[
				j.content,
				(a = (o = t.theme) == null ? void 0 : o.accordion) == null
					? void 0
					: a.content,
				n.theme,
			],
			[p(t.clearTheme, "accordion.content"), n.clearTheme],
			[p(t.applyTheme, "accordion.content"), n.applyTheme],
		),
		{ className: s, ...c } = S(
			n,
			(d = t.props) == null ? void 0 : d.accordionContent,
		);
	return e.jsx("div", {
		className: v(i.base, s),
		"data-testid": "flowbite-accordion-content",
		hidden: !r,
		...c,
	});
}
x.displayName = "AccordionContent";
function A({ children: n, ...r }) {
	const { alwaysOpen: t } = r,
		[i, s] = l.useState(r.isOpen),
		c = t ? { ...r, isOpen: i, setOpen: () => s(!i) } : r;
	return e.jsx(J.Provider, { value: c, children: n });
}
A.displayName = "AccordionPanel";
function T(n) {
	var b, w, f;
	const { arrowIcon: r, flush: t, isOpen: i, setOpen: s } = K(),
		c = () => typeof s < "u" && s(),
		o = I(),
		a = P(
			[
				j.title,
				(w = (b = o.theme) == null ? void 0 : b.accordion) == null
					? void 0
					: w.title,
				n.theme,
			],
			[p(o.clearTheme, "accordion.title"), n.clearTheme],
			[p(o.applyTheme, "accordion.title"), n.applyTheme],
		),
		{
			as: d = "h2",
			children: N,
			className: g,
			...F
		} = S(n, (f = o.props) == null ? void 0 : f.accordionTitle);
	return e.jsxs("button", {
		className: v(
			a.base,
			a.flush[t ? "on" : "off"],
			a.open[i ? "on" : "off"],
			g,
		),
		onClick: c,
		type: "button",
		...F,
		children: [
			e.jsx(d, {
				className: a.heading,
				"data-testid": "flowbite-accordion-heading",
				children: N,
			}),
			r &&
				e.jsx(r, {
					"aria-hidden": !0,
					className: v(a.arrow.base, a.arrow.open[i ? "on" : "off"]),
					"data-testid": "flowbite-accordion-arrow",
				}),
		],
	});
}
T.displayName = "AccordionTitle";
const ae = {
		title: "Components/Accordion",
		component: U,
		args: { alwaysOpen: !1, flush: !1 },
	},
	k = (n) =>
		e.jsxs(U, {
			arrowIcon: V,
			...n,
			children: [
				e.jsxs(A, {
					children: [
						e.jsx(T, { children: "What is Flowbite?" }),
						e.jsxs(x, {
							children: [
								e.jsx("p", {
									className: "mb-2 text-gray-500 dark:text-gray-400",
									children:
										"Flowbite is an open-source library of interactive components built on top of Tailwind CSS including buttons, dropdowns, modals, navbars, and more.",
								}),
								e.jsxs("p", {
									className: "text-gray-500 dark:text-gray-400",
									children: [
										"Check out this guide to learn how to ",
										e.jsx("a", {
											href: "https://flowbite.com/docs/getting-started/introduction/",
											className:
												"text-cyan-600 hover:underline dark:text-cyan-500",
											children: "get started",
										}),
										" and start developing websites even faster with components on top of Tailwind CSS.",
									],
								}),
							],
						}),
					],
				}),
				e.jsxs(A, {
					children: [
						e.jsx(T, { children: "Is there a Figma file available?" }),
						e.jsxs(x, {
							children: [
								e.jsx("p", {
									className: "mb-2 text-gray-500 dark:text-gray-400",
									children:
										"Flowbite is first conceptualized and designed using the Figma software so everything you see in the library has a design equivalent in our Figma file.",
								}),
								e.jsxs("p", {
									className: "text-gray-500 dark:text-gray-400",
									children: [
										"Check out the ",
										e.jsx("a", {
											href: "https://flowbite.com/figma/",
											className:
												"text-cyan-600 hover:underline dark:text-cyan-500",
											children: "Figma design system",
										}),
										" based on the utility classes from Tailwind CSS and components from Flowbite.",
									],
								}),
							],
						}),
					],
				}),
				e.jsxs(A, {
					children: [
						e.jsx(T, {
							children:
								"What are the differences between Flowbite and Tailwind UI?",
						}),
						e.jsxs(x, {
							children: [
								e.jsx("p", {
									className: "mb-2 text-gray-500 dark:text-gray-400",
									children:
										"The main difference is that the core components from Flowbite are open source under the MIT license, whereas Tailwind UI is a paid product. Another difference is that Flowbite relies on smaller and standalone components, whereas Tailwind UI offers sections of pages.",
								}),
								e.jsx("p", {
									className: "mb-2 text-gray-500 dark:text-gray-400",
									children:
										"However, we actually recommend using both Flowbite, Flowbite Pro, and even Tailwind UI as there is no technical reason stopping you from using the best of two worlds.",
								}),
								e.jsx("p", {
									className: "mb-2 text-gray-500 dark:text-gray-400",
									children: "Learn more about these technologies:",
								}),
								e.jsxs("ul", {
									className: "list-disc pl-5 text-gray-500 dark:text-gray-400",
									children: [
										e.jsx("li", {
											children: e.jsx("a", {
												href: "https://flowbite.com/pro/",
												className:
													"text-cyan-600 hover:underline dark:text-cyan-500",
												children: "Flowbite Pro",
											}),
										}),
										e.jsx("li", {
											children: e.jsx("a", {
												href: "https://tailwindui.com/",
												rel: "nofollow",
												className:
													"text-cyan-600 hover:underline dark:text-cyan-500",
												children: "Tailwind UI",
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
	h = k.bind({});
h.storyName = "Always open";
h.args = { alwaysOpen: !0 };
const y = k.bind({}),
	u = k.bind({});
u.args = { flush: !0 };
const m = k.bind({});
m.storyName = "With arrow icon";
m.args = { arrowIcon: X };
var H, W, D;
h.parameters = {
	...h.parameters,
	docs: {
		...((H = h.parameters) == null ? void 0 : H.docs),
		source: {
			originalSource: `args => <Accordion arrowIcon={HiChevronDown} {...args}>\r
        <AccordionPanel>\r
            <AccordionTitle>What is Flowbite?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is an open-source library of interactive components built on\r
                    top of Tailwind CSS including buttons, dropdowns, modals, navbars, and\r
                    more.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out this guide to learn how to&nbsp;\r
                    <a href="https://flowbite.com/docs/getting-started/introduction/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        get started\r
                    </a>\r
                    &nbsp;and start developing websites even faster with components on top\r
                    of Tailwind CSS.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>Is there a Figma file available?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is first conceptualized and designed using the Figma software\r
                    so everything you see in the library has a design equivalent in our\r
                    Figma file.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out the&nbsp;\r
                    <a href="https://flowbite.com/figma/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Figma design system\r
                    </a>\r
                    &nbsp;based on the utility classes from Tailwind CSS and components\r
                    from Flowbite.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>\r
                What are the differences between Flowbite and Tailwind UI?\r
            </AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    The main difference is that the core components from Flowbite are open\r
                    source under the MIT license, whereas Tailwind UI is a paid product.\r
                    Another difference is that Flowbite relies on smaller and standalone\r
                    components, whereas Tailwind UI offers sections of pages.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    However, we actually recommend using both Flowbite, Flowbite Pro, and\r
                    even Tailwind UI as there is no technical reason stopping you from\r
                    using the best of two worlds.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Learn more about these technologies:\r
                </p>\r
                <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">\r
                    <li>\r
                        <a href="https://flowbite.com/pro/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Flowbite Pro\r
                        </a>\r
                    </li>\r
                    <li>\r
                        <a href="https://tailwindui.com/" rel="nofollow" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Tailwind UI\r
                        </a>\r
                    </li>\r
                </ul>\r
            </AccordionContent>\r
        </AccordionPanel>\r
    </Accordion>`,
			...((D = (W = h.parameters) == null ? void 0 : W.docs) == null
				? void 0
				: D.source),
		},
	},
};
var M, q, z;
y.parameters = {
	...y.parameters,
	docs: {
		...((M = y.parameters) == null ? void 0 : M.docs),
		source: {
			originalSource: `args => <Accordion arrowIcon={HiChevronDown} {...args}>\r
        <AccordionPanel>\r
            <AccordionTitle>What is Flowbite?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is an open-source library of interactive components built on\r
                    top of Tailwind CSS including buttons, dropdowns, modals, navbars, and\r
                    more.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out this guide to learn how to&nbsp;\r
                    <a href="https://flowbite.com/docs/getting-started/introduction/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        get started\r
                    </a>\r
                    &nbsp;and start developing websites even faster with components on top\r
                    of Tailwind CSS.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>Is there a Figma file available?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is first conceptualized and designed using the Figma software\r
                    so everything you see in the library has a design equivalent in our\r
                    Figma file.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out the&nbsp;\r
                    <a href="https://flowbite.com/figma/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Figma design system\r
                    </a>\r
                    &nbsp;based on the utility classes from Tailwind CSS and components\r
                    from Flowbite.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>\r
                What are the differences between Flowbite and Tailwind UI?\r
            </AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    The main difference is that the core components from Flowbite are open\r
                    source under the MIT license, whereas Tailwind UI is a paid product.\r
                    Another difference is that Flowbite relies on smaller and standalone\r
                    components, whereas Tailwind UI offers sections of pages.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    However, we actually recommend using both Flowbite, Flowbite Pro, and\r
                    even Tailwind UI as there is no technical reason stopping you from\r
                    using the best of two worlds.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Learn more about these technologies:\r
                </p>\r
                <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">\r
                    <li>\r
                        <a href="https://flowbite.com/pro/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Flowbite Pro\r
                        </a>\r
                    </li>\r
                    <li>\r
                        <a href="https://tailwindui.com/" rel="nofollow" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Tailwind UI\r
                        </a>\r
                    </li>\r
                </ul>\r
            </AccordionContent>\r
        </AccordionPanel>\r
    </Accordion>`,
			...((z = (q = y.parameters) == null ? void 0 : q.docs) == null
				? void 0
				: z.source),
		},
	},
};
var E, L, _;
u.parameters = {
	...u.parameters,
	docs: {
		...((E = u.parameters) == null ? void 0 : E.docs),
		source: {
			originalSource: `args => <Accordion arrowIcon={HiChevronDown} {...args}>\r
        <AccordionPanel>\r
            <AccordionTitle>What is Flowbite?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is an open-source library of interactive components built on\r
                    top of Tailwind CSS including buttons, dropdowns, modals, navbars, and\r
                    more.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out this guide to learn how to&nbsp;\r
                    <a href="https://flowbite.com/docs/getting-started/introduction/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        get started\r
                    </a>\r
                    &nbsp;and start developing websites even faster with components on top\r
                    of Tailwind CSS.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>Is there a Figma file available?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is first conceptualized and designed using the Figma software\r
                    so everything you see in the library has a design equivalent in our\r
                    Figma file.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out the&nbsp;\r
                    <a href="https://flowbite.com/figma/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Figma design system\r
                    </a>\r
                    &nbsp;based on the utility classes from Tailwind CSS and components\r
                    from Flowbite.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>\r
                What are the differences between Flowbite and Tailwind UI?\r
            </AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    The main difference is that the core components from Flowbite are open\r
                    source under the MIT license, whereas Tailwind UI is a paid product.\r
                    Another difference is that Flowbite relies on smaller and standalone\r
                    components, whereas Tailwind UI offers sections of pages.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    However, we actually recommend using both Flowbite, Flowbite Pro, and\r
                    even Tailwind UI as there is no technical reason stopping you from\r
                    using the best of two worlds.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Learn more about these technologies:\r
                </p>\r
                <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">\r
                    <li>\r
                        <a href="https://flowbite.com/pro/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Flowbite Pro\r
                        </a>\r
                    </li>\r
                    <li>\r
                        <a href="https://tailwindui.com/" rel="nofollow" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Tailwind UI\r
                        </a>\r
                    </li>\r
                </ul>\r
            </AccordionContent>\r
        </AccordionPanel>\r
    </Accordion>`,
			...((_ = (L = u.parameters) == null ? void 0 : L.docs) == null
				? void 0
				: _.source),
		},
	},
};
var R, B, G;
m.parameters = {
	...m.parameters,
	docs: {
		...((R = m.parameters) == null ? void 0 : R.docs),
		source: {
			originalSource: `args => <Accordion arrowIcon={HiChevronDown} {...args}>\r
        <AccordionPanel>\r
            <AccordionTitle>What is Flowbite?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is an open-source library of interactive components built on\r
                    top of Tailwind CSS including buttons, dropdowns, modals, navbars, and\r
                    more.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out this guide to learn how to&nbsp;\r
                    <a href="https://flowbite.com/docs/getting-started/introduction/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        get started\r
                    </a>\r
                    &nbsp;and start developing websites even faster with components on top\r
                    of Tailwind CSS.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>Is there a Figma file available?</AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Flowbite is first conceptualized and designed using the Figma software\r
                    so everything you see in the library has a design equivalent in our\r
                    Figma file.\r
                </p>\r
                <p className="text-gray-500 dark:text-gray-400">\r
                    Check out the&nbsp;\r
                    <a href="https://flowbite.com/figma/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Figma design system\r
                    </a>\r
                    &nbsp;based on the utility classes from Tailwind CSS and components\r
                    from Flowbite.\r
                </p>\r
            </AccordionContent>\r
        </AccordionPanel>\r
        <AccordionPanel>\r
            <AccordionTitle>\r
                What are the differences between Flowbite and Tailwind UI?\r
            </AccordionTitle>\r
            <AccordionContent>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    The main difference is that the core components from Flowbite are open\r
                    source under the MIT license, whereas Tailwind UI is a paid product.\r
                    Another difference is that Flowbite relies on smaller and standalone\r
                    components, whereas Tailwind UI offers sections of pages.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    However, we actually recommend using both Flowbite, Flowbite Pro, and\r
                    even Tailwind UI as there is no technical reason stopping you from\r
                    using the best of two worlds.\r
                </p>\r
                <p className="mb-2 text-gray-500 dark:text-gray-400">\r
                    Learn more about these technologies:\r
                </p>\r
                <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">\r
                    <li>\r
                        <a href="https://flowbite.com/pro/" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Flowbite Pro\r
                        </a>\r
                    </li>\r
                    <li>\r
                        <a href="https://tailwindui.com/" rel="nofollow" className="text-cyan-600 hover:underline dark:text-cyan-500">\r
                            Tailwind UI\r
                        </a>\r
                    </li>\r
                </ul>\r
            </AccordionContent>\r
        </AccordionPanel>\r
    </Accordion>`,
			...((G = (B = m.parameters) == null ? void 0 : B.docs) == null
				? void 0
				: G.source),
		},
	},
};
const ie = ["AlwaysOpen", "Default", "Flush", "WithArrowIcon"];
export {
	h as AlwaysOpen,
	y as Default,
	u as Flush,
	m as WithArrowIcon,
	ie as __namedExportsOrder,
	ae as default,
};
