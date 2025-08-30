import {
	c as b,
	t as d,
	g as n,
	u as R,
	r as T,
	a as y,
} from "./create-theme-ol-6nsx3.js";
import { r as S, j as s } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const p = b({
		root: { base: "flex" },
		field: {
			base: "relative w-full",
			input: {
				base: "w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700",
				sizes: { sm: "h-1", md: "h-2", lg: "h-3" },
			},
		},
	}),
	l = S.forwardRef((e, u) => {
		var o, i;
		const a = R(),
			t = y(
				[p, (o = a.theme) == null ? void 0 : o.rangeSlider, e.theme],
				[n(a.clearTheme, "rangeSlider"), e.clearTheme],
				[n(a.applyTheme, "rangeSlider"), e.applyTheme],
			),
			{
				className: f,
				sizing: h = "md",
				...x
			} = T(e, (i = a.props) == null ? void 0 : i.rangeSlider);
		return s.jsx("div", {
			"data-testid": "flowbite-range-slider",
			className: d(t.root.base, f),
			children: s.jsx("div", {
				className: t.field.base,
				children: s.jsx("input", {
					ref: u,
					type: "range",
					className: d(t.field.input.base, t.field.input.sizes[h]),
					...x,
				}),
			}),
		});
	});
l.displayName = "RangeSlider";
const z = {
		title: "Components/RangeSlider",
		component: l,
		decorators: [
			(e) =>
				s.jsx("div", {
					className: "flex w-1/2 flex-col",
					children: s.jsx(e, {}),
				}),
		],
		argTypes: {
			sizing: {
				options: Object.keys(p.field.input.sizes),
				control: { type: "select" },
			},
			disabled: { control: "boolean" },
		},
	},
	j = (e) => s.jsx(l, { ...e }),
	r = j.bind({});
r.storyName = "RangeSlider";
r.args = {};
var c, m, g;
r.parameters = {
	...r.parameters,
	docs: {
		...((c = r.parameters) == null ? void 0 : c.docs),
		source: {
			originalSource: "args => <RangeSlider {...args} />",
			...((g = (m = r.parameters) == null ? void 0 : m.docs) == null
				? void 0
				: g.source),
		},
	},
};
const E = ["DefaultRangeSlider"];
export { r as DefaultRangeSlider, E as __namedExportsOrder, z as default };
