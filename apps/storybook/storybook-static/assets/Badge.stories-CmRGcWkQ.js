import { B as f, b as t } from "./Badge-CCdaVxty.js";
import { j as a } from "./iframe-ByD-PdrA.js";
import { d as B } from "./index-CK8OVH7d.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
import "./create-theme-ol-6nsx3.js";
const O = {
		title: "Components/Badge",
		component: f,
		argTypes: {
			color: {
				options: Object.keys(t.root.color),
				control: { type: "inline-radio" },
			},
			size: {
				options: Object.keys(t.root.size),
				control: { type: "inline-radio" },
			},
		},
	},
	s = (y) =>
		a.jsx("div", {
			className: "flex items-center",
			children: a.jsx(f, { ...y }),
		}),
	e = s.bind({});
e.storyName = "Default";
e.args = { children: "Default" };
const r = s.bind({});
r.storyName = "With icon";
r.args = { color: "indigo", icon: B, children: "2 minutes ago" };
const o = s.bind({});
o.storyName = "Only icon";
o.args = { color: "green", icon: B };
var c, i, n;
e.parameters = {
	...e.parameters,
	docs: {
		...((c = e.parameters) == null ? void 0 : c.docs),
		source: {
			originalSource: `args => <div className="flex items-center">\r
        <Badge {...args} />\r
    </div>`,
			...((n = (i = e.parameters) == null ? void 0 : i.docs) == null
				? void 0
				: n.source),
		},
	},
};
var d, m, l;
r.parameters = {
	...r.parameters,
	docs: {
		...((d = r.parameters) == null ? void 0 : d.docs),
		source: {
			originalSource: `args => <div className="flex items-center">\r
        <Badge {...args} />\r
    </div>`,
			...((l = (m = r.parameters) == null ? void 0 : m.docs) == null
				? void 0
				: l.source),
		},
	},
};
var g, p, u;
o.parameters = {
	...o.parameters,
	docs: {
		...((g = o.parameters) == null ? void 0 : g.docs),
		source: {
			originalSource: `args => <div className="flex items-center">\r
        <Badge {...args} />\r
    </div>`,
			...((u = (p = o.parameters) == null ? void 0 : p.docs) == null
				? void 0
				: u.source),
		},
	},
};
const D = ["DefaultBadge", "BadgeWithIcon", "BadgeOnlyIcon"];
export {
	o as BadgeOnlyIcon,
	r as BadgeWithIcon,
	e as DefaultBadge,
	D as __namedExportsOrder,
	O as default,
};
