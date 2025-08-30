import {
	g as d,
	u as h,
	t as I,
	c as k,
	r as w,
	a as x,
} from "./create-theme-ol-6nsx3.js";
import { r as b, j as g } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const T = k({
		base: "block w-full cursor-pointer rounded-lg border file:-ms-4 file:me-4 file:cursor-pointer file:border-none file:bg-gray-800 file:py-2.5 file:pe-4 file:ps-8 file:text-sm file:font-medium file:leading-[inherit] file:text-white hover:file:bg-gray-700 focus:outline-none focus:ring-1 dark:file:bg-gray-600 dark:hover:file:bg-gray-500",
		sizes: { sm: "text-xs", md: "text-sm", lg: "text-lg" },
		colors: {
			gray: "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500",
			info: "border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
			failure:
				"border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:focus:border-red-500 dark:focus:ring-red-500",
			warning:
				"border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:focus:border-yellow-500 dark:focus:ring-yellow-500",
			success:
				"border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:focus:border-green-500 dark:focus:ring-green-500",
		},
	}),
	s = b.forwardRef((e, u) => {
		var l, t;
		const o = h(),
			a = x(
				[T, (l = o.theme) == null ? void 0 : l.fileInput, e.theme],
				[d(o.clearTheme, "fileInput"), e.clearTheme],
				[d(o.applyTheme, "fileInput"), e.applyTheme],
			),
			{
				className: f,
				color: p = "gray",
				sizing: y = "md",
				...m
			} = w(e, (t = o.props) == null ? void 0 : t.fileInput);
		return g.jsx("input", {
			ref: u,
			type: "file",
			className: I(a.base, a.colors[p], a.sizes[y], f),
			...m,
		});
	});
s.displayName = "FileInput";
const z = { title: "Components/FileInput", component: s },
	F = (e) => g.jsx(s, { ...e }),
	r = F.bind({});
r.storyName = "FileInput";
r.args = {};
var n, i, c;
r.parameters = {
	...r.parameters,
	docs: {
		...((n = r.parameters) == null ? void 0 : n.docs),
		source: {
			originalSource: "args => <FileInput {...args} />",
			...((c = (i = r.parameters) == null ? void 0 : i.docs) == null
				? void 0
				: c.source),
		},
	},
};
const E = ["DefaultFileInput"];
export { r as DefaultFileInput, E as __namedExportsOrder, z as default };
