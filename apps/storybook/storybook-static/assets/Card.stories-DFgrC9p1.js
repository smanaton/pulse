import {
	u as _,
	a as M,
	r as O,
	c as R,
	g as x,
	t as y,
} from "./create-theme-ol-6nsx3.js";
import { r as I, j as t } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const B = R({
		root: {
			base: "flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
			children: "flex h-full flex-col justify-center gap-4 p-6",
			horizontal: { off: "flex-col", on: "flex-col md:max-w-xl md:flex-row" },
			href: "hover:bg-gray-100 dark:hover:bg-gray-700",
		},
		img: {
			base: "",
			horizontal: {
				off: "rounded-t-lg",
				on: "h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg",
			},
		},
	}),
	g = I.forwardRef((r, P) => {
		var f, p;
		const i = _(),
			e = M(
				[B, (f = i.theme) == null ? void 0 : f.card, r.theme],
				[x(i.clearTheme, "card"), r.clearTheme],
				[x(i.applyTheme, "card"), r.applyTheme],
			),
			{
				children: S,
				className: W,
				horizontal: m,
				href: l,
				imgAlt: A,
				imgSrc: h,
				renderImage: d,
				...D
			} = O(r, (p = i.props) == null ? void 0 : p.card),
			E = typeof l > "u" ? "div" : "a";
		return t.jsxs(E, {
			ref: P,
			"data-testid": "flowbite-card",
			href: l,
			className: y(
				e.root.base,
				e.root.horizontal[m ? "on" : "off"],
				l && e.root.href,
				W,
			),
			...D,
			children: [
				(d == null ? void 0 : d(e, !!m)) ??
					(h &&
						t.jsx("img", {
							"data-testid": "flowbite-card-image",
							alt: A ?? "",
							src: h,
							className: y(
								e.img.base,
								e.img.horizontal[r.horizontal ? "on" : "off"],
							),
						})),
				t.jsx("div", { className: e.root.children, children: S }),
			],
		});
	});
g.displayName = "Card";
const K = {
		title: "Components/Card",
		component: g,
		decorators: [(r) => t.jsx("div", { className: "size-1/2", children: r() })],
	},
	c = (r) =>
		t.jsxs(g, {
			...r,
			children: [
				t.jsx("h5", {
					className:
						"font-bold text-2xl text-gray-900 tracking-tight dark:text-white",
					children: "Noteworthy technology acquisitions 2021",
				}),
				t.jsx("p", {
					className: "font-normal text-gray-700 dark:text-gray-400",
					children:
						"Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.",
				}),
			],
		}),
	s = c.bind({});
s.args = {};
const n = c.bind({});
n.args = { horizontal: !0 };
const a = c.bind({});
a.storyName = "With image with alt text";
a.args = {
	imgAlt: "Meaningful alt text for an image that is not purely decorative",
	imgSrc: "https://flowbite.com/docs/images/blog/image-1.jpg",
};
const o = c.bind({});
o.storyName = "With decorative image";
o.args = { imgSrc: "https://flowbite.com/docs/images/blog/image-1.jpg" };
var u, b, w;
s.parameters = {
	...s.parameters,
	docs: {
		...((u = s.parameters) == null ? void 0 : u.docs),
		source: {
			originalSource: `(args: CardProps) => <Card {...args}>\r
        <h5 className="font-bold text-2xl text-gray-900 tracking-tight dark:text-white">\r
            Noteworthy technology acquisitions 2021\r
        </h5>\r
        <p className="font-normal text-gray-700 dark:text-gray-400">\r
            Here are the biggest enterprise technology acquisitions of 2021 so far, in\r
            reverse chronological order.\r
        </p>\r
    </Card>`,
			...((w = (b = s.parameters) == null ? void 0 : b.docs) == null
				? void 0
				: w.source),
		},
	},
};
var N, v, k;
n.parameters = {
	...n.parameters,
	docs: {
		...((N = n.parameters) == null ? void 0 : N.docs),
		source: {
			originalSource: `(args: CardProps) => <Card {...args}>\r
        <h5 className="font-bold text-2xl text-gray-900 tracking-tight dark:text-white">\r
            Noteworthy technology acquisitions 2021\r
        </h5>\r
        <p className="font-normal text-gray-700 dark:text-gray-400">\r
            Here are the biggest enterprise technology acquisitions of 2021 so far, in\r
            reverse chronological order.\r
        </p>\r
    </Card>`,
			...((k = (v = n.parameters) == null ? void 0 : v.docs) == null
				? void 0
				: k.source),
		},
	},
};
var C, j, q;
a.parameters = {
	...a.parameters,
	docs: {
		...((C = a.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: `(args: CardProps) => <Card {...args}>\r
        <h5 className="font-bold text-2xl text-gray-900 tracking-tight dark:text-white">\r
            Noteworthy technology acquisitions 2021\r
        </h5>\r
        <p className="font-normal text-gray-700 dark:text-gray-400">\r
            Here are the biggest enterprise technology acquisitions of 2021 so far, in\r
            reverse chronological order.\r
        </p>\r
    </Card>`,
			...((q = (j = a.parameters) == null ? void 0 : j.docs) == null
				? void 0
				: q.source),
		},
	},
};
var z, T, H;
o.parameters = {
	...o.parameters,
	docs: {
		...((z = o.parameters) == null ? void 0 : z.docs),
		source: {
			originalSource: `(args: CardProps) => <Card {...args}>\r
        <h5 className="font-bold text-2xl text-gray-900 tracking-tight dark:text-white">\r
            Noteworthy technology acquisitions 2021\r
        </h5>\r
        <p className="font-normal text-gray-700 dark:text-gray-400">\r
            Here are the biggest enterprise technology acquisitions of 2021 so far, in\r
            reverse chronological order.\r
        </p>\r
    </Card>`,
			...((H = (T = o.parameters) == null ? void 0 : T.docs) == null
				? void 0
				: H.source),
		},
	},
};
const L = ["Default", "Horizontal", "WithA11yImage", "WithDecorativeImage"];
export {
	s as Default,
	n as Horizontal,
	a as WithA11yImage,
	o as WithDecorativeImage,
	L as __namedExportsOrder,
	K as default,
};
