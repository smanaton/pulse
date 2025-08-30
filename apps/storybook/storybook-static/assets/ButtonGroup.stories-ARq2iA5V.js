import { a as b, c as P, B as s } from "./Button-BrGC8bZN.js";
import {
	r as j,
	g as p,
	t as T,
	a as v,
	u as y,
} from "./create-theme-ol-6nsx3.js";
import { r as f, j as r } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const a = f.forwardRef((o, i) => {
	var n, u;
	const e = y(),
		d = v(
			[b, (n = e.theme) == null ? void 0 : n.buttonGroup, o.theme],
			[p(e.clearTheme, "buttonGroup"), o.clearTheme],
			[p(e.applyTheme, "buttonGroup"), o.applyTheme],
		),
		{
			children: g,
			className: h,
			outline: B,
			pill: G,
			...x
		} = j(o, (u = e.props) == null ? void 0 : u.buttonGroup);
	return r.jsx(P.Provider, {
		value: { outline: B, pill: G },
		children: r.jsx("div", {
			ref: i,
			className: T(d.base, h),
			role: "group",
			...x,
			children: g,
		}),
	});
});
a.displayName = "ButtonGroup";
const _ = { title: "Components/Button", component: a },
	N = (o) =>
		r.jsxs(a, {
			...o,
			children: [
				r.jsx(s, { color: "gray", children: "Profile" }),
				r.jsx(s, { color: "gray", children: "Settings" }),
				r.jsx(s, { color: "gray", children: "Messages" }),
			],
		}),
	t = N.bind({});
t.storyName = "ButtonGroup";
t.args = {};
var l, c, m;
t.parameters = {
	...t.parameters,
	docs: {
		...((l = t.parameters) == null ? void 0 : l.docs),
		source: {
			originalSource: `args => <ButtonGroup {...args}>\r
        <Button color="gray">Profile</Button>\r
        <Button color="gray">Settings</Button>\r
        <Button color="gray">Messages</Button>\r
    </ButtonGroup>`,
			...((m = (c = t.parameters) == null ? void 0 : c.docs) == null
				? void 0
				: m.source),
		},
	},
};
const w = ["DefaultAvatarGroup"];
export { t as DefaultAvatarGroup, w as __namedExportsOrder, _ as default };
