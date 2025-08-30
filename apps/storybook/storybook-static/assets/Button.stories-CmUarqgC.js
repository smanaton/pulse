import { b as i, B as r } from "./Button-BrGC8bZN.js";
import { j as n } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
import "./create-theme-ol-6nsx3.js";
const d = {
		title: "Components/Button",
		component: r,
		argTypes: {
			color: {
				options: Object.keys(i.color),
				control: { type: "inline-radio" },
			},
			size: {
				options: ["xs", "sm", "md", "lg", "xl"],
				control: { type: "inline-radio" },
			},
		},
		args: { disabled: !1 },
	},
	m = (a) => n.jsx(r, { ...a }),
	t = m.bind({});
t.storyName = "Default";
t.args = { children: "Button" };
var o, e, s;
t.parameters = {
	...t.parameters,
	docs: {
		...((o = t.parameters) == null ? void 0 : o.docs),
		source: {
			originalSource: "args => <Button {...args} />",
			...((s = (e = t.parameters) == null ? void 0 : e.docs) == null
				? void 0
				: s.source),
		},
	},
};
const B = ["DefaultButton"];
export { t as DefaultButton, B as __namedExportsOrder, d as default };
