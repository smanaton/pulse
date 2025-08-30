import { A as o } from "./Avatar-bF8jgGr_.js";
import { j as e } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
import "./create-theme-ol-6nsx3.js";
const h = { title: "Components/Avatar", component: o },
	d = (s) => e.jsx(o, { ...s }),
	t = d.bind({});
t.storyName = "Default";
t.args = {
	alt: "Your avatar",
	img: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
};
const r = (s) =>
	e.jsxs(e.Fragment, {
		children: [
			e.jsx(o, {
				...s,
				img: (n) =>
					e.jsxs("picture", {
						children: [
							e.jsx("source", {
								media: "(min-width: 900px)",
								srcSet:
									"https://flowbite.com/docs/images/people/profile-picture-3.jpg",
							}),
							e.jsx("source", {
								media: "(min-width: 480px)",
								srcSet:
									"https://flowbite.com/docs/images/people/profile-picture-4.jpg",
							}),
							e.jsx("img", {
								alt: "",
								src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
								...n,
							}),
						],
					}),
			}),
			e.jsx("small", {
				className: "block text-center text-gray-500",
				children: "Hint: Resize the viewport",
			}),
		],
	});
r.storyName = "Custom Image Element";
r.__docgenInfo = { description: "", methods: [], displayName: "CustomImage" };
var a, p, i;
t.parameters = {
	...t.parameters,
	docs: {
		...((a = t.parameters) == null ? void 0 : a.docs),
		source: {
			originalSource: "args => <Avatar {...args} />",
			...((i = (p = t.parameters) == null ? void 0 : p.docs) == null
				? void 0
				: i.source),
		},
	},
};
var m, c, l;
r.parameters = {
	...r.parameters,
	docs: {
		...((m = r.parameters) == null ? void 0 : m.docs),
		source: {
			originalSource: `props => <>\r
        <Avatar {...props} img={props => <picture>\r
                    <source media="(min-width: 900px)" srcSet="https://flowbite.com/docs/images/people/profile-picture-3.jpg" />\r
                    <source media="(min-width: 480px)" srcSet="https://flowbite.com/docs/images/people/profile-picture-4.jpg" />\r
                    <img alt="" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" {...props} />\r
                </picture>} />\r
        <small className="block text-center text-gray-500">\r
            Hint: Resize the viewport\r
        </small>\r
    </>`,
			...((l = (c = r.parameters) == null ? void 0 : c.docs) == null
				? void 0
				: l.source),
		},
	},
};
const j = ["DefaultAvatar", "CustomImage"];
export {
	r as CustomImage,
	t as DefaultAvatar,
	j as __namedExportsOrder,
	h as default,
};
