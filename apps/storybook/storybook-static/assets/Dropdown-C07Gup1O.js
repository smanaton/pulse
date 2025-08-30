import { B as ne } from "./Button-BrGC8bZN.js";
import { C as j } from "./chevron-down-icon-CQF9w6vi.js";
import { C as re } from "./chevron-left-icon-RFu8Vxl9.js";
import { C as ae } from "./chevron-right-icon-DzP0OM3K.js";
import {
	u as _,
	a as $,
	r as ee,
	g as I,
	t as T,
	c as Z,
} from "./create-theme-ol-6nsx3.js";
import {
	i as Q,
	j as V,
	g as X,
	k as Y,
} from "./floating-ui.react-Dgys7JzL.js";
import { j as r, r as t } from "./iframe-ByD-PdrA.js";
import { a as oe, u as te } from "./use-floating-DojRaj4Q.js";
const R = t.forwardRef((e, o) =>
	r.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		viewBox: "0 0 24 24",
		ref: o,
		...e,
		children: r.jsx("path", {
			strokeLinecap: "round",
			strokeLinejoin: "round",
			d: "m5 15 7-7 7 7",
		}),
	}),
);
R.displayName = "ChevronUpIcon";
const N = t.createContext(void 0);
function ye() {
	const e = t.useContext(N);
	if (!e)
		throw new Error(
			"useDropdownContext should be used within the DropdownContext provider!",
		);
	return e;
}
const se = Z({
		arrowIcon: "ml-2 h-4 w-4",
		content: "py-1 focus:outline-none",
		floating: {
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
			base: "z-10 w-fit divide-y divide-gray-100 rounded shadow focus:outline-none",
			content: "py-1 text-sm text-gray-700 dark:text-gray-200",
			divider: "my-1 h-px bg-gray-100 dark:bg-gray-600",
			header: "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200",
			hidden: "invisible opacity-0",
			item: {
				container: "",
				base: "flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white",
				icon: "mr-2 h-4 w-4",
			},
			style: {
				dark: "bg-gray-900 text-white dark:bg-gray-700",
				light: "border border-gray-200 bg-white text-gray-900",
				auto: "border border-gray-200 bg-white text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
			},
			target: "w-fit",
		},
		inlineWrapper: "flex items-center",
	}),
	ie = { top: R, right: ae, bottom: j, left: re };
function ce({
	refs: e,
	children: o,
	inline: p,
	theme: a,
	disabled: c,
	setButtonWidth: s,
	getReferenceProps: h,
	renderTrigger: u,
	...f
}) {
	const l = e.reference,
		d = h();
	if (
		(t.useEffect(() => {
			l.current && (s == null || s(l.current.clientWidth));
		}, [l, s]),
		u)
	) {
		const i = u(a);
		return t.cloneElement(i, {
			ref: e.setReference,
			disabled: c,
			...d,
			...i.props,
		});
	}
	return p
		? r.jsx("button", {
				type: "button",
				ref: e.setReference,
				className: a == null ? void 0 : a.inlineWrapper,
				disabled: c,
				...d,
				children: o,
			})
		: r.jsx(ne, {
				...f,
				disabled: c,
				type: "button",
				ref: e.setReference,
				...d,
				children: o,
			});
}
function le(e) {
	var k, C;
	const [o, p] = t.useState(!1),
		[a, c] = t.useState(null),
		[s, h] = t.useState(null),
		[u, f] = t.useState(void 0),
		l = t.useRef([]),
		d = t.useRef([]),
		i = _(),
		n = $(
			[se, (k = i.theme) == null ? void 0 : k.dropdown, e.theme],
			[I(i.clearTheme, "dropdown"), e.clearTheme],
			[I(i.applyTheme, "dropdown"), e.applyTheme],
		),
		{
			children: P,
			className: b,
			dismissOnClick: D = !0,
			enableTypeAhead: F = !0,
			renderTrigger: S,
			...x
		} = ee(e, (C = i.props) == null ? void 0 : C.dropdown),
		{
			placement: y = x.inline ? "bottom-start" : "bottom",
			trigger: E = "click",
			label: L,
			inline: M,
			arrowIcon: z = !0,
			...A
		} = x,
		O = x["data-testid"] || "flowbite-dropdown-target",
		w = t.useCallback((g) => {
			h(g), p(!1);
		}, []),
		U = t.useCallback(
			(g) => {
				o ? c(g) : w(g);
			},
			[o, w],
		),
		{
			context: m,
			floatingStyles: W,
			refs: v,
		} = te({ open: o, setOpen: p, placement: y }),
		q = Q(m, { listRef: l, activeIndex: a, selectedIndex: s, onNavigate: c }),
		B = V(m, {
			listRef: d,
			activeIndex: a,
			selectedIndex: s,
			onMatch: U,
			enabled: F,
		}),
		{
			getReferenceProps: G,
			getFloatingProps: H,
			getItemProps: J,
		} = oe({ context: m, role: "menu", trigger: E, interactions: [q, B] }),
		K = t.useMemo(() => {
			const [g] = y.split("-");
			return ie[g] ?? j;
		}, [y]);
	return r.jsxs(N.Provider, {
		value: {
			theme: e.theme,
			clearTheme: e.clearTheme,
			applyTheme: e.applyTheme,
			activeIndex: a,
			dismissOnClick: D,
			getItemProps: J,
			handleSelect: w,
		},
		children: [
			r.jsxs(ce, {
				...A,
				refs: v,
				inline: M,
				theme: n,
				"data-testid": O,
				className: T(n.floating.target, b),
				setButtonWidth: f,
				getReferenceProps: G,
				renderTrigger: S,
				children: [L, z && r.jsx(K, { className: n.arrowIcon })],
			}),
			o &&
				r.jsx(X, {
					context: m,
					modal: !1,
					children: r.jsx("div", {
						ref: v.setFloating,
						style: { ...W, minWidth: u },
						"data-testid": "flowbite-dropdown",
						"aria-expanded": o,
						...H({
							className: T(
								n.floating.base,
								n.floating.animation,
								"duration-100",
								!o && n.floating.hidden,
								n.floating.style.auto,
								b,
							),
						}),
						children: r.jsx(Y, {
							elementsRef: l,
							labelsRef: d,
							children: r.jsx("ul", {
								className: n.content,
								tabIndex: -1,
								children: P,
							}),
						}),
					}),
				}),
		],
	});
}
le.displayName = "Dropdown";
export { le as D, se as d, ye as u };
