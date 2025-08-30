import {
	g as b,
	c as E,
	u as f,
	r as k,
	t as v,
	a as w,
} from "./create-theme-ol-6nsx3.js";
import { r as c, j as e } from "./iframe-ByD-PdrA.js";
import { T as H } from "./Tooltip-rMIAfTv1.js";
import "./preload-helper-Dp1pzeXC.js";
import "./floating-ui.react-Dgys7JzL.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
import "./use-floating-DojRaj4Q.js";
function C(r, t) {
	var o;
	t(!0),
		(o = navigator == null ? void 0 : navigator.clipboard) == null ||
			o
				.writeText(r)
				.then(() => {
					console.log("Copy Successfull");
				})
				.catch((d) => {
					console.error("Failed to Copy text: ", d), t(!1);
				}),
		setTimeout(() => t(!1), 4e3);
}
const T = E({
		button: {
			base: "inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
			label: "text-center text-sm font-medium text-white sm:w-auto",
		},
		withIcon: {
			base: "absolute end-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
			icon: {
				defaultIcon: "h-4 w-4",
				successIcon: "h-4 w-4 text-blue-700 dark:text-blue-500",
			},
		},
		withIconText: {
			base: "absolute end-2.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
			icon: {
				defaultIcon: "me-1.5 h-3 w-3",
				successIcon: "me-1.5 h-3 w-3 text-blue-700 dark:text-blue-500",
			},
			label: {
				base: "inline-flex items-center",
				defaultText: "text-xs font-semibold",
				successText: "text-xs font-semibold text-blue-700 dark:text-blue-500",
			},
		},
	}),
	N = c.forwardRef((r, t) => {
		var i, s, n;
		const [o, d] = c.useState(!1),
			a = f(),
			l = w(
				[
					T.button,
					(s = (i = a.theme) == null ? void 0 : i.clipboard) == null
						? void 0
						: s.button,
					r.theme,
				],
				[b(a.clearTheme, "clipboard.button"), r.clearTheme],
				[b(a.applyTheme, "clipboard.button"), r.applyTheme],
			),
			{
				className: u,
				valueToCopy: p,
				label: m,
				...g
			} = k(r, (n = a.props) == null ? void 0 : n.clipboard);
		return e.jsx(H, {
			content: o ? "Copied" : "Copy to clipboard",
			className: "[&_*]:cursor-pointer",
			children: e.jsx("button", {
				className: v(l.base, u),
				onClick: () => C(p, d),
				...g,
				ref: t,
				children: e.jsx("span", { className: l.label, children: m }),
			}),
		});
	});
N.displayName = "Clipboard";
const I = c.forwardRef((r, t) =>
	e.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 448 512",
		ref: t,
		...r,
		children: e.jsx("path", {
			stroke: "none",
			d: "M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z",
		}),
	}),
);
I.displayName = "CheckIcon";
const j = c.forwardRef((r, t) =>
	e.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 384 512",
		ref: t,
		...r,
		children: e.jsx("path", {
			stroke: "none",
			d: "M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128v320c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64h-37.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM72 272a24 24 0 1 1 48 0 24 24 0 1 1-48 0zm104-16h128c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zM72 368a24 24 0 1 1 48 0 24 24 0 1 1-48 0zm88 0c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16z",
		}),
	}),
);
j.displayName = "ClipboardListIcon";
const _ = c.forwardRef((r, t) => {
	var i, s, n;
	const [o, d] = c.useState(!1),
		a = f(),
		l = w(
			[
				T.withIcon,
				(s = (i = a.theme) == null ? void 0 : i.clipboard) == null
					? void 0
					: s.withIcon,
				r.theme,
			],
			[b(a.clearTheme, "clipboard.withIcon"), r.clearTheme],
			[b(a.applyTheme, "clipboard.withIcon"), r.applyTheme],
		),
		{
			valueToCopy: u,
			icon: p = j,
			className: m,
			...g
		} = k(r, (n = a.props) == null ? void 0 : n.clipboardWithIcon);
	return e.jsx("button", {
		className: v(l.base, m),
		onClick: () => C(u, d),
		...g,
		ref: t,
		children: o
			? e.jsx(I, { "aria-hidden": !0, className: l.icon.successIcon })
			: e.jsx(p, { "aria-hidden": !0, className: l.icon.defaultIcon }),
	});
});
_.displayName = "Clipboard.WithIcon";
const D = c.forwardRef((r, t) => {
	var s, n, W;
	const [o, d] = c.useState(!1),
		a = f(),
		l = w(
			[
				T.withIconText,
				(n = (s = a.theme) == null ? void 0 : s.clipboard) == null
					? void 0
					: n.withIconText,
				r.theme,
			],
			[b(a.clearTheme, "clipboard.withIconText"), r.clearTheme],
			[b(a.applyTheme, "clipboard.withIconText"), r.applyTheme],
		),
		{
			valueToCopy: u,
			icon: p = j,
			label: m = "Copy",
			className: g,
			...i
		} = k(r, (W = a.props) == null ? void 0 : W.clipboardWithIconText);
	return e.jsx("button", {
		className: v(l.base, g),
		onClick: () => C(u, d),
		...i,
		ref: t,
		children: o
			? e.jsxs("span", {
					className: l.label.base,
					children: [
						e.jsx(I, { "aria-hidden": !0, className: l.icon.successIcon }),
						e.jsx("span", {
							className: l.label.successText,
							children: "Copied",
						}),
					],
				})
			: e.jsxs("span", {
					className: l.label.base,
					children: [
						e.jsx(p, { "aria-hidden": !0, className: l.icon.defaultIcon }),
						e.jsx("span", { className: l.label.defaultText, children: m }),
					],
				}),
	});
});
D.displayName = "Clipboard.WithIconText";
const $ = { title: "Components/Clipboard", component: N },
	B = () =>
		e.jsxs("div", {
			className: "grid w-full max-w-[23rem] grid-cols-8 gap-2",
			children: [
				e.jsx("label", {
					htmlFor: "npm-install",
					className: "sr-only",
					children: "Label",
				}),
				e.jsx("input", {
					id: "npm-install",
					type: "text",
					className:
						"col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder:text-gray-400",
					value: "npm install flowbite-react",
					disabled: !0,
					readOnly: !0,
				}),
				e.jsx(N, { valueToCopy: "npm install flowbite-react", label: "Copy" }),
			],
		}),
	x = B.bind({}),
	V = () =>
		e.jsx("div", {
			className: "grid w-full max-w-64",
			children: e.jsxs("div", {
				className: "relative",
				children: [
					e.jsx("label", {
						htmlFor: "npm-install",
						className: "sr-only",
						children: "Label",
					}),
					e.jsx("input", {
						id: "npm-install",
						type: "text",
						className:
							"col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder:text-gray-400",
						value: "npm install flowbite-react",
						disabled: !0,
						readOnly: !0,
					}),
					e.jsx(_, { valueToCopy: "npm install flowbite-react" }),
				],
			}),
		}),
	y = V.bind({}),
	q = () =>
		e.jsx("div", {
			className: "grid w-full max-w-80",
			children: e.jsxs("div", {
				className: "relative",
				children: [
					e.jsx("label", {
						htmlFor: "npm-install",
						className: "sr-only",
						children: "Label",
					}),
					e.jsx("input", {
						id: "npm-install",
						type: "text",
						className:
							"col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-4 text-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder:text-gray-400",
						value: "npm install flowbite-react",
						disabled: !0,
						readOnly: !0,
					}),
					e.jsx(D, { valueToCopy: "npm install flowbite-react" }),
				],
			}),
		}),
	h = q.bind({});
var L, z, F;
x.parameters = {
	...x.parameters,
	docs: {
		...((L = x.parameters) == null ? void 0 : L.docs),
		source: {
			originalSource: `() => <div className="grid w-full max-w-[23rem] grid-cols-8 gap-2">\r
        <label htmlFor="npm-install" className="sr-only">\r
            Label\r
        </label>\r
        <input id="npm-install" type="text" className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder:text-gray-400" value="npm install flowbite-react" disabled readOnly />\r
        <Clipboard valueToCopy="npm install flowbite-react" label="Copy" />\r
    </div>`,
			...((F = (z = x.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: F.source),
		},
	},
};
var O, R, S;
y.parameters = {
	...y.parameters,
	docs: {
		...((O = y.parameters) == null ? void 0 : O.docs),
		source: {
			originalSource: `() => <div className="grid w-full max-w-64">\r
        <div className="relative">\r
            <label htmlFor="npm-install" className="sr-only">\r
                Label\r
            </label>\r
            <input id="npm-install" type="text" className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder:text-gray-400" value="npm install flowbite-react" disabled readOnly />\r
            <ClipboardWithIcon valueToCopy="npm install flowbite-react" />\r
        </div>\r
    </div>`,
			...((S = (R = y.parameters) == null ? void 0 : R.docs) == null
				? void 0
				: S.source),
		},
	},
};
var M, J, P;
h.parameters = {
	...h.parameters,
	docs: {
		...((M = h.parameters) == null ? void 0 : M.docs),
		source: {
			originalSource: `() => <div className="grid w-full max-w-80">\r
        <div className="relative">\r
            <label htmlFor="npm-install" className="sr-only">\r
                Label\r
            </label>\r
            <input id="npm-install" type="text" className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-4 text-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:placeholder:text-gray-400" value="npm install flowbite-react" disabled readOnly />\r
            <ClipboardWithIconText valueToCopy="npm install flowbite-react" />\r
        </div>\r
    </div>`,
			...((P = (J = h.parameters) == null ? void 0 : J.docs) == null
				? void 0
				: P.source),
		},
	},
};
const ee = ["Default", "CopyIcon", "CopyIconText"];
export {
	y as CopyIcon,
	h as CopyIconText,
	x as Default,
	ee as __namedExportsOrder,
	$ as default,
};
