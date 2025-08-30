import {
	u as $,
	c as A,
	a as B,
	r as D,
	g as k,
	t as x,
} from "./create-theme-ol-6nsx3.js";
import { l as I, m as L } from "./floating-ui.react-Dgys7JzL.js";
import { r as b, j as o } from "./iframe-ByD-PdrA.js";
import { u as M, a as O, g as S } from "./use-floating-DojRaj4Q.js";
function v({
	animation: r = "duration-300",
	arrow: s = !0,
	children: c,
	className: d,
	content: g,
	placement: p = "top",
	style: i = "dark",
	theme: t,
	trigger: u = "hover",
	minWidth: f,
	...m
}) {
	const n = b.useRef(null),
		[a, l] = b.useState(!1),
		w = M({ open: a, placement: p, arrowRef: n, setOpen: l }),
		{
			context: y,
			middlewareData: { arrow: { x: T, y: j } = {} },
			refs: e,
			strategy: F,
			update: h,
			x: N,
			y: P,
		} = w,
		R = I(y),
		{ getFloatingProps: z, getReferenceProps: E } = O({
			context: y,
			role: "tooltip",
			trigger: u,
			interactions: [R],
		});
	return (
		b.useEffect(() => {
			if (e.reference.current && e.floating.current && a)
				return L(e.reference.current, e.floating.current, h);
		}, [a, e.floating, e.reference, h]),
		o.jsxs(o.Fragment, {
			children: [
				o.jsx("div", {
					ref: e.setReference,
					className: t.target,
					"data-testid": "flowbite-tooltip-target",
					...E(),
					children: c,
				}),
				o.jsxs("div", {
					ref: e.setFloating,
					"data-testid": "flowbite-tooltip",
					...z({
						className: x(
							t.base,
							r && `${t.animation} ${r}`,
							!a && t.hidden,
							t.style[i],
							d,
						),
						style: { position: F, top: P ?? " ", left: N ?? " ", minWidth: f },
						...m,
					}),
					children: [
						o.jsx("div", { className: t.content, children: g }),
						s &&
							o.jsx("div", {
								className: x(
									t.arrow.base,
									i === "dark" && t.arrow.style.dark,
									i === "light" && t.arrow.style.light,
									i === "auto" && t.arrow.style.auto,
								),
								"data-testid": "flowbite-tooltip-arrow",
								ref: n,
								style: {
									top: j ?? " ",
									left: T ?? " ",
									right: " ",
									bottom: " ",
									[S({ placement: w.placement })]: t.arrow.placement,
								},
								children: " ",
							}),
					],
				}),
			],
		})
	);
}
v.displayName = "Floating";
const U = A({
	target: "w-fit",
	animation: "transition-opacity",
	arrow: {
		base: "absolute z-10 h-2 w-2 rotate-45",
		style: {
			dark: "bg-gray-900 dark:bg-gray-700",
			light: "bg-white",
			auto: "bg-white dark:bg-gray-700",
		},
		placement: "-4px",
	},
	base: "absolute z-10 inline-block rounded-lg px-3 py-2 text-sm font-medium shadow-sm",
	hidden: "invisible opacity-0",
	style: {
		dark: "bg-gray-900 text-white dark:bg-gray-700",
		light: "border border-gray-200 bg-white text-gray-900",
		auto: "border border-gray-200 bg-white text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
	},
	content: "relative z-20",
});
function X(r) {
	var a, l;
	const s = $(),
		c = B(
			[U, (a = s.theme) == null ? void 0 : a.tooltip, r.theme],
			[k(s.clearTheme, "tooltip"), r.clearTheme],
			[k(s.applyTheme, "tooltip"), r.applyTheme],
		),
		{
			animation: d = "duration-300",
			arrow: g = !0,
			children: p,
			className: i,
			content: t,
			placement: u = "top",
			style: f = "dark",
			trigger: m = "hover",
			...n
		} = D(r, (l = s.props) == null ? void 0 : l.tooltip);
	return o.jsx(v, {
		animation: d,
		arrow: g,
		content: t,
		placement: u,
		style: f,
		theme: c,
		trigger: m,
		className: i,
		...n,
		children: p,
	});
}
X.displayName = "Tooltip";
export { X as T };
