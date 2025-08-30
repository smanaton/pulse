import {
	c as B,
	g as l,
	r as N,
	a as R,
	t as T,
	u as v,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as h } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const J = h.createContext(void 0);
function G() {
	const t = h.useContext(J);
	if (!t)
		throw new Error(
			"useRatingContext should be used within the RatingContext provider!",
		);
	return t;
}
const L = B({
		root: { base: "flex items-center" },
		star: {
			empty: "text-gray-300 dark:text-gray-500",
			filled: "text-yellow-400",
			sizes: { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-10 w-10" },
		},
	}),
	H = B({
		base: "flex items-center",
		label: "text-sm font-medium text-cyan-600 dark:text-cyan-500",
		progress: {
			base: "mx-4 h-5 w-2/4 rounded bg-gray-200 dark:bg-gray-700",
			fill: "h-5 rounded bg-yellow-400",
			label: "text-sm font-medium text-cyan-600 dark:text-cyan-500",
		},
	}),
	y = h.forwardRef((t, i) => {
		var d, c;
		const r = v(),
			s = R(
				[L, (d = r.theme) == null ? void 0 : d.rating, t.theme],
				[l(r.clearTheme, "rating"), t.clearTheme],
				[l(r.applyTheme, "rating"), t.applyTheme],
			),
			{
				className: p,
				size: f = "sm",
				...n
			} = N(t, (c = r.props) == null ? void 0 : c.rating);
		return e.jsx(J.Provider, {
			value: {
				theme: t.theme,
				clearTheme: t.clearTheme,
				applyTheme: t.applyTheme,
				size: f,
			},
			children: e.jsx("div", { ref: i, className: T(s.root.base, p), ...n }),
		});
	});
y.displayName = "Rating";
const o = h.forwardRef((t, i) => {
	var c, j;
	const r = v(),
		s = R(
			[H, (c = r.theme) == null ? void 0 : c.ratingAdvanced, t.theme],
			[l(r.clearTheme, "ratingAdvanced"), t.clearTheme],
			[l(r.applyTheme, "ratingAdvanced"), t.applyTheme],
		),
		{
			children: p,
			className: f,
			percentFilled: n = 0,
			...d
		} = N(t, (j = r.props) == null ? void 0 : j.ratingAdvanced);
	return e.jsxs("div", {
		ref: i,
		className: T(s.base, f),
		...d,
		children: [
			e.jsx("span", { className: s.label, children: p }),
			e.jsx("div", {
				className: s.progress.base,
				children: e.jsx("div", {
					className: s.progress.fill,
					"data-testid": "flowbite-rating-fill",
					style: { width: `${n}%` },
				}),
			}),
			e.jsx("span", { className: s.progress.label, children: `${n}%` }),
		],
	});
});
o.displayName = "RatingAdvanced";
const O = h.forwardRef((t, i) =>
	e.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "1em",
		height: "1em",
		fill: "currentColor",
		stroke: "currentColor",
		strokeWidth: 0,
		viewBox: "0 0 20 20",
		ref: i,
		...t,
		children: e.jsx("path", {
			stroke: "none",
			d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z",
		}),
	}),
);
O.displayName = "StarIcon";
const a = h.forwardRef((t, i) => {
	var w, A, k;
	const { theme: r, clearTheme: s, applyTheme: p, size: f = "sm" } = G(),
		n = v(),
		d = R(
			[
				L.star,
				(A = (w = n.theme) == null ? void 0 : w.rating) == null
					? void 0
					: A.star,
				r == null ? void 0 : r.star,
				t.theme,
			],
			[l(n.clearTheme, "rating.star"), l(s, "star"), t.clearTheme],
			[l(n.applyTheme, "rating.star"), l(p, "star"), t.applyTheme],
		),
		{
			className: c,
			filled: j = !0,
			starIcon: X = O,
			...q
		} = N(t, (k = n.props) == null ? void 0 : k.ratingStar);
	return e.jsx(X, {
		ref: i,
		"data-testid": "flowbite-rating-star",
		className: T(d.sizes[f], d[j ? "filled" : "empty"], c),
		...q,
	});
});
a.displayName = "RatingStar";
const V = { title: "Components/Rating", component: y },
	b = (t) => e.jsx(y, { ...t }),
	m = b.bind({});
m.storyName = "Default";
m.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(a, {}),
			e.jsx(a, {}),
			e.jsx(a, {}),
			e.jsx(a, {}),
			e.jsx(a, { filled: !1 }),
		],
	}),
};
const g = b.bind({});
g.storyName = "With text";
g.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(a, {}),
			e.jsx(a, {}),
			e.jsx(a, {}),
			e.jsx(a, {}),
			e.jsx(a, { filled: !1 }),
			e.jsx("p", {
				className: "ml-2 font-medium text-gray-500 text-sm dark:text-gray-400",
				children: "4.95 out of 5",
			}),
		],
	}),
};
const x = b.bind({});
x.storyName = "With rating count";
x.args = {
	children: e.jsxs(e.Fragment, {
		children: [
			e.jsx(a, {}),
			e.jsx("p", {
				className: "ml-2 font-bold text-gray-900 text-sm dark:text-white",
				children: "4.95",
			}),
			e.jsx("span", {
				className: "mx-1.5 size-1 rounded-full bg-gray-500 dark:bg-gray-400",
			}),
			e.jsx("a", {
				href: "#",
				className:
					"font-medium text-gray-900 text-sm underline hover:no-underline dark:text-white",
				children: "73 reviews",
			}),
		],
	}),
};
const u = () =>
	e.jsxs("div", {
		className: "flex flex-col gap-4",
		children: [
			e.jsxs(y, {
				className: "pt-3",
				children: [
					e.jsx(a, {}),
					e.jsx(a, {}),
					e.jsx(a, {}),
					e.jsx(a, {}),
					e.jsx(a, { filled: !1 }),
					e.jsx("p", {
						className:
							"ml-2 font-medium text-gray-500 text-sm dark:text-gray-400",
						children: "4.95 out of 5",
					}),
				],
			}),
			e.jsx("p", {
				className: "pb-3 font-medium text-gray-500 text-sm dark:text-gray-400",
				children: "1,745 global ratings",
			}),
			e.jsx(o, { percentFilled: 70, children: "5 star" }),
			e.jsx(o, { percentFilled: 17, children: "4 star" }),
			e.jsx(o, { percentFilled: 8, children: "3 star" }),
			e.jsx(o, { percentFilled: 4, children: "2 star" }),
			e.jsx(o, { percentFilled: 1, children: "1 star" }),
		],
	});
u.__docgenInfo = { description: "", methods: [], displayName: "Advanced" };
var S, F, C;
m.parameters = {
	...m.parameters,
	docs: {
		...((S = m.parameters) == null ? void 0 : S.docs),
		source: {
			originalSource: "args => <Rating {...args} />",
			...((C = (F = m.parameters) == null ? void 0 : F.docs) == null
				? void 0
				: C.source),
		},
	},
};
var z, P, E;
g.parameters = {
	...g.parameters,
	docs: {
		...((z = g.parameters) == null ? void 0 : z.docs),
		source: {
			originalSource: "args => <Rating {...args} />",
			...((E = (P = g.parameters) == null ? void 0 : P.docs) == null
				? void 0
				: E.source),
		},
	},
};
var I, W, _;
x.parameters = {
	...x.parameters,
	docs: {
		...((I = x.parameters) == null ? void 0 : I.docs),
		source: {
			originalSource: "args => <Rating {...args} />",
			...((_ = (W = x.parameters) == null ? void 0 : W.docs) == null
				? void 0
				: _.source),
		},
	},
};
var D, M, $;
u.parameters = {
	...u.parameters,
	docs: {
		...((D = u.parameters) == null ? void 0 : D.docs),
		source: {
			originalSource: `(): JSX.Element => <div className="flex flex-col gap-4">\r
        <Rating className="pt-3">\r
            <RatingStar />\r
            <RatingStar />\r
            <RatingStar />\r
            <RatingStar />\r
            <RatingStar filled={false} />\r
            <p className="ml-2 font-medium text-gray-500 text-sm dark:text-gray-400">\r
                4.95 out of 5\r
            </p>\r
        </Rating>\r
        <p className="pb-3 font-medium text-gray-500 text-sm dark:text-gray-400">\r
            1,745 global ratings\r
        </p>\r
        <RatingAdvanced percentFilled={70}>5 star</RatingAdvanced>\r
        <RatingAdvanced percentFilled={17}>4 star</RatingAdvanced>\r
        <RatingAdvanced percentFilled={8}>3 star</RatingAdvanced>\r
        <RatingAdvanced percentFilled={4}>2 star</RatingAdvanced>\r
        <RatingAdvanced percentFilled={1}>1 star</RatingAdvanced>\r
    </div>`,
			...(($ = (M = u.parameters) == null ? void 0 : M.docs) == null
				? void 0
				: $.source),
		},
	},
};
const Y = ["DefaultRating", "WithText", "RatingCount", "Advanced"];
export {
	u as Advanced,
	m as DefaultRating,
	x as RatingCount,
	g as WithText,
	Y as __namedExportsOrder,
	V as default,
};
