import {
	r as B,
	c as nt,
	u as q,
	a as st,
	g as W,
	t as y,
} from "./create-theme-ol-6nsx3.js";
import { r as s, j as t } from "./iframe-ByD-PdrA.js";
import { t as at, s as et, h as tt } from "./index-CK8OVH7d.js";
import { c as rt } from "./index-Dr3kFdZH.js";
import "./preload-helper-Dp1pzeXC.js";
import "./iconBase-DsgIZlql.js";
const e = s.forwardRef((n, v) => {
	var g;
	const b = q(),
		{ title: i, ...u } = B(n, (g = b.props) == null ? void 0 : g.tabItem);
	return t.jsx("div", { ref: v, ...u });
});
e.displayName = "TabItem";
const it = nt({
		base: "flex flex-col gap-2",
		tablist: {
			base: "flex text-center",
			variant: {
				default: "flex-wrap border-b border-gray-200 dark:border-gray-700",
				underline:
					"-mb-px flex-wrap border-b border-gray-200 dark:border-gray-700",
				pills:
					"flex-wrap space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400",
				fullWidth:
					"grid w-full grid-flow-col divide-x divide-gray-200 rounded-none text-sm font-medium shadow dark:divide-gray-700 dark:text-gray-400",
			},
			tabitem: {
				base: "flex items-center justify-center rounded-t-lg p-4 text-sm font-medium first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500",
				variant: {
					default: {
						base: "rounded-t-lg",
						active: {
							on: "bg-gray-100 text-primary-600 dark:bg-gray-800 dark:text-primary-500",
							off: "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
						},
					},
					underline: {
						base: "rounded-t-lg",
						active: {
							on: "rounded-t-lg border-b-2 border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500",
							off: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300",
						},
					},
					pills: {
						base: "",
						active: {
							on: "rounded-lg bg-primary-600 text-white",
							off: "rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
						},
					},
					fullWidth: {
						base: "ml-0 flex w-full rounded-none first:ml-0",
						active: {
							on: "rounded-none bg-gray-100 p-4 text-gray-900 dark:bg-gray-700 dark:text-white",
							off: "rounded-none bg-white hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white",
						},
					},
				},
				icon: "mr-2 h-5 w-5",
			},
		},
		tabitemcontainer: {
			base: "",
			variant: { default: "", underline: "", pills: "", fullWidth: "" },
		},
		tabpanel: "py-3",
	}),
	c = s.forwardRef((n, v) => {
		var w, N;
		const b = q(),
			i = st(
				[it, (w = b.theme) == null ? void 0 : w.tabs, n.theme],
				[W(b.clearTheme, "tabs"), n.clearTheme],
				[W(b.applyTheme, "tabs"), n.applyTheme],
			),
			{
				children: u,
				className: g,
				onActiveTabChange: P,
				variant: D = "default",
				...G
			} = B(n, (N = b.props) == null ? void 0 : N.tabs),
			f = s.useId(),
			T = s.useMemo(
				() => s.Children.map(s.Children.toArray(u), ({ props: a }) => a),
				[u],
			),
			k = s.useRef([]),
			[x, Q] = s.useState(
				Math.max(
					0,
					T.findIndex((a) => a.active),
				),
			),
			[m, I] = s.useState(-1);
		function j(a) {
			Q(a), P && P(a);
		}
		function V({ target: a }) {
			j(a), I(a);
		}
		function Y({ event: a, target: r }) {
			a.key === "ArrowLeft" && I(Math.max(0, m - 1)),
				a.key === "ArrowRight" && I(Math.min(T.length - 1, m + 1)),
				a.key === "Enter" && (j(r), I(r));
		}
		const S = i.tablist.tabitem.variant[D],
			Z = i.tabitemcontainer.variant[D];
		return (
			s.useEffect(() => {
				var a;
				(a = k.current[m]) == null || a.focus();
			}, [m]),
			s.useImperativeHandle(v, () => ({ setActiveTab: j })),
			t.jsxs("div", {
				className: y(i.base, g),
				children: [
					t.jsx("div", {
						"aria-label": "Tabs",
						role: "tablist",
						className: y(i.tablist.base, i.tablist.variant[D], g),
						...G,
						children: T.map((a, r) =>
							t.jsxs(
								"button",
								{
									type: "button",
									"aria-controls": `${f}-tabpanel-${r}`,
									"aria-selected": r === x,
									className: y(
										i.tablist.tabitem.base,
										S.base,
										r === x && S.active.on,
										r !== x && !a.disabled && S.active.off,
									),
									disabled: a.disabled,
									id: `${f}-tab-${r}`,
									onClick: () => V({ target: r }),
									onKeyDown: (C) => Y({ event: C, target: r }),
									ref: (C) => {
										k.current[r] = C;
									},
									role: "tab",
									tabIndex: r === m ? 0 : -1,
									style: { zIndex: r === m ? 2 : 1 },
									children: [
										a.icon &&
											t.jsx(a.icon, { className: i.tablist.tabitem.icon }),
										a.title,
									],
								},
								r,
							),
						),
					}),
					t.jsx("div", {
						className: y(i.tabitemcontainer.base, Z),
						children: T.map((a, r) =>
							t.jsx(
								"div",
								{
									"aria-labelledby": `${f}-tab-${r}`,
									className: i.tabpanel,
									hidden: r !== x,
									id: `${f}-tabpanel-${r}`,
									role: "tabpanel",
									tabIndex: 0,
									children: a.children,
								},
								r,
							),
						),
					}),
				],
			})
		);
	});
c.displayName = "Tabs";
const ht = {
		title: "Components/Tabs",
		component: c,
		args: { className: "bg-white rounded-lg dark:bg-gray-800 dark:text-white" },
		argTypes: {
			className: { control: "text" },
			variant: {
				control: "radio",
				options: ["default", "underline", "pills", "fullWidth"],
			},
		},
	},
	p = (n) =>
		t.jsxs(c, {
			...n,
			children: [
				t.jsx(e, { title: "Profile", children: "Profile content" }),
				t.jsx(e, { title: "Dashboard", children: "Dashboard content" }),
				t.jsx(e, { title: "Settings", children: "Settings content" }),
				t.jsx(e, { title: "Contacts", children: "Contacts content" }),
				t.jsx(e, {
					disabled: !0,
					title: "Disabled",
					children: "Disabled content",
				}),
			],
		}),
	o = (n) =>
		t.jsxs(c, {
			...n,
			children: [
				t.jsx(e, { title: "Profile", children: "Profile content" }),
				t.jsx(e, { title: "Dashboard", children: "Dashboard content" }),
				t.jsx(e, { title: "Settings", children: "Settings content" }),
				t.jsx(e, { title: "Contacts", children: "Contacts content" }),
				t.jsx(e, {
					disabled: !0,
					title: "Disabled",
					children: "Disabled content",
				}),
			],
		});
o.args = { variant: "underline" };
o.storyName = "With underline";
const l = (n) =>
	t.jsxs(c, {
		...n,
		children: [
			t.jsx(e, { title: "Profile", icon: tt, children: "Profile content" }),
			t.jsx(e, {
				active: !0,
				title: "Dashboard",
				icon: rt,
				children: "Dashboard content",
			}),
			t.jsx(e, { title: "Settings", icon: et, children: "Settings content" }),
			t.jsx(e, { title: "Contacts", icon: at, children: "Contacts content" }),
			t.jsx(e, {
				disabled: !0,
				title: "Disabled",
				children: "Disabled content",
			}),
		],
	});
l.args = { variant: "underline" };
l.storyName = "With icons";
const h = (n) =>
	t.jsxs(c, {
		...n,
		children: [
			t.jsx(e, { title: "Profile", children: "Profile content" }),
			t.jsx(e, { title: "Dashboard", children: "Dashboard content" }),
			t.jsx(e, { title: "Settings", children: "Settings content" }),
			t.jsx(e, { title: "Contacts", children: "Contacts content" }),
			t.jsx(e, {
				disabled: !0,
				title: "Disabled",
				children: "Disabled content",
			}),
		],
	});
h.args = { variant: "pills" };
const d = (n) =>
	t.jsxs(c, {
		...n,
		children: [
			t.jsx(e, { title: "Profile", children: "Profile content" }),
			t.jsx(e, { title: "Dashboard", children: "Dashboard content" }),
			t.jsx(e, { title: "Settings", children: "Settings content" }),
			t.jsx(e, { title: "Contacts", children: "Contacts content" }),
			t.jsx(e, {
				disabled: !0,
				title: "Disabled",
				children: "Disabled content",
			}),
		],
	});
d.args = { variant: "fullWidth" };
d.storyName = "Full width";
p.__docgenInfo = { description: "", methods: [], displayName: "Default" };
o.__docgenInfo = { description: "", methods: [], displayName: "WithUnderline" };
l.__docgenInfo = { description: "", methods: [], displayName: "WithIcons" };
h.__docgenInfo = { description: "", methods: [], displayName: "Pills" };
d.__docgenInfo = { description: "", methods: [], displayName: "FullWidth" };
var _, E, A;
p.parameters = {
	...p.parameters,
	docs: {
		...((_ = p.parameters) == null ? void 0 : _.docs),
		source: {
			originalSource: `(args: TabsProps): JSX.Element => <Tabs {...args}>\r
        <TabItem title="Profile">Profile content</TabItem>\r
        <TabItem title="Dashboard">Dashboard content</TabItem>\r
        <TabItem title="Settings">Settings content</TabItem>\r
        <TabItem title="Contacts">Contacts content</TabItem>\r
        <TabItem disabled title="Disabled">\r
            Disabled content\r
        </TabItem>\r
    </Tabs>`,
			...((A = (E = p.parameters) == null ? void 0 : E.docs) == null
				? void 0
				: A.source),
		},
	},
};
var $, H, M;
o.parameters = {
	...o.parameters,
	docs: {
		...(($ = o.parameters) == null ? void 0 : $.docs),
		source: {
			originalSource: `(args: TabsProps): JSX.Element => <Tabs {...args}>\r
        <TabItem title="Profile">Profile content</TabItem>\r
        <TabItem title="Dashboard">Dashboard content</TabItem>\r
        <TabItem title="Settings">Settings content</TabItem>\r
        <TabItem title="Contacts">Contacts content</TabItem>\r
        <TabItem disabled title="Disabled">\r
            Disabled content\r
        </TabItem>\r
    </Tabs>`,
			...((M = (H = o.parameters) == null ? void 0 : H.docs) == null
				? void 0
				: M.source),
		},
	},
};
var R, F, J;
l.parameters = {
	...l.parameters,
	docs: {
		...((R = l.parameters) == null ? void 0 : R.docs),
		source: {
			originalSource: `(args: TabsProps): JSX.Element => <Tabs {...args}>\r
        <TabItem title="Profile" icon={HiUserCircle}>\r
            Profile content\r
        </TabItem>\r
        <TabItem active={true} title="Dashboard" icon={MdDashboard}>\r
            Dashboard content\r
        </TabItem>\r
        <TabItem title="Settings" icon={HiAdjustments}>\r
            Settings content\r
        </TabItem>\r
        <TabItem title="Contacts" icon={HiClipboardList}>\r
            Contacts content\r
        </TabItem>\r
        <TabItem disabled={true} title="Disabled">\r
            Disabled content\r
        </TabItem>\r
    </Tabs>`,
			...((J = (F = l.parameters) == null ? void 0 : F.docs) == null
				? void 0
				: J.source),
		},
	},
};
var U, X, L;
h.parameters = {
	...h.parameters,
	docs: {
		...((U = h.parameters) == null ? void 0 : U.docs),
		source: {
			originalSource: `(args: TabsProps): JSX.Element => <Tabs {...args}>\r
        <TabItem title="Profile">Profile content</TabItem>\r
        <TabItem title="Dashboard">Dashboard content</TabItem>\r
        <TabItem title="Settings">Settings content</TabItem>\r
        <TabItem title="Contacts">Contacts content</TabItem>\r
        <TabItem disabled title="Disabled">\r
            Disabled content\r
        </TabItem>\r
    </Tabs>`,
			...((L = (X = h.parameters) == null ? void 0 : X.docs) == null
				? void 0
				: L.source),
		},
	},
};
var K, z, O;
d.parameters = {
	...d.parameters,
	docs: {
		...((K = d.parameters) == null ? void 0 : K.docs),
		source: {
			originalSource: `(args: TabsProps): JSX.Element => <Tabs {...args}>\r
        <TabItem title="Profile">Profile content</TabItem>\r
        <TabItem title="Dashboard">Dashboard content</TabItem>\r
        <TabItem title="Settings">Settings content</TabItem>\r
        <TabItem title="Contacts">Contacts content</TabItem>\r
        <TabItem disabled title="Disabled">\r
            Disabled content\r
        </TabItem>\r
    </Tabs>`,
			...((O = (z = d.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: O.source),
		},
	},
};
const gt = ["Default", "WithUnderline", "WithIcons", "Pills", "FullWidth"];
export {
	p as Default,
	d as FullWidth,
	h as Pills,
	l as WithIcons,
	o as WithUnderline,
	gt as __namedExportsOrder,
	ht as default,
};
