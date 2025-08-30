import { C as _ } from "./chevron-right-icon-DzP0OM3K.js";
import {
	g as b,
	c as F,
	a as H,
	r as k,
	t as R,
	u as w,
} from "./create-theme-ol-6nsx3.js";
import { j as r, r as v } from "./iframe-ByD-PdrA.js";
import { f as E } from "./index-CK8OVH7d.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const P = F({
		root: { base: "", list: "flex items-center" },
		item: {
			base: "group flex items-center",
			chevron: "mx-1 h-4 w-4 text-gray-400 group-first:hidden md:mx-2",
			href: {
				off: "flex items-center text-sm font-medium text-gray-500 dark:text-gray-400",
				on: "flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
			},
			icon: "mr-2 h-4 w-4",
		},
	}),
	f = v.forwardRef((e, u) => {
		var s, d, o;
		const a = w(),
			t = H(
				[
					P.root,
					(d = (s = a.theme) == null ? void 0 : s.breadcrumb) == null
						? void 0
						: d.root,
					e.theme,
				],
				[b(a.clearTheme, "breadcrumb.root"), e.clearTheme],
				[b(a.applyTheme, "breadcrumb.root"), e.applyTheme],
			),
			{
				children: l,
				className: h,
				...c
			} = k(e, (o = a.props) == null ? void 0 : o.breadcrumb);
		return r.jsx("nav", {
			ref: u,
			"aria-label": "Breadcrumb",
			className: R(t.base, h),
			...c,
			children: r.jsx("ol", { className: t.list, children: l }),
		});
	});
f.displayName = "Breadcrumb";
const i = v.forwardRef((e, u) => {
	var p, x, g;
	const a = w(),
		t = H(
			[
				P.item,
				(x = (p = a.theme) == null ? void 0 : p.breadcrumb) == null
					? void 0
					: x.item,
				e.theme,
			],
			[b(a.clearTheme, "breadcrumb.item"), e.clearTheme],
			[b(a.applyTheme, "breadcrumb.item"), e.applyTheme],
		),
		{
			children: l,
			className: h,
			href: c,
			icon: s,
			...d
		} = k(e, (g = a.props) == null ? void 0 : g.breadcrumbItem),
		o = typeof c < "u",
		C = o ? "a" : "span";
	return r.jsxs("li", {
		className: R(t.base, h),
		...d,
		children: [
			r.jsx(_, {
				"aria-hidden": !0,
				className: t.chevron,
				"data-testid": "flowbite-breadcrumb-separator",
			}),
			r.jsxs(C, {
				ref: u,
				className: t.href[o ? "on" : "off"],
				"data-testid": "flowbite-breadcrumb-item",
				href: c,
				children: [s && r.jsx(s, { "aria-hidden": !0, className: t.icon }), l],
			}),
		],
	});
});
i.displayName = "BreadcrumbItem";
const A = { title: "Components/Breadcrumb", component: f },
	S = (e) =>
		r.jsxs(f, {
			...e,
			children: [
				r.jsx(i, { href: "#", icon: E, children: "Home" }),
				r.jsx(i, { href: "#", children: "Projects" }),
				r.jsx(i, { children: "Flowbite React" }),
			],
		}),
	n = S.bind({}),
	m = S.bind({});
m.storyName = "Solid background";
m.args = { className: "bg-gray-50 px-5 py-3 dark:bg-gray-800" };
var B, y, I;
n.parameters = {
	...n.parameters,
	docs: {
		...((B = n.parameters) == null ? void 0 : B.docs),
		source: {
			originalSource: `args => <Breadcrumb {...args}>\r
        <BreadcrumbItem href="#" icon={HiHome}>\r
            Home\r
        </BreadcrumbItem>\r
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>\r
        <BreadcrumbItem>Flowbite React</BreadcrumbItem>\r
    </Breadcrumb>`,
			...((I = (y = n.parameters) == null ? void 0 : y.docs) == null
				? void 0
				: I.source),
		},
	},
};
var j, T, N;
m.parameters = {
	...m.parameters,
	docs: {
		...((j = m.parameters) == null ? void 0 : j.docs),
		source: {
			originalSource: `args => <Breadcrumb {...args}>\r
        <BreadcrumbItem href="#" icon={HiHome}>\r
            Home\r
        </BreadcrumbItem>\r
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>\r
        <BreadcrumbItem>Flowbite React</BreadcrumbItem>\r
    </Breadcrumb>`,
			...((N = (T = m.parameters) == null ? void 0 : T.docs) == null
				? void 0
				: N.source),
		},
	},
};
const G = ["Default", "SolidBackground"];
export {
	n as Default,
	m as SolidBackground,
	G as __namedExportsOrder,
	A as default,
};
