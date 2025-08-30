import { B as j } from "./Button-BrGC8bZN.js";
import { C as xe } from "./Checkbox-CDZDOhSJ.js";
import {
	r as E,
	a as F,
	u as M,
	t as N,
	g as o,
	c as pe,
} from "./create-theme-ol-6nsx3.js";
import {
	a as ae,
	F as ce,
	d as de,
	g as he,
	e as ie,
	c as le,
	f as me,
	b as ne,
	u as se,
} from "./floating-ui.react-Dgys7JzL.js";
import { j as e, r as m } from "./iframe-ByD-PdrA.js";
import { l as re } from "./index-CK8OVH7d.js";
import { L as S } from "./Label-5JgZOHrz.js";
import { T as U } from "./TextInput-C8jx2EYr.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
const V = m.createContext(void 0);
function O() {
	const t = m.useContext(V);
	if (!t)
		throw new Error(
			"useModalContext should be used within the ModalContext provider!",
		);
	return t;
}
const P = pe({
		root: {
			base: "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
			show: { on: "flex bg-gray-900/50 dark:bg-gray-900/80", off: "hidden" },
			sizes: {
				sm: "max-w-sm",
				md: "max-w-md",
				lg: "max-w-lg",
				xl: "max-w-xl",
				"2xl": "max-w-2xl",
				"3xl": "max-w-3xl",
				"4xl": "max-w-4xl",
				"5xl": "max-w-5xl",
				"6xl": "max-w-6xl",
				"7xl": "max-w-7xl",
			},
			positions: {
				"top-left": "items-start justify-start",
				"top-center": "items-start justify-center",
				"top-right": "items-start justify-end",
				"center-left": "items-center justify-start",
				center: "items-center justify-center",
				"center-right": "items-center justify-end",
				"bottom-right": "items-end justify-end",
				"bottom-center": "items-end justify-center",
				"bottom-left": "items-end justify-start",
			},
		},
		content: {
			base: "relative h-full w-full p-4 md:h-auto",
			inner:
				"relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700",
		},
		body: { base: "flex-1 overflow-auto p-6", popup: "pt-0" },
		header: {
			base: "flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
			popup: "border-b-0 p-2",
			title: "text-xl font-medium text-gray-900 dark:text-white",
			close: {
				base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
				icon: "h-5 w-5",
			},
		},
		footer: {
			base: "flex items-center space-x-2 rounded-b border-gray-200 p-6 dark:border-gray-600",
			popup: "border-t",
		},
	}),
	_ = m.forwardRef((t, l) => {
		var D, H;
		const [r, f] = m.useState(void 0),
			i = M(),
			s = F(
				[P, (D = i.theme) == null ? void 0 : D.modal, t.theme],
				[o(i.clearTheme, "modal"), t.clearTheme],
				[o(i.applyTheme, "modal"), t.applyTheme],
			),
			{
				children: a,
				className: d,
				dismissible: c = !1,
				onClose: n,
				popup: h,
				position: p = "center",
				root: x,
				show: v,
				size: R = "2xl",
				initialFocus: B,
				...g
			} = E(t, (H = i.props) == null ? void 0 : H.modal),
			{ context: u } = se({ open: v, onOpenChange: () => n && n() }),
			k = ae([u.refs.setFloating, l]),
			C = ne(u),
			ee = le(u, { outsidePressEvent: "mousedown", enabled: c }),
			te = de(u),
			{ getFloatingProps: oe } = ie([C, ee, te]);
		return v
			? e.jsx(V.Provider, {
					value: {
						theme: t.theme,
						clearTheme: t.clearTheme,
						applyTheme: t.applyTheme,
						popup: h,
						onClose: n,
						setHeaderId: f,
					},
					children: e.jsx(ce, {
						root: x,
						children: e.jsx(me, {
							lockScroll: !0,
							"data-testid": "modal-overlay",
							className: N(
								s.root.base,
								s.root.positions[p],
								v ? s.root.show.on : s.root.show.off,
								d,
							),
							...g,
							children: e.jsx(he, {
								context: u,
								initialFocus: B,
								children: e.jsx("div", {
									ref: k,
									...oe(g),
									"aria-labelledby": r,
									className: N(s.content.base, s.root.sizes[R]),
									children: e.jsx("div", {
										className: s.content.inner,
										children: a,
									}),
								}),
							}),
						}),
					}),
				})
			: null;
	});
_.displayName = "Modal";
const I = m.forwardRef((t, l) => {
	var h, p, x;
	const { theme: r, clearTheme: f, applyTheme: i, popup: s } = O(),
		a = M(),
		d = F(
			[
				P.body,
				(p = (h = a.theme) == null ? void 0 : h.modal) == null
					? void 0
					: p.body,
				r == null ? void 0 : r.body,
				t.theme,
			],
			[o(a.clearTheme, "modal.body"), o(f, "body"), t.clearTheme],
			[o(a.applyTheme, "modal.body"), o(i, "body"), t.applyTheme],
		),
		{ className: c, ...n } = E(t, (x = a.props) == null ? void 0 : x.modalBody);
	return e.jsx("div", { ref: l, className: N(d.base, s && d.popup, c), ...n });
});
I.displayName = "ModalBody";
const Z = m.forwardRef((t, l) => {
	var h, p, x;
	const { theme: r, clearTheme: f, applyTheme: i, popup: s } = O(),
		a = M(),
		d = F(
			[
				P.footer,
				(p = (h = a.theme) == null ? void 0 : h.modal) == null
					? void 0
					: p.footer,
				r == null ? void 0 : r.footer,
				t.theme,
			],
			[o(a.clearTheme, "modal.footer"), o(f, "footer"), t.clearTheme],
			[o(a.applyTheme, "modal.footer"), o(i, "footer"), t.applyTheme],
		),
		{ className: c, ...n } = E(
			t,
			(x = a.props) == null ? void 0 : x.modalFooter,
		);
	return e.jsx("div", { ref: l, className: N(d.base, !s && d.popup, c), ...n });
});
Z.displayName = "ModalFooter";
const $ = m.forwardRef((t, l) =>
	e.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		viewBox: "0 0 24 24",
		ref: l,
		...t,
		children: e.jsx("path", {
			strokeLinecap: "round",
			strokeLinejoin: "round",
			d: "M6 18 18 6M6 6l12 12",
		}),
	}),
);
$.displayName = "OutlineXIcon";
const L = m.forwardRef((t, l) => {
	var u, k, C;
	const {
			theme: r,
			clearTheme: f,
			applyTheme: i,
			popup: s,
			onClose: a,
			setHeaderId: d,
		} = O(),
		c = M(),
		n = F(
			[
				P.header,
				(k = (u = c.theme) == null ? void 0 : u.modal) == null
					? void 0
					: k.header,
				r == null ? void 0 : r.header,
				t.theme,
			],
			[o(c.clearTheme, "modal.header"), o(f, "header"), t.clearTheme],
			[o(c.applyTheme, "modal.header"), o(i, "header"), t.applyTheme],
		),
		{
			as: h = "h3",
			children: p,
			className: x,
			id: v,
			...R
		} = E(t, (C = c.props) == null ? void 0 : C.modalHeader),
		B = m.useId(),
		g = v || B;
	return (
		m.useLayoutEffect(() => (d(g), () => d(void 0)), [g, d]),
		e.jsxs("div", {
			ref: l,
			className: N(n.base, s && n.popup, x),
			...R,
			children: [
				e.jsx(h, { id: g, className: n.title, children: p }),
				e.jsx("button", {
					"aria-label": "Close",
					className: n.close.base,
					type: "button",
					onClick: a,
					children: e.jsx($, { "aria-hidden": !0, className: n.close.icon }),
				}),
			],
		})
	);
});
L.displayName = "ModalHeader";
const { action: w } = __STORYBOOK_MODULE_ACTIONS__,
	Me = { title: "Components/Modal", component: _, args: { show: !1 } },
	z = ({ children: t, ...l }) =>
		e.jsxs(e.Fragment, {
			children: [
				e.jsx(j, { onClick: w("open"), children: "Toggle modal" }),
				e.jsx(_, { onClose: w("close"), ...l, children: t }),
			],
		}),
	T = z.bind({});
T.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(L, { children: "Terms of Service" }),
			e.jsx(I, {
				children: e.jsxs("div", {
					className: "space-y-6",
					children: [
						e.jsx("p", {
							className:
								"text-base text-gray-500 leading-relaxed dark:text-gray-400",
							children:
								"With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.",
						}),
						e.jsx("p", {
							className:
								"text-base text-gray-500 leading-relaxed dark:text-gray-400",
							children:
								"The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.",
						}),
					],
				}),
			}),
			e.jsxs(Z, {
				children: [
					e.jsx(j, { onClick: w("close"), children: "I accept" }),
					e.jsx(j, { color: "gray", onClick: w("close"), children: "Decline" }),
				],
			}),
		],
	}),
};
const y = z.bind({});
y.storyName = "Pop-up modal";
y.args = {
	children: e.jsx(I, {
		children: e.jsxs("div", {
			className: "text-center",
			children: [
				e.jsx(re, {
					className: "mx-auto mb-4 size-14 text-gray-400 dark:text-gray-200",
				}),
				e.jsx("h3", {
					className:
						"mb-5 font-normal text-gray-500 text-lg dark:text-gray-400",
					children: "Are you sure you want to delete this product?",
				}),
				e.jsxs("div", {
					className: "flex justify-center gap-4",
					children: [
						e.jsx(j, {
							color: "red",
							onClick: w("close"),
							children: "Yes, I'm sure",
						}),
						e.jsx(j, {
							color: "gray",
							onClick: w("close"),
							children: "No, cancel",
						}),
					],
				}),
			],
		}),
	}),
};
const b = z.bind({});
b.storyName = "Form elements";
b.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(L, {}),
			e.jsx(I, {
				children: e.jsxs("div", {
					className: "space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8",
					children: [
						e.jsx("h3", {
							className: "font-medium text-gray-900 text-xl dark:text-white",
							children: "Sign in to our platform",
						}),
						e.jsxs("div", {
							children: [
								e.jsx("div", {
									className: "mb-2 block",
									children: e.jsx(S, {
										htmlFor: "email",
										children: "Your email",
									}),
								}),
								e.jsx(U, {
									id: "email",
									placeholder: "name@company.com",
									required: !0,
								}),
							],
						}),
						e.jsxs("div", {
							children: [
								e.jsx("div", {
									className: "mb-2 block",
									children: e.jsx(S, {
										htmlFor: "password",
										children: "Your password",
									}),
								}),
								e.jsx(U, { id: "password", type: "password", required: !0 }),
							],
						}),
						e.jsxs("div", {
							className: "flex justify-between",
							children: [
								e.jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										e.jsx(xe, { id: "remember" }),
										e.jsx(S, { htmlFor: "remember", children: "Remember me" }),
									],
								}),
								e.jsx("a", {
									href: "/modal",
									className:
										"text-cyan-700 text-sm hover:underline dark:text-cyan-500",
									children: "Lost Password?",
								}),
							],
						}),
						e.jsx("div", {
							className: "w-full",
							children: e.jsx(j, { children: "Log in to your account" }),
						}),
						e.jsxs("div", {
							className: "font-medium text-gray-500 text-sm dark:text-gray-300",
							children: [
								"Not registered? ",
								e.jsx("a", {
									href: "/modal",
									className: "text-cyan-700 hover:underline dark:text-cyan-500",
									children: "Create account",
								}),
							],
						}),
					],
				}),
			}),
		],
	}),
};
var A, X, Y;
T.parameters = {
	...T.parameters,
	docs: {
		...((A = T.parameters) == null ? void 0 : A.docs),
		source: {
			originalSource: `({
  children,
  ...rest
}): JSX.Element => {
  return <>\r
            <Button onClick={action("open")}>Toggle modal</Button>\r
            <Modal onClose={action("close")} {...rest}>\r
                {children}\r
            </Modal>\r
        </>;
}`,
			...((Y = (X = T.parameters) == null ? void 0 : X.docs) == null
				? void 0
				: Y.source),
		},
	},
};
var q, J, G;
y.parameters = {
	...y.parameters,
	docs: {
		...((q = y.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: `({
  children,
  ...rest
}): JSX.Element => {
  return <>\r
            <Button onClick={action("open")}>Toggle modal</Button>\r
            <Modal onClose={action("close")} {...rest}>\r
                {children}\r
            </Modal>\r
        </>;
}`,
			...((G = (J = y.parameters) == null ? void 0 : J.docs) == null
				? void 0
				: G.source),
		},
	},
};
var W, K, Q;
b.parameters = {
	...b.parameters,
	docs: {
		...((W = b.parameters) == null ? void 0 : W.docs),
		source: {
			originalSource: `({
  children,
  ...rest
}): JSX.Element => {
  return <>\r
            <Button onClick={action("open")}>Toggle modal</Button>\r
            <Modal onClose={action("close")} {...rest}>\r
                {children}\r
            </Modal>\r
        </>;
}`,
			...((Q = (K = b.parameters) == null ? void 0 : K.docs) == null
				? void 0
				: Q.source),
		},
	},
};
const Fe = ["Default", "PopUp", "FormElements"];
export {
	T as Default,
	b as FormElements,
	y as PopUp,
	Fe as __namedExportsOrder,
	Me as default,
};
