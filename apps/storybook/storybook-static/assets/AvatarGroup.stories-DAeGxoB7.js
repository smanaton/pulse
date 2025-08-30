import { A as m, a as w } from "./Avatar-bF8jgGr_.js";
import {
	t as b,
	a as G,
	r as T,
	g as u,
	u as x,
} from "./create-theme-ol-6nsx3.js";
import { r as A, j as t } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const n = A.forwardRef((e, c) => {
	var s, p, o;
	const r = x(),
		i = G(
			[
				w.group,
				(p = (s = r.theme) == null ? void 0 : s.avatar) == null
					? void 0
					: p.group,
				e.theme,
			],
			[u(r.clearTheme, "avatar"), e.clearTheme],
			[u(r.applyTheme, "avatar"), e.applyTheme],
		),
		{ className: d, ...l } = T(
			e,
			(o = r.props) == null ? void 0 : o.avatarGroup,
		);
	return t.jsx("div", {
		ref: c,
		"data-testid": "avatar-group-element",
		className: b(i.base, d),
		...l,
	});
});
n.displayName = "AvatarGroup";
const C = A.forwardRef((e, c) => {
	var o, g, v;
	const r = x(),
		i = G(
			[
				w.groupCounter,
				(g = (o = r.theme) == null ? void 0 : o.avatar) == null
					? void 0
					: g.groupCounter,
				e.theme,
			],
			[u(r.clearTheme, "avatar.groupCounter"), e.clearTheme],
			[u(r.applyTheme, "avatar.groupCounter"), e.applyTheme],
		),
		{
			className: d,
			href: l,
			total: s,
			...p
		} = T(e, (v = r.props) == null ? void 0 : v.avatarGroupCounter);
	return t.jsxs("a", {
		ref: c,
		href: l,
		className: b(i.base, d),
		...p,
		children: ["+", s],
	});
});
C.displayName = "AvatarGroupCounter";
const E = { title: "Components/Avatar", component: n },
	k = (e) =>
		t.jsxs(n, {
			...e,
			children: [
				t.jsx(m, {
					img: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
					rounded: !0,
					stacked: !0,
				}),
				t.jsx(m, {
					img: "https://flowbite.com/docs/images/people/profile-picture-2.jpg",
					rounded: !0,
					stacked: !0,
				}),
				t.jsx(m, {
					img: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
					rounded: !0,
					stacked: !0,
				}),
				t.jsx(m, {
					img: "https://flowbite.com/docs/images/people/profile-picture-4.jpg",
					rounded: !0,
					stacked: !0,
				}),
				t.jsx(C, { total: 99, href: "#" }),
			],
		}),
	a = k.bind({});
a.storyName = "Grouped";
a.args = {};
var h, f, j;
a.parameters = {
	...a.parameters,
	docs: {
		...((h = a.parameters) == null ? void 0 : h.docs),
		source: {
			originalSource: `args => <AvatarGroup {...args}>\r
        <Avatar img="https://flowbite.com/docs/images/people/profile-picture-1.jpg" rounded stacked />\r
        <Avatar img="https://flowbite.com/docs/images/people/profile-picture-2.jpg" rounded stacked />\r
        <Avatar img="https://flowbite.com/docs/images/people/profile-picture-3.jpg" rounded stacked />\r
        <Avatar img="https://flowbite.com/docs/images/people/profile-picture-4.jpg" rounded stacked />\r
        <AvatarGroupCounter total={99} href="#" />\r
    </AvatarGroup>`,
			...((j = (f = a.parameters) == null ? void 0 : f.docs) == null
				? void 0
				: j.source),
		},
	},
};
const _ = ["DefaultAvatarGroup"];
export { a as DefaultAvatarGroup, _ as __namedExportsOrder, E as default };
