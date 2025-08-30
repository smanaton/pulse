import { B as d } from "./Button-BrGC8bZN.js";
import {
	r as $,
	g as b,
	c as Q,
	u as W,
	a as Z,
} from "./create-theme-ol-6nsx3.js";
import { a as J, g as K } from "./floating-ui.react-Dgys7JzL.js";
import { j as e, r as s } from "./iframe-ByD-PdrA.js";
import { u as ee, a as re, g as te } from "./use-floating-DojRaj4Q.js";
import "./preload-helper-Dp1pzeXC.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
const ae = Q({
	base: "absolute z-20 inline-block w-max max-w-[100vw] rounded-lg border border-gray-200 bg-white shadow-sm outline-none dark:border-gray-600 dark:bg-gray-800",
	inner: "relative",
	content: "z-10 overflow-hidden rounded-[7px]",
	arrow: {
		base: "absolute z-0 h-2 w-2 rotate-45 border border-gray-200 bg-white mix-blend-lighten dark:border-gray-600 dark:bg-gray-800 dark:mix-blend-color",
		placement: "-4px",
	},
});
function p(t) {
	var x, y;
	const o = W(),
		r = Z(
			[ae, (x = o.theme) == null ? void 0 : x.popover, t.theme],
			[b(o.clearTheme, "popover"), t.clearTheme],
			[b(o.applyTheme, "popover"), t.applyTheme],
		),
		{
			children: a,
			content: I,
			arrow: T = !0,
			trigger: z = "click",
			initialOpen: B,
			open: A,
			onOpenChange: F,
			placement: S = "bottom",
			...E
		} = $(t, (y = o.props) == null ? void 0 : y.popover),
		[D, M] = s.useState(!!B),
		g = s.useRef(null),
		m = A ?? D,
		_ = ee({ open: m, placement: S, arrowRef: g, setOpen: F ?? M }),
		{
			floatingStyles: V,
			context: c,
			placement: L,
			middlewareData: { arrow: { x: U, y: X } = {} },
			refs: Y,
		} = _,
		{ getFloatingProps: q, getReferenceProps: v } = re({
			context: c,
			role: "dialog",
			trigger: z,
		}),
		G = a.ref,
		h = J([c.refs.setReference, G]);
	if (!s.isValidElement(a)) throw Error("Invalid target element");
	const H = s.useMemo(
		() =>
			s.cloneElement(
				a,
				v({
					ref: h,
					"data-testid": "flowbite-popover-target",
					...(a == null ? void 0 : a.props),
				}),
			),
		[a, h, v],
	);
	return e.jsxs(e.Fragment, {
		children: [
			H,
			m &&
				e.jsx(K, {
					context: c,
					modal: !0,
					children: e.jsx("div", {
						className: r.base,
						ref: Y.setFloating,
						"data-testid": "flowbite-popover",
						...E,
						style: V,
						...q(),
						children: e.jsxs("div", {
							className: r.inner,
							children: [
								T &&
									e.jsx("div", {
										className: r.arrow.base,
										"data-testid": "flowbite-popover-arrow",
										ref: g,
										style: {
											top: X ?? " ",
											left: U ?? " ",
											right: " ",
											bottom: " ",
											[te({ placement: L })]: r.arrow.placement,
										},
										children: " ",
									}),
								e.jsx("div", { className: r.content, children: I }),
							],
						}),
					}),
				}),
		],
	});
}
p.displayName = "Popover";
const ve = {
		title: "Components/Popover",
		component: p,
		argTypes: {
			trigger: {
				options: ["click", "hover"],
				control: { type: "inline-radio" },
				defaultValue: "click",
			},
		},
	},
	R = (t) =>
		e.jsx("div", {
			className: "flex h-96 w-full items-center justify-center",
			children: e.jsx(p, {
				...t,
				"aria-labelledby": "popover-title",
				content: e.jsxs("div", {
					className: "w-64 text-gray-500 text-sm dark:text-gray-400",
					children: [
						e.jsx("div", {
							className:
								"border-gray-200 border-b bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700",
							children: e.jsx("h3", {
								id: "popover-title",
								className: "font-semibold text-gray-900 dark:text-white",
								children: "Popover title",
							}),
						}),
						e.jsx("div", {
							className: "px-3 py-2",
							children: e.jsx("p", {
								children:
									"And here's some amazing content. It's very engaging. Right?",
							}),
						}),
					],
				}),
			}),
		}),
	n = R.bind({});
n.args = {
	placement: "top",
	onOpenChange: void 0,
	open: void 0,
	children: e.jsx(d, { children: "Default popover" }),
};
const i = R.bind({});
i.args = {
	initialOpen: !0,
	placement: "top",
	onOpenChange: void 0,
	open: void 0,
	children: e.jsx(d, { children: "Initial open" }),
};
const oe = (t) => {
		const [o, r] = s.useState(!1);
		return e.jsx("div", {
			className: "flex h-96 w-full items-center justify-center",
			children: e.jsx(p, {
				...t,
				"aria-labelledby": "popover-title",
				open: o,
				onOpenChange: r,
				content: e.jsxs("div", {
					className: "w-64 text-gray-500 text-sm dark:text-gray-400",
					children: [
						e.jsx("div", {
							className:
								"border-gray-200 border-b bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700",
							children: e.jsx("h3", {
								id: "popover-title",
								className: "font-semibold text-gray-900 dark:text-white",
								children: "Popover title",
							}),
						}),
						e.jsxs("div", {
							className: "space-y-4 px-3 py-2",
							children: [
								e.jsx("p", {
									children:
										"And here's some amazing content. It's very engaging. Right?",
								}),
								e.jsx(d, {
									color: "gray",
									onClick: () => r(!1),
									children: "Close",
								}),
							],
						}),
					],
				}),
				children: e.jsx(d, {
					onClick: () => r(!0),
					children: "Controlled popover",
				}),
			}),
		});
	},
	l = oe.bind({});
l.args = {
	initialOpen: !0,
	placement: "top",
	onOpenChange: void 0,
	open: void 0,
	children: e.jsx(d, { children: "Initial open" }),
};
var u, f, w;
n.parameters = {
	...n.parameters,
	docs: {
		...((u = n.parameters) == null ? void 0 : u.docs),
		source: {
			originalSource: `args => {
  return <div className="flex h-96 w-full items-center justify-center">\r
            <Popover {...args} aria-labelledby="popover-title" content={<div className="w-64 text-gray-500 text-sm dark:text-gray-400">\r
                        <div className="border-gray-200 border-b bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">\r
                            <h3 id="popover-title" className="font-semibold text-gray-900 dark:text-white">\r
                                Popover title\r
                            </h3>\r
                        </div>\r
                        <div className="px-3 py-2">\r
                            <p>And here's some amazing content. It's very engaging. Right?</p>\r
                        </div>\r
                    </div>} />\r
        </div>;
}`,
			...((w = (f = n.parameters) == null ? void 0 : f.docs) == null
				? void 0
				: w.source),
		},
	},
};
var k, j, N;
i.parameters = {
	...i.parameters,
	docs: {
		...((k = i.parameters) == null ? void 0 : k.docs),
		source: {
			originalSource: `args => {
  return <div className="flex h-96 w-full items-center justify-center">\r
            <Popover {...args} aria-labelledby="popover-title" content={<div className="w-64 text-gray-500 text-sm dark:text-gray-400">\r
                        <div className="border-gray-200 border-b bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">\r
                            <h3 id="popover-title" className="font-semibold text-gray-900 dark:text-white">\r
                                Popover title\r
                            </h3>\r
                        </div>\r
                        <div className="px-3 py-2">\r
                            <p>And here's some amazing content. It's very engaging. Right?</p>\r
                        </div>\r
                    </div>} />\r
        </div>;
}`,
			...((N = (j = i.parameters) == null ? void 0 : j.docs) == null
				? void 0
				: N.source),
		},
	},
};
var O, P, C;
l.parameters = {
	...l.parameters,
	docs: {
		...((O = l.parameters) == null ? void 0 : O.docs),
		source: {
			originalSource: `args => {
  const [open, setOpen] = useState(false);
  return <div className="flex h-96 w-full items-center justify-center">\r
            <Popover {...args} aria-labelledby="popover-title" open={open} onOpenChange={setOpen} content={<div className="w-64 text-gray-500 text-sm dark:text-gray-400">\r
                        <div className="border-gray-200 border-b bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">\r
                            <h3 id="popover-title" className="font-semibold text-gray-900 dark:text-white">\r
                                Popover title\r
                            </h3>\r
                        </div>\r
                        <div className="space-y-4 px-3 py-2">\r
                            <p>And here's some amazing content. It's very engaging. Right?</p>\r
                            <Button color="gray" onClick={() => setOpen(false)}>\r
                                Close\r
                            </Button>\r
                        </div>\r
                    </div>}>\r
                <Button onClick={() => setOpen(true)}>Controlled popover</Button>\r
            </Popover>\r
        </div>;
}`,
			...((C = (P = l.parameters) == null ? void 0 : P.docs) == null
				? void 0
				: C.source),
		},
	},
};
const he = ["Default", "InitialOpen", "Controlled"];
export {
	l as Controlled,
	n as Default,
	i as InitialOpen,
	he as __namedExportsOrder,
	ve as default,
};
