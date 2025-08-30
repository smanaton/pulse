import { B as h } from "./Button-BrGC8bZN.js";
import { u, r as x } from "./create-theme-ol-6nsx3.js";
import { j as e, r as f } from "./iframe-ByD-PdrA.js";
import { e as y } from "./index-CK8OVH7d.js";
import { M as B } from "./index-Dr3kFdZH.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const i = f.forwardRef((t, n) => {
	var s;
	const o = u(),
		a = x(t, (s = o.props) == null ? void 0 : s.banner);
	return e.jsx("div", {
		ref: n,
		"data-testid": "flowbite-banner",
		role: "banner",
		tabIndex: -1,
		...a,
	});
});
i.displayName = "Banner";
const b = f.forwardRef((t, n) => {
	var d;
	const o = u(),
		a = x(t, (d = o.props) == null ? void 0 : d.bannerCollapseButton);
	function s(g) {
		const l = g.target.closest('[role="banner"]');
		l == null || l.remove();
	}
	return e.jsx(h, { ref: n, onClick: s, ...a });
});
b.displayName = "BannerCollapseButton";
const R = { title: "Components/Banner", component: i },
	j = (t) => e.jsx(i, { ...t }),
	r = j.bind({});
r.storyName = "Default";
r.args = {
	children: e.jsxs("div", {
		className:
			"fixed top-0 left-0 z-50 flex w-full justify-between border-gray-200 border-b bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700",
		children: [
			e.jsx("div", {
				className: "mx-auto flex items-center",
				children: e.jsxs("p", {
					className:
						"flex items-center font-normal text-gray-500 text-sm dark:text-gray-400",
					children: [
						e.jsx(B, {}),
						e.jsxs("span", {
							children: [
								"New brand identity has been launched for the",
								" ",
								e.jsx("a", {
									href: "https://flowbite.com",
									className:
										"inline font-medium text-cyan-600 underline decoration-solid underline-offset-2 hover:no-underline dark:text-cyan-500",
									children: "Flowbite Library",
								}),
							],
						}),
					],
				}),
			}),
			e.jsx(b, {
				color: "gray",
				className: "border-0 bg-transparent px-0",
				children: e.jsx(y, { className: "size-4" }),
			}),
		],
	}),
};
var c, m, p;
r.parameters = {
	...r.parameters,
	docs: {
		...((c = r.parameters) == null ? void 0 : c.docs),
		source: {
			originalSource: "args => <Banner {...args} />",
			...((p = (m = r.parameters) == null ? void 0 : m.docs) == null
				? void 0
				: p.source),
		},
	},
};
const _ = ["DefaultBanner"];
export { r as DefaultBanner, _ as __namedExportsOrder, R as default };
