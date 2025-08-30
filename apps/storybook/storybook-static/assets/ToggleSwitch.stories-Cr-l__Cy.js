import {
	c as A,
	u as B,
	g as b,
	a as G,
	r as H,
	t as y,
} from "./create-theme-ol-6nsx3.js";
import { r as d, j as r } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const L = A({
		root: {
			base: "group flex rounded-lg focus:outline-none",
			active: { on: "cursor-pointer", off: "cursor-not-allowed opacity-50" },
			label:
				"ms-3 mt-0.5 text-start text-sm font-medium text-gray-900 dark:text-gray-300",
			input: "sr-only",
		},
		toggle: {
			base: "relative rounded-full after:absolute after:rounded-full after:border after:bg-white after:transition-all group-focus:ring-4",
			checked: {
				on: "after:translate-x-full after:border-transparent rtl:after:-translate-x-full",
				off: "bg-gray-200 after:border-gray-300 dark:bg-gray-700",
				color: {
					default:
						"bg-primary-700 group-focus:ring-primary-300 dark:group-focus:ring-primary-800",
					blue: "bg-blue-700 group-focus:ring-blue-300 dark:group-focus:ring-blue-800",
					dark: "bg-gray-700 group-focus:ring-gray-300 dark:group-focus:ring-gray-800",
					failure:
						"bg-red-700 group-focus:ring-red-300 dark:group-focus:ring-red-800",
					gray: "bg-gray-500 group-focus:ring-gray-300 dark:group-focus:ring-gray-800",
					green:
						"bg-green-600 group-focus:ring-green-300 dark:group-focus:ring-green-800",
					light:
						"bg-gray-300 group-focus:ring-gray-300 dark:group-focus:ring-gray-800",
					red: "bg-red-700 group-focus:ring-red-300 dark:group-focus:ring-red-800",
					purple:
						"bg-purple-700 group-focus:ring-purple-300 dark:group-focus:ring-purple-800",
					success:
						"bg-green-500 group-focus:ring-green-300 dark:group-focus:ring-green-800",
					yellow:
						"bg-yellow-400 group-focus:ring-yellow-300 dark:group-focus:ring-yellow-800",
					warning:
						"bg-yellow-600 group-focus:ring-yellow-300 dark:group-focus:ring-yellow-800",
					cyan: "bg-cyan-500 group-focus:ring-cyan-300 dark:group-focus:ring-cyan-800",
					lime: "bg-lime-400 group-focus:ring-lime-300 dark:group-focus:ring-lime-800",
					indigo:
						"bg-indigo-400 group-focus:ring-indigo-300 dark:group-focus:ring-indigo-800",
					teal: "bg-teal-400 group-focus:ring-teal-300 dark:group-focus:ring-teal-800",
					info: "bg-cyan-600 group-focus:ring-cyan-300 dark:group-focus:ring-cyan-800",
					pink: "bg-pink-600 group-focus:ring-pink-300 dark:group-focus:ring-pink-800",
				},
			},
			sizes: {
				sm: "h-5 w-9 min-w-9 after:left-0.5 after:top-0.5 after:h-4 after:w-4 rtl:after:right-0.5",
				md: "h-6 w-11 min-w-11 after:left-0.5 after:top-0.5 after:h-5 after:w-5 rtl:after:right-0.5",
				lg: "h-7 w-[52px] min-w-[52px] after:left-0.5 after:top-0.5 after:h-6 after:w-6 rtl:after:right-0.5",
			},
		},
	}),
	f = d.forwardRef((o, h) => {
		var w, m;
		const i = d.useId(),
			c = B(),
			e = G(
				[L, (w = c.theme) == null ? void 0 : w.toggleSwitch, o.theme],
				[b(c.clearTheme, "toggleSwitch"), o.clearTheme],
				[b(c.applyTheme, "toggleSwitch"), o.applyTheme],
			),
			{
				checked: g,
				className: P,
				color: R = "default",
				sizing: _ = "md",
				disabled: p,
				label: l,
				name: $,
				onChange: I,
				...K
			} = H(o, (m = c.props) == null ? void 0 : m.toggleSwitch);
		function F() {
			I(!g);
		}
		function q(k) {
			k.code == "Enter" && k.preventDefault();
		}
		return r.jsxs(r.Fragment, {
			children: [
				r.jsx("input", {
					ref: h,
					checked: g,
					name: $,
					type: "checkbox",
					className: e.root.input,
					readOnly: !0,
					hidden: !0,
				}),
				r.jsxs("button", {
					"aria-checked": g,
					"aria-labelledby": `${i}-flowbite-toggleswitch-label`,
					disabled: p,
					id: `${i}-flowbite-toggleswitch`,
					onClick: F,
					onKeyDown: q,
					role: "switch",
					tabIndex: 0,
					type: "button",
					className: y(e.root.base, e.root.active[p ? "off" : "on"], P),
					...K,
					children: [
						r.jsx("div", {
							"data-testid": "flowbite-toggleswitch-toggle",
							className: y(
								e.toggle.base,
								e.toggle.checked.color[R],
								e.toggle.checked[g ? "on" : "off"],
								e.toggle.sizes[_],
							),
						}),
						!!(l != null && l.length) &&
							r.jsx("span", {
								"data-testid": "flowbite-toggleswitch-label",
								id: `${i}-flowbite-toggleswitch-label`,
								className: e.root.label,
								children: l,
							}),
					],
				}),
			],
		});
	});
f.displayName = "ToggleSwitch";
const J = Object.keys(L.toggle.checked.color),
	W = { title: "Components/ToggleSwitch", component: f },
	u = ({ checked: o, ...h }) => {
		const [i, c] = d.useState(o),
			e = () => {
				c((g) => !g);
			};
		return r.jsx(f, { ...h, checked: i, onChange: e });
	},
	t = u.bind({});
t.storyName = "Toggle switch";
t.args = {};
t.argTypes = {
	color: {
		description: "Control defaults for colors",
		control: { type: "radio", options: [...J] },
	},
};
const a = u.bind({});
a.storyName = "Small Toggle switch";
a.args = { sizing: "sm", label: "small toggle switch" };
const n = u.bind({});
n.storyName = "Medium Toggle switch";
n.args = { sizing: "md", label: "default toggle switch" };
const s = u.bind({});
s.storyName = "Large Toggle switch";
s.args = { sizing: "lg", label: "large toggle switch" };
var C, S, T;
t.parameters = {
	...t.parameters,
	docs: {
		...((C = t.parameters) == null ? void 0 : C.docs),
		source: {
			originalSource: `({
  checked,
  ...args
}) => {
  const [switchChecked, setSwitchChecked] = useState(checked);
  const handleChange = () => {
    setSwitchChecked(currentCheck => !currentCheck);
  };
  return <ToggleSwitch {...args} checked={switchChecked} onChange={handleChange} />;
}`,
			...((T = (S = t.parameters) == null ? void 0 : S.docs) == null
				? void 0
				: T.source),
		},
	},
};
var x, N, j;
a.parameters = {
	...a.parameters,
	docs: {
		...((x = a.parameters) == null ? void 0 : x.docs),
		source: {
			originalSource: `({
  checked,
  ...args
}) => {
  const [switchChecked, setSwitchChecked] = useState(checked);
  const handleChange = () => {
    setSwitchChecked(currentCheck => !currentCheck);
  };
  return <ToggleSwitch {...args} checked={switchChecked} onChange={handleChange} />;
}`,
			...((j = (N = a.parameters) == null ? void 0 : N.docs) == null
				? void 0
				: j.source),
		},
	},
};
var v, z, D;
n.parameters = {
	...n.parameters,
	docs: {
		...((v = n.parameters) == null ? void 0 : v.docs),
		source: {
			originalSource: `({
  checked,
  ...args
}) => {
  const [switchChecked, setSwitchChecked] = useState(checked);
  const handleChange = () => {
    setSwitchChecked(currentCheck => !currentCheck);
  };
  return <ToggleSwitch {...args} checked={switchChecked} onChange={handleChange} />;
}`,
			...((D = (z = n.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: D.source),
		},
	},
};
var E, M, O;
s.parameters = {
	...s.parameters,
	docs: {
		...((E = s.parameters) == null ? void 0 : E.docs),
		source: {
			originalSource: `({
  checked,
  ...args
}) => {
  const [switchChecked, setSwitchChecked] = useState(checked);
  const handleChange = () => {
    setSwitchChecked(currentCheck => !currentCheck);
  };
  return <ToggleSwitch {...args} checked={switchChecked} onChange={handleChange} />;
}`,
			...((O = (M = s.parameters) == null ? void 0 : M.docs) == null
				? void 0
				: O.source),
		},
	},
};
const X = [
	"DefaultToggleSwitch",
	"SmallToggleSwitch",
	"MediumToggleSwitch",
	"LargeToggleSwitch",
];
export {
	t as DefaultToggleSwitch,
	s as LargeToggleSwitch,
	n as MediumToggleSwitch,
	a as SmallToggleSwitch,
	X as __namedExportsOrder,
	W as default,
};
