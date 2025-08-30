import {
	u as P,
	r as R,
	c as T,
	t,
	g as v,
	a as z,
} from "./create-theme-ol-6nsx3.js";
import { r as N, j as r } from "./iframe-ByD-PdrA.js";
const A = T({
		root: {
			base: "flex items-center justify-center space-x-4 rounded",
			inner: "relative",
			bordered: "p-1 ring-2",
			rounded: "rounded-full",
			color: {
				dark: "ring-gray-800 dark:ring-gray-800",
				failure: "ring-red-500 dark:ring-red-700",
				gray: "ring-gray-500 dark:ring-gray-400",
				info: "ring-cyan-400 dark:ring-cyan-800",
				light: "ring-gray-300 dark:ring-gray-500",
				purple: "ring-purple-500 dark:ring-purple-600",
				success: "ring-green-500 dark:ring-green-500",
				warning: "ring-yellow-300 dark:ring-yellow-500",
				pink: "ring-pink-500 dark:ring-pink-500",
			},
			img: {
				base: "rounded",
				off: "relative overflow-hidden bg-gray-100 dark:bg-gray-600",
				on: "",
				placeholder: "absolute -bottom-1 h-auto w-auto text-gray-400",
			},
			size: {
				xs: "h-6 w-6",
				sm: "h-8 w-8",
				md: "h-10 w-10",
				lg: "h-20 w-20",
				xl: "h-36 w-36",
			},
			stacked: "ring-2 ring-gray-300 dark:ring-gray-500",
			statusPosition: {
				"bottom-left": "-bottom-1 -left-1",
				"bottom-center": "-bottom-1",
				"bottom-right": "-bottom-1 -right-1",
				"top-left": "-left-1 -top-1",
				"top-center": "-top-1",
				"top-right": "-right-1 -top-1",
				"center-right": "-right-1",
				center: "",
				"center-left": "-left-1",
			},
			status: {
				away: "bg-yellow-400",
				base: "absolute h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-800",
				busy: "bg-red-400",
				offline: "bg-gray-400",
				online: "bg-green-400",
			},
			initials: {
				text: "font-medium text-gray-600 dark:text-gray-300",
				base: "relative inline-flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-600",
			},
		},
		group: { base: "flex -space-x-4" },
		groupCounter: {
			base: "relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white ring-2 ring-gray-300 hover:bg-gray-600 dark:ring-gray-500",
		},
	}),
	C = N.forwardRef((a, x) => {
		var p, y;
		const o = P(),
			e = z(
				[A, (p = o.theme) == null ? void 0 : p.avatar, a.theme],
				[v(o.clearTheme, "avatar"), a.clearTheme],
				[v(o.applyTheme, "avatar"), a.applyTheme],
			),
			{
				alt: l = "",
				bordered: i = !1,
				children: n,
				className: w,
				color: d = "light",
				img: s,
				placeholderInitials: g = "",
				rounded: c = !1,
				size: m = "md",
				stacked: f = !1,
				status: h,
				statusPosition: k = "top-left",
				...j
			} = R(a, (y = o.props) == null ? void 0 : y.avatar),
			u = t(
				e.root.img.base,
				i && e.root.bordered,
				i && e.root.color[d],
				c && e.root.rounded,
				f && e.root.stacked,
				e.root.img.on,
				e.root.size[m],
			),
			b = {
				className: t(u, e.root.img.on),
				"data-testid": "flowbite-avatar-img",
			};
		return r.jsxs("div", {
			ref: x,
			className: t(e.root.base, w),
			"data-testid": "flowbite-avatar",
			...j,
			children: [
				r.jsxs("div", {
					className: e.root.inner,
					children: [
						s
							? typeof s == "string"
								? r.jsx("img", { alt: l, src: s, ...b })
								: s({ alt: l, ...b })
							: g
								? r.jsx("div", {
										className: t(
											e.root.img.off,
											e.root.initials.base,
											f && e.root.stacked,
											i && e.root.bordered,
											i && e.root.color[d],
											e.root.size[m],
											c && e.root.rounded,
										),
										"data-testid": "flowbite-avatar-initials-placeholder",
										children: r.jsx("span", {
											className: t(e.root.initials.text),
											"data-testid":
												"flowbite-avatar-initials-placeholder-text",
											children: g,
										}),
									})
								: r.jsx("div", {
										className: t(u, e.root.img.off),
										"data-testid": "flowbite-avatar-img",
										children: r.jsx("svg", {
											className: e.root.img.placeholder,
											fill: "currentColor",
											viewBox: "0 0 20 20",
											xmlns: "http://www.w3.org/2000/svg",
											children: r.jsx("path", {
												fillRule: "evenodd",
												d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
												clipRule: "evenodd",
											}),
										}),
									}),
						h &&
							r.jsx("span", {
								"data-testid": "flowbite-avatar-status",
								className: t(
									e.root.status.base,
									e.root.status[h],
									e.root.statusPosition[k],
								),
							}),
					],
				}),
				n && r.jsx("div", { children: n }),
			],
		});
	});
C.displayName = "Avatar";
export { C as A, A as a };
