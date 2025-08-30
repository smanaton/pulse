import {
	c as A,
	t as D,
	a as I,
	u as j,
	r as R,
	g as r,
} from "./create-theme-ol-6nsx3.js";
import { r as l, j as t } from "./iframe-ByD-PdrA.js";
import { u as H } from "./index-CK8OVH7d.js";
import { X as M } from "./x-icon-B9aVM6AD.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const P = A({
		root: {
			base: "flex w-full max-w-xs items-center rounded-lg bg-white p-4 text-gray-500 shadow dark:bg-gray-800 dark:text-gray-400",
			closed: "opacity-0 ease-out",
		},
		toggle: {
			base: "-m-1.5 ml-auto inline-flex h-8 w-8 rounded-lg bg-white p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white",
			icon: "h-5 w-5 shrink-0",
		},
	}),
	S = l.createContext(void 0);
function O() {
	const e = l.useContext(S);
	if (!e)
		throw new Error(
			"useToastContext should be used within the ToastContext provider!",
		);
	return e;
}
const $ = {
		75: "duration-75",
		100: "duration-100",
		150: "duration-150",
		200: "duration-200",
		300: "duration-300",
		500: "duration-500",
		700: "duration-700",
		1e3: "duration-1000",
	},
	f = l.forwardRef((e, g) => {
		var i, u;
		const [s, h] = l.useState(!1),
			[c, x] = l.useState(!1),
			a = j(),
			m = I(
				[P, (i = a.theme) == null ? void 0 : i.toast, e.theme],
				[r(a.clearTheme, "toast"), e.clearTheme],
				[r(a.applyTheme, "toast"), e.applyTheme],
			),
			{
				className: T,
				duration: d = 300,
				...o
			} = R(e, (u = a.props) == null ? void 0 : u.toast);
		return c
			? null
			: t.jsx(S.Provider, {
					value: {
						theme: e.theme,
						clearTheme: e.clearTheme,
						applyTheme: e.applyTheme,
						duration: d,
						isClosed: s,
						isRemoved: c,
						setIsClosed: h,
						setIsRemoved: x,
					},
					children: t.jsx("div", {
						ref: g,
						"data-testid": "flowbite-toast",
						role: "alert",
						className: D(m.root.base, $[d], s && m.root.closed, T),
						...o,
					}),
				});
	});
f.displayName = "Toast";
const _ = l.forwardRef((e, g) => {
	var v, b, C;
	const {
			theme: s,
			clearTheme: h,
			applyTheme: c,
			duration: x,
			isClosed: a,
			isRemoved: m,
			setIsClosed: T,
			setIsRemoved: d,
		} = O(),
		o = j(),
		i = I(
			[
				P.toggle,
				(b = (v = o.theme) == null ? void 0 : v.toast) == null
					? void 0
					: b.toggle,
				s == null ? void 0 : s.toggle,
				e.theme,
			],
			[r(o.clearTheme, "toast.toggle"), r(h, "toggle"), e.clearTheme],
			[r(o.applyTheme, "toast.toggle"), r(c, "toggle"), e.applyTheme],
		),
		{
			className: u,
			onClick: y,
			onDismiss: p,
			xIcon: z = M,
			...E
		} = R(e, (C = o.props) == null ? void 0 : C.toastToggle);
	function X(F) {
		if ((y && y(F), p)) {
			p();
			return;
		}
		T(!a), setTimeout(() => d(!m), x);
	}
	return t.jsx("button", {
		ref: g,
		"aria-label": "Close",
		onClick: X,
		type: "button",
		className: D(i.base, u),
		...E,
		children: t.jsx(z, { "aria-hidden": !0, className: i.icon }),
	});
});
_.displayName = "ToastToggle";
const Q = { title: "Components/Toast", component: f },
	n = (e) =>
		t.jsxs(f, {
			...e,
			children: [
				t.jsx("div", {
					className:
						"inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200",
					children: t.jsx(H, { className: "size-5" }),
				}),
				t.jsx("div", {
					className: "ml-3 font-normal text-sm",
					children: "Set yourself free.",
				}),
				t.jsx(_, {}),
			],
		});
n.storyName = "Default";
n.__docgenInfo = { description: "", methods: [], displayName: "DefaultToast" };
var k, w, N;
n.parameters = {
	...n.parameters,
	docs: {
		...((k = n.parameters) == null ? void 0 : k.docs),
		source: {
			originalSource: `args => {
  return <Toast {...args}>\r
            <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200">\r
                <HiFire className="size-5" />\r
            </div>\r
            <div className="ml-3 font-normal text-sm">Set yourself free.</div>\r
            <ToastToggle />\r
        </Toast>;
}`,
			...((N = (w = n.parameters) == null ? void 0 : w.docs) == null
				? void 0
				: N.source),
		},
	},
};
const U = ["DefaultToast"];
export { n as DefaultToast, U as __namedExportsOrder, Q as default };
