import {
	b as C,
	a as I,
	t as i,
	u as j,
	g as k,
	c as L,
	T as N,
	r as z,
} from "./create-theme-ol-6nsx3.js";
import { r as c, j as n } from "./iframe-ByD-PdrA.js";
import { i as w } from "./is-client-dYMey8wu.js";
import "./preload-helper-Dp1pzeXC.js";
function _({ key: e, onChange: o }) {
	function r({ key: a, newValue: l }) {
		a === e && o(l);
	}
	c.useEffect(
		() => (
			window.addEventListener("storage", r),
			() => window.removeEventListener("storage", r)
		),
		[],
	);
}
const d = "auto",
	u = "flowbite-theme-mode",
	m = "flowbite-theme-mode-sync";
function R() {
	const [e, o] = c.useState(H(C()));
	_({
		key: u,
		onChange(t) {
			o(x(t ?? d));
		},
	}),
		P((t) => o(t));
	function r(t) {
		o(t), O(t), A(t), document.dispatchEvent(new CustomEvent(m, { detail: t }));
	}
	function a() {
		let t = e;
		t === "auto" && (t = g(t)), (t = t === "dark" ? "light" : "dark"), r(t);
	}
	function l() {
		r(e ?? d);
	}
	return {
		mode: e,
		computedMode: g(e),
		setMode: r,
		toggleMode: a,
		clearMode: l,
	};
}
function P(e) {
	c.useEffect(() => {
		function o(r) {
			const a = r.detail;
			e(a);
		}
		return (
			document.addEventListener(m, o), () => document.removeEventListener(m, o)
		);
	}, []);
}
function O(e) {
	localStorage.setItem(u, e);
}
function A(e) {
	const o = g(e),
		r = "dark";
	o === "dark"
		? document.documentElement.classList.add(r)
		: document.documentElement.classList.remove(r);
}
function H(e) {
	if (!w()) return d;
	const o = localStorage.getItem(u);
	return x(o ?? e ?? d);
}
function g(e) {
	return w() ? (e === "auto" ? V() : e) : d;
}
function V() {
	var e;
	return (e = window.matchMedia) != null &&
		e.call(window, "(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}
function x(e) {
	return ["light", "dark", "auto"].includes(e) ? e : d;
}
const E = c.forwardRef((e, o) =>
	n.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 20 20",
		ref: o,
		...e,
		children: n.jsx("path", {
			stroke: "none",
			d: "M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586z",
		}),
	}),
);
E.displayName = "MoonIcon";
const y = c.forwardRef((e, o) =>
	n.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 20 20",
		ref: o,
		...e,
		children: n.jsx("path", {
			fillRule: "evenodd",
			stroke: "none",
			d: "M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-.464 4.95.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414zm2.12-10.607a1 1 0 0 1 0 1.414l-.706.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM17 11a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2h1zm-7 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM5.05 6.464A1 1 0 1 0 6.465 5.05l-.708-.707a1 1 0 0 0-1.414 1.414l.707.707zm1.414 8.486-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414zM4 11a1 1 0 1 0 0-2H3a1 1 0 0 0 0 2h1z",
			clipRule: "evenodd",
		}),
	}),
);
y.displayName = "SunIcon";
const W = L({
		root: {
			base: "rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
			icon: {
				base: "h-5 w-5",
				dark: "hidden dark:block",
				light: "dark:hidden",
			},
		},
	}),
	h = c.forwardRef((e, o) => {
		var f, T;
		const r = j(),
			a = I(
				[W, (f = r.theme) == null ? void 0 : f.darkThemeToggle, e.theme],
				[k(r.clearTheme, "darkThemeToggle"), e.clearTheme],
				[k(r.applyTheme, "darkThemeToggle"), e.applyTheme],
			),
			{
				className: l,
				iconDark: t = y,
				iconLight: b = E,
				...D
			} = z(e, (T = r.props) == null ? void 0 : T.darkThemeToggle),
			{ toggleMode: S } = R();
		return n.jsxs("button", {
			ref: o,
			type: "button",
			"aria-label": "Toggle dark mode",
			"data-testid": "dark-theme-toggle",
			className: i(a.root.base, l),
			onClick: S,
			...D,
			children: [
				n.jsx(t, {
					"aria-label": "Currently dark mode",
					className: i(a.root.icon.base, a.root.icon.dark),
				}),
				n.jsx(b, {
					"aria-label": "Currently light mode",
					className: i(a.root.icon.base, a.root.icon.light),
				}),
			],
		});
	});
h.displayName = "DarkThemeToggle";
const G = { title: "Components/DarkThemeToggle", component: h },
	B = (e) => n.jsx(N, { children: n.jsx(h, { ...e }) }),
	s = B.bind({});
s.storyName = "Default";
s.args = {};
var M, p, v;
s.parameters = {
	...s.parameters,
	docs: {
		...((M = s.parameters) == null ? void 0 : M.docs),
		source: {
			originalSource: `args => <ThemeProvider>\r
        <DarkThemeToggle {...args} />\r
    </ThemeProvider>`,
			...((v = (p = s.parameters) == null ? void 0 : p.docs) == null
				? void 0
				: v.source),
		},
	},
};
const J = ["DefaultDarkThemeToggle"];
export { s as DefaultDarkThemeToggle, J as __namedExportsOrder, G as default };
