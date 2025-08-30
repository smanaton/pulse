import { B as s } from "./Button-BrGC8bZN.js";
import { j as a } from "./iframe-ByD-PdrA.js";
import { T as f } from "./Tooltip-rMIAfTv1.js";
import "./preload-helper-Dp1pzeXC.js";
import "./create-theme-ol-6nsx3.js";
import "./floating-ui.react-Dgys7JzL.js";
import "./index-DSXAykh4.js";
import "./index-DpZf8u-K.js";
import "./use-floating-DojRaj4Q.js";
const _ = { title: "Components/Tooltip", component: f },
	i = (x) => a.jsx(f, { ...x }),
	o = i.bind({});
o.storyName = "Default";
o.args = {
	content: "Tooltip content",
	placement: "bottom",
	children: a.jsx(s, { children: "Default tooltip" }),
};
const r = i.bind({});
r.storyName = "Trigger on click";
r.args = {
	content: "Tooltip content",
	placement: "bottom",
	trigger: "click",
	children: a.jsx(s, { children: "Clickable tooltip" }),
};
const t = i.bind({});
t.storyName = "No arrow";
t.args = {
	arrow: !1,
	content: "Tooltip content",
	placement: "bottom",
	children: a.jsx(s, { children: "Tooltip with no arrow" }),
};
const e = i.bind({});
e.storyName = "Slow animation";
e.args = {
	animation: "duration-1000",
	content: "Tooltip content",
	placement: "bottom",
	children: a.jsx(s, { children: "Tooltip with slow animation" }),
};
var n, c, p;
o.parameters = {
	...o.parameters,
	docs: {
		...((n = o.parameters) == null ? void 0 : n.docs),
		source: {
			originalSource: "args => <Tooltip {...args} />",
			...((p = (c = o.parameters) == null ? void 0 : c.docs) == null
				? void 0
				: p.source),
		},
	},
};
var l, m, d;
r.parameters = {
	...r.parameters,
	docs: {
		...((l = r.parameters) == null ? void 0 : l.docs),
		source: {
			originalSource: "args => <Tooltip {...args} />",
			...((d = (m = r.parameters) == null ? void 0 : m.docs) == null
				? void 0
				: d.source),
		},
	},
};
var g, u, T;
t.parameters = {
	...t.parameters,
	docs: {
		...((g = t.parameters) == null ? void 0 : g.docs),
		source: {
			originalSource: "args => <Tooltip {...args} />",
			...((T = (u = t.parameters) == null ? void 0 : u.docs) == null
				? void 0
				: T.source),
		},
	},
};
var w, h, b;
e.parameters = {
	...e.parameters,
	docs: {
		...((w = e.parameters) == null ? void 0 : w.docs),
		source: {
			originalSource: "args => <Tooltip {...args} />",
			...((b = (h = e.parameters) == null ? void 0 : h.docs) == null
				? void 0
				: b.source),
		},
	},
};
const B = ["DefaultTooltip", "TriggerOnClick", "NoArrow", "SlowAnimation"];
export {
	o as DefaultTooltip,
	t as NoArrow,
	e as SlowAnimation,
	r as TriggerOnClick,
	B as __namedExportsOrder,
	_ as default,
};
