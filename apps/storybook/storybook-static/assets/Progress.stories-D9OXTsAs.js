import {
	a as $,
	u as M,
	t as N,
	r as q,
	g as w,
	c as Y,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as j } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const A = Y({
		base: "w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
		label: "mb-1 flex justify-between font-medium dark:text-white",
		bar: "space-x-2 rounded-full text-center font-medium leading-none text-primary-300 dark:text-primary-100",
		color: {
			default: "bg-primary-600",
			dark: "bg-gray-600 dark:bg-gray-300",
			blue: "bg-blue-600",
			red: "bg-red-600 dark:bg-red-500",
			green: "bg-green-600 dark:bg-green-500",
			yellow: "bg-yellow-400",
			indigo: "bg-indigo-600 dark:bg-indigo-500",
			purple: "bg-purple-600 dark:bg-purple-500",
			cyan: "bg-cyan-600",
			gray: "bg-gray-500",
			lime: "bg-lime-600",
			pink: "bg-pink-500",
			teal: "bg-teal-600",
		},
		size: { sm: "h-1.5", md: "h-2.5", lg: "h-4", xl: "h-6" },
	}),
	s = j.forwardRef((r, O) => {
		var f, v;
		const B = j.useId(),
			g = M(),
			t = $(
				[A, (f = g.theme) == null ? void 0 : f.progress, r.theme],
				[w(g.clearTheme, "progress"), r.clearTheme],
				[w(g.applyTheme, "progress"), r.applyTheme],
			),
			{
				className: G,
				color: J = "default",
				labelProgress: c = !1,
				labelText: p = !1,
				progress: a,
				progressLabelPosition: x = "inside",
				size: h = "md",
				textLabel: o = "progressbar",
				textLabelPosition: u = "inside",
				...X
			} = q(r, (v = g.props) == null ? void 0 : v.progress);
		return e.jsxs("div", {
			ref: O,
			id: B,
			"aria-label": o,
			"aria-valuenow": a,
			role: "progressbar",
			...X,
			children: [
				((o && p && u === "outside") || (a > 0 && c && x === "outside")) &&
					e.jsxs("div", {
						className: t.label,
						"data-testid": "flowbite-progress-outer-label-container",
						children: [
							o &&
								p &&
								u === "outside" &&
								e.jsx("span", {
									"data-testid": "flowbite-progress-outer-text-label",
									children: o,
								}),
							c &&
								x === "outside" &&
								e.jsxs("span", {
									"data-testid": "flowbite-progress-outer-progress-label",
									children: [a, "%"],
								}),
						],
					}),
				e.jsx("div", {
					className: N(t.base, t.size[h], G),
					children: e.jsxs("div", {
						style: { width: `${a}%` },
						className: N(t.bar, t.color[J], t.size[h]),
						children: [
							o &&
								p &&
								u === "inside" &&
								e.jsx("span", {
									"data-testid": "flowbite-progress-inner-text-label",
									children: o,
								}),
							a > 0 &&
								c &&
								x === "inside" &&
								e.jsxs("span", {
									"data-testid": "flowbite-progress-inner-progress-label",
									children: [a, "%"],
								}),
						],
					}),
				}),
			],
		});
	});
s.displayName = "Progress";
const U = {
		title: "Components/Progress",
		component: s,
		decorators: [
			(r) =>
				e.jsx("div", {
					className: "flex w-1/2 flex-col",
					children: e.jsx(r, {}),
				}),
		],
	},
	b = (r) => e.jsx(s, { ...r }),
	d = b.bind({});
d.args = { progress: 45 };
const n = () =>
		e.jsxs(e.Fragment, {
			children: [
				e.jsx("div", {
					className: "font-medium text-base dark:text-white",
					children: "Small",
				}),
				e.jsx(s, { progress: 45, size: "sm" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base dark:text-white",
					children: "Default",
				}),
				e.jsx(s, { progress: 45, size: "md" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-lg dark:text-white",
					children: "Large",
				}),
				e.jsx(s, { progress: 45, size: "lg" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-lg dark:text-white",
					children: "Extra Large",
				}),
				e.jsx(s, { progress: 45, size: "xl" }),
			],
		}),
	m = () =>
		e.jsxs(e.Fragment, {
			children: [
				e.jsx("div", { className: "font-medium text-base", children: "Dark" }),
				e.jsx(s, { progress: 45, color: "dark" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base text-cyan-700",
					children: "Blue",
				}),
				e.jsx(s, { progress: 45, color: "info" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base text-red-700",
					children: "Red",
				}),
				e.jsx(s, { progress: 45, color: "red" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base text-green-700",
					children: "Green",
				}),
				e.jsx(s, { progress: 45, color: "green" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base text-yellow-700",
					children: "Yellow",
				}),
				e.jsx(s, { progress: 45, color: "yellow" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base text-indigo-700",
					children: "Indigo",
				}),
				e.jsx(s, { progress: 45, color: "indigo" }),
				e.jsx("div", {
					className: "mt-3 font-medium text-base text-purple-700",
					children: "Purple",
				}),
				e.jsx(s, { progress: 45, color: "purple" }),
			],
		}),
	i = b.bind({});
i.storyName = "With labels";
i.args = {
	textLabel: "Flowbite",
	labelText: !0,
	progress: 45,
	labelProgress: !0,
	size: "lg",
};
const l = b.bind({});
l.storyName = "Label positions";
l.args = {
	textLabel: "Flowbite",
	labelText: !0,
	textLabelPosition: "outside",
	progress: 45,
	labelProgress: !0,
	progressLabelPosition: "inside",
	size: "lg",
};
n.__docgenInfo = { description: "", methods: [], displayName: "Sizes" };
m.__docgenInfo = { description: "", methods: [], displayName: "Colors" };
var P, y, k;
d.parameters = {
	...d.parameters,
	docs: {
		...((P = d.parameters) == null ? void 0 : P.docs),
		source: {
			originalSource: "args => <Progress {...args} />",
			...((k = (y = d.parameters) == null ? void 0 : y.docs) == null
				? void 0
				: k.source),
		},
	},
};
var z, L, S;
n.parameters = {
	...n.parameters,
	docs: {
		...((z = n.parameters) == null ? void 0 : z.docs),
		source: {
			originalSource: `(): JSX.Element => <>\r
        <div className="font-medium text-base dark:text-white">Small</div>\r
        <Progress progress={45} size="sm" />\r
        <div className="mt-3 font-medium text-base dark:text-white">Default</div>\r
        <Progress progress={45} size="md" />\r
        <div className="mt-3 font-medium text-lg dark:text-white">Large</div>\r
        <Progress progress={45} size="lg" />\r
        <div className="mt-3 font-medium text-lg dark:text-white">Extra Large</div>\r
        <Progress progress={45} size="xl" />\r
    </>`,
			...((S = (L = n.parameters) == null ? void 0 : L.docs) == null
				? void 0
				: S.source),
		},
	},
};
var T, E, I;
m.parameters = {
	...m.parameters,
	docs: {
		...((T = m.parameters) == null ? void 0 : T.docs),
		source: {
			originalSource: `(): JSX.Element => <>\r
        <div className="font-medium text-base">Dark</div>\r
        <Progress progress={45} color="dark" />\r
        <div className="mt-3 font-medium text-base text-cyan-700">Blue</div>\r
        <Progress progress={45} color="info" />\r
        <div className="mt-3 font-medium text-base text-red-700">Red</div>\r
        <Progress progress={45} color="red" />\r
        <div className="mt-3 font-medium text-base text-green-700">Green</div>\r
        <Progress progress={45} color="green" />\r
        <div className="mt-3 font-medium text-base text-yellow-700">Yellow</div>\r
        <Progress progress={45} color="yellow" />\r
        <div className="mt-3 font-medium text-base text-indigo-700">Indigo</div>\r
        <Progress progress={45} color="indigo" />\r
        <div className="mt-3 font-medium text-base text-purple-700">Purple</div>\r
        <Progress progress={45} color="purple" />\r
    </>`,
			...((I = (E = m.parameters) == null ? void 0 : E.docs) == null
				? void 0
				: I.source),
		},
	},
};
var _, D, R;
i.parameters = {
	...i.parameters,
	docs: {
		...((_ = i.parameters) == null ? void 0 : _.docs),
		source: {
			originalSource: "args => <Progress {...args} />",
			...((R = (D = i.parameters) == null ? void 0 : D.docs) == null
				? void 0
				: R.source),
		},
	},
};
var W, C, F;
l.parameters = {
	...l.parameters,
	docs: {
		...((W = l.parameters) == null ? void 0 : W.docs),
		source: {
			originalSource: "args => <Progress {...args} />",
			...((F = (C = l.parameters) == null ? void 0 : C.docs) == null
				? void 0
				: F.source),
		},
	},
};
const V = ["Default", "Sizes", "Colors", "WithLabelInside", "WithLabelOutside"];
export {
	m as Colors,
	d as Default,
	n as Sizes,
	i as WithLabelInside,
	l as WithLabelOutside,
	V as __namedExportsOrder,
	U as default,
};
