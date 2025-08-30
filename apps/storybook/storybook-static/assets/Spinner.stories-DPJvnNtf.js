import { B as f } from "./Button-BrGC8bZN.js";
import {
	c as A,
	t as D,
	g,
	a as J,
	u as R,
	r as X,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as M } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const F = A({
		base: "inline animate-spin text-gray-200",
		color: {
			default: "fill-primary-600",
			failure: "fill-red-600",
			gray: "fill-gray-600",
			info: "fill-cyan-600",
			pink: "fill-pink-600",
			purple: "fill-purple-600",
			success: "fill-green-500",
			warning: "fill-yellow-400",
		},
		light: {
			off: {
				base: "dark:text-gray-600",
				color: {
					default: "",
					failure: "",
					gray: "dark:fill-gray-300",
					info: "",
					pink: "",
					purple: "",
					success: "",
					warning: "",
				},
			},
			on: {
				base: "",
				color: {
					default: "",
					failure: "",
					gray: "",
					info: "",
					pink: "",
					purple: "",
					success: "",
					warning: "",
				},
			},
		},
		size: {
			xs: "h-3 w-3",
			sm: "h-4 w-4",
			md: "h-6 w-6",
			lg: "h-8 w-8",
			xl: "h-10 w-10",
		},
	}),
	a = M.forwardRef((r, T) => {
		var x, d;
		const t = R(),
			n = J(
				[F, (x = t.theme) == null ? void 0 : x.spinner, r.theme],
				[g(t.clearTheme, "spinner"), r.clearTheme],
				[g(t.applyTheme, "spinner"), r.applyTheme],
			),
			{
				className: L,
				color: c = "default",
				light: m,
				size: P = "lg",
				...I
			} = X(r, (d = t.props) == null ? void 0 : d.spinner);
		return e.jsx("span", {
			ref: T,
			role: "status",
			...I,
			children: e.jsxs("svg", {
				fill: "none",
				viewBox: "0 0 100 101",
				className: D(
					n.base,
					n.color[c],
					n.light[m ? "on" : "off"].base,
					n.light[m ? "on" : "off"].color[c],
					n.size[P],
					L,
				),
				children: [
					e.jsx("path", {
						d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",
						fill: "currentColor",
					}),
					e.jsx("path", {
						d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",
						fill: "currentFill",
					}),
				],
			}),
		});
	});
a.displayName = "Spinner";
const H = { title: "Components/Spinner", component: a },
	Z = (r) => e.jsx(a, { ...r }),
	l = Z.bind({});
l.args = { color: "info", size: "md", title: "Default spinner example" };
const s = () =>
		e.jsxs("div", {
			className: "flex w-1/3 flex-col gap-3 p-6",
			children: [
				e.jsx("div", {
					className: "text-left",
					children: e.jsx(a, { "aria-label": "Left-aligned spinner example" }),
				}),
				e.jsx("div", {
					className: "text-center",
					children: e.jsx(a, {
						"aria-label": "Center-aligned spinner example",
					}),
				}),
				e.jsx("div", {
					className: "text-right",
					children: e.jsx(a, { "aria-label": "Right-aligned spinner example" }),
				}),
			],
		}),
	i = () =>
		e.jsxs("div", {
			className: "flex flex-row gap-3",
			children: [
				e.jsx(a, { color: "info", "aria-label": "Info spinner example" }),
				e.jsx(a, { color: "success", "aria-label": "Success spinner example" }),
				e.jsx(a, { color: "failure", "aria-label": "Failure spinner example" }),
				e.jsx(a, { color: "warning", "aria-label": "Warning spinner example" }),
				e.jsx(a, { color: "pink", "aria-label": "Pink spinner example" }),
				e.jsx(a, { color: "purple", "aria-label": "Purple spinner example" }),
			],
		}),
	p = () =>
		e.jsxs("div", {
			className: "flex flex-row gap-3",
			children: [
				e.jsx(a, { "aria-label": "Extra small spinner example", size: "xs" }),
				e.jsx(a, { "aria-label": "Small spinner example", size: "sm" }),
				e.jsx(a, { "aria-label": "Medium sized spinner example", size: "md" }),
				e.jsx(a, { "aria-label": "Large spinner example", size: "lg" }),
				e.jsx(a, { "aria-label": "Extra large spinner example", size: "xl" }),
			],
		}),
	o = () =>
		e.jsxs("div", {
			className: "flex flex-row gap-3",
			children: [
				e.jsxs(f, {
					children: [
						e.jsx(a, { "aria-label": "Spinner button example" }),
						e.jsx("span", { className: "pl-3", children: "Loading..." }),
					],
				}),
				e.jsxs(f, {
					color: "gray",
					children: [
						e.jsx(a, { "aria-label": "Alternate spinner button example" }),
						e.jsx("span", { className: "pl-3", children: "Loading..." }),
					],
				}),
			],
		});
s.__docgenInfo = { description: "", methods: [], displayName: "Alignment" };
i.__docgenInfo = { description: "", methods: [], displayName: "Colors" };
p.__docgenInfo = { description: "", methods: [], displayName: "Sizes" };
o.__docgenInfo = { description: "", methods: [], displayName: "Buttons" };
var u, h, b;
l.parameters = {
	...l.parameters,
	docs: {
		...((u = l.parameters) == null ? void 0 : u.docs),
		source: {
			originalSource: "args => <Spinner {...args} />",
			...((b = (h = l.parameters) == null ? void 0 : h.docs) == null
				? void 0
				: b.source),
		},
	},
};
var S, j, v;
s.parameters = {
	...s.parameters,
	docs: {
		...((S = s.parameters) == null ? void 0 : S.docs),
		source: {
			originalSource: `(): JSX.Element => <div className="flex w-1/3 flex-col gap-3 p-6">\r
        <div className="text-left">\r
            <Spinner aria-label="Left-aligned spinner example" />\r
        </div>\r
        <div className="text-center">\r
            <Spinner aria-label="Center-aligned spinner example" />\r
        </div>\r
        <div className="text-right">\r
            <Spinner aria-label="Right-aligned spinner example" />\r
        </div>\r
    </div>`,
			...((v = (j = s.parameters) == null ? void 0 : j.docs) == null
				? void 0
				: v.source),
		},
	},
};
var C, N, w;
i.parameters = {
	...i.parameters,
	docs: {
		...((C = i.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: `(): JSX.Element => <div className="flex flex-row gap-3">\r
        <Spinner color="info" aria-label="Info spinner example" />\r
        <Spinner color="success" aria-label="Success spinner example" />\r
        <Spinner color="failure" aria-label="Failure spinner example" />\r
        <Spinner color="warning" aria-label="Warning spinner example" />\r
        <Spinner color="pink" aria-label="Pink spinner example" />\r
        <Spinner color="purple" aria-label="Purple spinner example" />\r
    </div>`,
			...((w = (N = i.parameters) == null ? void 0 : N.docs) == null
				? void 0
				: w.source),
		},
	},
};
var y, z, E;
p.parameters = {
	...p.parameters,
	docs: {
		...((y = p.parameters) == null ? void 0 : y.docs),
		source: {
			originalSource: `(): JSX.Element => <div className="flex flex-row gap-3">\r
        <Spinner aria-label="Extra small spinner example" size="xs" />\r
        <Spinner aria-label="Small spinner example" size="sm" />\r
        <Spinner aria-label="Medium sized spinner example" size="md" />\r
        <Spinner aria-label="Large spinner example" size="lg" />\r
        <Spinner aria-label="Extra large spinner example" size="xl" />\r
    </div>`,
			...((E = (z = p.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: E.source),
		},
	},
};
var _, k, B;
o.parameters = {
	...o.parameters,
	docs: {
		...((_ = o.parameters) == null ? void 0 : _.docs),
		source: {
			originalSource: `(): JSX.Element => <div className="flex flex-row gap-3">\r
        <Button>\r
            <Spinner aria-label="Spinner button example" />\r
            <span className="pl-3">Loading...</span>\r
        </Button>\r
        <Button color="gray">\r
            <Spinner aria-label="Alternate spinner button example" />\r
            <span className="pl-3">Loading...</span>\r
        </Button>\r
    </div>`,
			...((B = (k = o.parameters) == null ? void 0 : k.docs) == null
				? void 0
				: B.source),
		},
	},
};
const K = ["Default", "Alignment", "Colors", "Sizes", "Buttons"];
export {
	s as Alignment,
	o as Buttons,
	i as Colors,
	l as Default,
	p as Sizes,
	K as __namedExportsOrder,
	H as default,
};
