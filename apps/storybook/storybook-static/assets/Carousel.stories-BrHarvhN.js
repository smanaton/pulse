import { C as be } from "./chevron-left-icon-RFu8Vxl9.js";
import { C as we } from "./chevron-right-icon-DzP0OM3K.js";
import {
	u as fe,
	r as ge,
	a as me,
	t as P,
	c as pe,
	g as q,
} from "./create-theme-ol-6nsx3.js";
import { j as a, R as de, g as ne, r as u } from "./iframe-ByD-PdrA.js";
import { i as ve } from "./is-client-dYMey8wu.js";
import "./preload-helper-Dp1pzeXC.js";
var R = { exports: {} }; /*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
var $;
function xe() {
	return (
		$ ||
			(($ = 1),
			((o) => {
				(() => {
					var s = {}.hasOwnProperty;
					function e() {
						for (var r = "", n = 0; n < arguments.length; n++) {
							var i = arguments[n];
							i && (r = l(r, t(i)));
						}
						return r;
					}
					function t(r) {
						if (typeof r == "string" || typeof r == "number") return r;
						if (typeof r != "object") return "";
						if (Array.isArray(r)) return e.apply(null, r);
						if (
							r.toString !== Object.prototype.toString &&
							!r.toString.toString().includes("[native code]")
						)
							return r.toString();
						var n = "";
						for (var i in r) s.call(r, i) && r[i] && (n = l(n, i));
						return n;
					}
					function l(r, n) {
						return n ? (r ? r + " " + n : r + n) : r;
					}
					o.exports
						? ((e.default = e), (o.exports = e))
						: (window.classNames = e);
				})();
			})(R)),
		R.exports
	);
}
var Ce = xe();
const Se = ne(Ce);
var k = { exports: {} },
	z;
function Ee() {
	if (z) return k.exports;
	z = 1;
	function o(s, e = 100, t = {}) {
		if (typeof s != "function")
			throw new TypeError(
				`Expected the first parameter to be a function, got \`${typeof s}\`.`,
			);
		if (e < 0) throw new RangeError("`wait` must not be negative.");
		const { immediate: l } = typeof t == "boolean" ? { immediate: t } : t;
		let r, n, i, E, f;
		function w() {
			const m = r,
				y = n;
			return (r = void 0), (n = void 0), (f = s.apply(m, y)), f;
		}
		function L() {
			const m = Date.now() - E;
			m < e && m >= 0
				? (i = setTimeout(L, e - m))
				: ((i = void 0), l || (f = w()));
		}
		const d = function (...m) {
			if (
				r &&
				this !== r &&
				Object.getPrototypeOf(this) === Object.getPrototypeOf(r)
			)
				throw new Error(
					"Debounced method called with different contexts of the same prototype.",
				);
			(r = this), (n = m), (E = Date.now());
			const y = l && !i;
			return i || (i = setTimeout(L, e)), y && (f = w()), f;
		};
		return (
			Object.defineProperty(d, "isPending", {
				get() {
					return i !== void 0;
				},
			}),
			(d.clear = () => {
				i && (clearTimeout(i), (i = void 0));
			}),
			(d.flush = () => {
				i && d.trigger();
			}),
			(d.trigger = () => {
				(f = w()), d.clear();
			}),
			d
		);
	}
	return (k.exports.debounce = o), (k.exports = o), k.exports;
}
var ye = Ee();
const Me = ne(ye);
var Ne = Object.defineProperty,
	Te = (o, s, e) =>
		s in o
			? Ne(o, s, { enumerable: !0, configurable: !0, writable: !0, value: e })
			: (o[s] = e),
	c = (o, s, e) => Te(o, typeof s != "symbol" ? s + "" : s, e);
const je = 300,
	De = 0;
class ce extends u.PureComponent {
	constructor(s) {
		super(s),
			c(this, "container"),
			c(this, "scrolling"),
			c(this, "started"),
			c(this, "pressed"),
			c(this, "isMobile", !1),
			c(this, "internal"),
			c(this, "scrollLeft"),
			c(this, "scrollTop"),
			c(this, "clientX"),
			c(this, "clientY"),
			c(this, "onEndScroll", () => {
				(this.scrolling = !1),
					!this.pressed && this.started && this.processEnd();
			}),
			c(this, "onScroll", () => {
				const e = this.container.current;
				(e.scrollLeft !== this.scrollLeft || e.scrollTop !== this.scrollTop) &&
					((this.scrolling = !0), this.processScroll(), this.onEndScroll());
			}),
			c(this, "onTouchStart", (e) => {
				const { nativeMobileScroll: t } = this.props;
				if (this.isDraggable(e.target))
					if (((this.internal = !0), t && this.scrolling)) this.pressed = !0;
					else {
						const l = e.touches[0];
						this.processClick(l.clientX, l.clientY),
							!t && this.props.stopPropagation && e.stopPropagation();
					}
			}),
			c(this, "onTouchEnd", () => {
				const { nativeMobileScroll: e } = this.props;
				this.pressed &&
					(this.started && (!this.scrolling || !e)
						? this.processEnd()
						: (this.pressed = !1),
					this.forceUpdate());
			}),
			c(this, "onTouchMove", (e) => {
				const { nativeMobileScroll: t } = this.props;
				if (this.pressed && (!t || !this.isMobile)) {
					const l = e.touches[0];
					l && this.processMove(l.clientX, l.clientY),
						e.preventDefault(),
						this.props.stopPropagation && e.stopPropagation();
				}
			}),
			c(this, "onMouseDown", (e) => {
				var t, l;
				this.isDraggable(e.target) &&
					this.isScrollable() &&
					((this.internal = !0),
					((l = (t = this.props) == null ? void 0 : t.buttons) == null
						? void 0
						: l.indexOf(e.button)) !== -1 &&
						(this.processClick(e.clientX, e.clientY),
						e.preventDefault(),
						this.props.stopPropagation && e.stopPropagation()));
			}),
			c(this, "onMouseMove", (e) => {
				this.pressed &&
					(this.processMove(e.clientX, e.clientY),
					e.preventDefault(),
					this.props.stopPropagation && e.stopPropagation());
			}),
			c(this, "onMouseUp", (e) => {
				this.pressed &&
					(this.started
						? this.processEnd()
						: ((this.internal = !1),
							(this.pressed = !1),
							this.forceUpdate(),
							this.props.onClick && this.props.onClick(e)),
					e.preventDefault(),
					this.props.stopPropagation && e.stopPropagation());
			}),
			(this.container = de.createRef()),
			(this.onEndScroll = Me(this.onEndScroll, je)),
			(this.scrolling = !1),
			(this.started = !1),
			(this.pressed = !1),
			(this.internal = !1),
			(this.getRef = this.getRef.bind(this));
	}
	componentDidMount() {
		const { nativeMobileScroll: s } = this.props,
			e = this.container.current;
		window.addEventListener("mouseup", this.onMouseUp),
			window.addEventListener("mousemove", this.onMouseMove),
			window.addEventListener("touchmove", this.onTouchMove, { passive: !1 }),
			window.addEventListener("touchend", this.onTouchEnd),
			e.addEventListener("touchstart", this.onTouchStart, { passive: !1 }),
			e.addEventListener("mousedown", this.onMouseDown, { passive: !1 }),
			s &&
				((this.isMobile = this.isMobileDevice()),
				this.isMobile && this.forceUpdate());
	}
	componentWillUnmount() {
		window.removeEventListener("mouseup", this.onMouseUp),
			window.removeEventListener("mousemove", this.onMouseMove),
			window.removeEventListener("touchmove", this.onTouchMove),
			window.removeEventListener("touchend", this.onTouchEnd);
	}
	getElement() {
		return this.container.current;
	}
	isMobileDevice() {
		return (
			typeof window.orientation < "u" ||
			navigator.userAgent.indexOf("IEMobile") !== -1
		);
	}
	isDraggable(s) {
		const e = this.props.ignoreElements;
		if (e) {
			const t = s.closest(e);
			return t === null || t.contains(this.getElement());
		}
		return !0;
	}
	isScrollable() {
		const s = this.container.current;
		return (
			s && (s.scrollWidth > s.clientWidth || s.scrollHeight > s.clientHeight)
		);
	}
	processClick(s, e) {
		const t = this.container.current;
		(this.scrollLeft = t == null ? void 0 : t.scrollLeft),
			(this.scrollTop = t == null ? void 0 : t.scrollTop),
			(this.clientX = s),
			(this.clientY = e),
			(this.pressed = !0);
	}
	processStart(s = !0) {
		const { onStartScroll: e } = this.props;
		(this.started = !0),
			s && document.body.classList.add("cursor-grab"),
			e && e({ external: !this.internal }),
			this.forceUpdate();
	}
	processScroll() {
		if (this.started) {
			const { onScroll: s } = this.props;
			s && s({ external: !this.internal });
		} else this.processStart(!1);
	}
	processMove(s, e) {
		const {
				horizontal: t,
				vertical: l,
				activationDistance: r,
				onScroll: n,
			} = this.props,
			i = this.container.current;
		this.started
			? (t && (i.scrollLeft -= s - this.clientX),
				l && (i.scrollTop -= e - this.clientY),
				n && n({ external: !this.internal }),
				(this.clientX = s),
				(this.clientY = e),
				(this.scrollLeft = i.scrollLeft),
				(this.scrollTop = i.scrollTop))
			: ((t && Math.abs(s - this.clientX) > r) ||
					(l && Math.abs(e - this.clientY) > r)) &&
				((this.clientX = s), (this.clientY = e), this.processStart());
	}
	processEnd() {
		const { onEndScroll: s } = this.props;
		this.container.current && s && s({ external: !this.internal }),
			(this.pressed = !1),
			(this.started = !1),
			(this.scrolling = !1),
			(this.internal = !1),
			document.body.classList.remove("cursor-grab"),
			this.forceUpdate();
	}
	getRef(s) {
		[this.container, this.props.innerRef].forEach((e) => {
			e && (typeof e == "function" ? e(s) : (e.current = s));
		});
	}
	render() {
		const {
			children: s,
			draggingClassName: e,
			className: t,
			style: l,
			hideScrollbars: r,
		} = this.props;
		return a.jsx("div", {
			className: Se(t, this.pressed && e, {
				"!scroll-auto [&>*]:pointer-events-none [&>*]:cursor-grab":
					this.pressed,
				"overflow-auto": this.isMobile,
				"overflow-hidden !overflow-x-hidden [scrollbar-width:none]": r,
				"[&::-webkit-scrollbar]:[-webkit-appearance:none !important] [&::-webkit-scrollbar]:!hidden [&::-webkit-scrollbar]:!h-0 [&::-webkit-scrollbar]:!w-0 [&::-webkit-scrollbar]:!bg-transparent":
					r,
			}),
			style: l,
			ref: this.getRef,
			onScroll: this.onScroll,
			children: s,
		});
	}
}
c(ce, "defaultProps", {
	nativeMobileScroll: !0,
	hideScrollbars: !0,
	activationDistance: 10,
	vertical: !0,
	horizontal: !0,
	stopPropagation: !1,
	style: {},
	buttons: [De],
});
const Le = pe({
		root: {
			base: "relative h-full w-full",
			leftControl:
				"absolute left-0 top-0 flex h-full items-center justify-center px-4 focus:outline-none",
			rightControl:
				"absolute right-0 top-0 flex h-full items-center justify-center px-4 focus:outline-none",
		},
		indicators: {
			active: {
				off: "bg-white/50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800",
				on: "bg-white dark:bg-gray-800",
			},
			base: "h-3 w-3 rounded-full",
			wrapper: "absolute bottom-5 left-1/2 flex -translate-x-1/2 space-x-3",
		},
		item: {
			base: "absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2",
			wrapper: {
				off: "w-full shrink-0 transform cursor-default snap-center",
				on: "w-full shrink-0 transform cursor-grab snap-center",
			},
		},
		control: {
			base: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white sm:h-10 sm:w-10 dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70",
			icon: "h-5 w-5 text-white sm:h-6 sm:w-6 dark:text-gray-800",
		},
		scrollContainer: {
			base: "flex h-full snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth rounded-lg",
			snap: "snap-x",
		},
	}),
	I = u.forwardRef((o, s) => {
		var Y, F;
		const e = fe(),
			t = me(
				[Le, (Y = e.theme) == null ? void 0 : Y.carousel, o.theme],
				[q(e.clearTheme, "carousel"), o.clearTheme],
				[q(e.applyTheme, "carousel"), o.applyTheme],
			),
			{
				children: l,
				indicators: r = !0,
				leftControl: n,
				rightControl: i,
				slide: E = !0,
				draggable: f = !0,
				slideInterval: w,
				className: L,
				onSlideChange: d,
				pauseOnHover: m = !1,
				...y
			} = ge(o, (F = e.props) == null ? void 0 : F.carousel),
			ue = ve() && navigator.userAgent.indexOf("IEMobile") !== -1,
			g = u.useRef(null),
			[v, O] = u.useState(0),
			[M, he] = u.useState(!1),
			[U, _] = u.useState(!1),
			W = u.useRef(!1),
			p = u.useMemo(
				() =>
					u.Children.map(l, (h) =>
						u.cloneElement(h, { className: P(t.item.base, h.props.className) }),
					),
				[l, t.item.base],
			),
			N = u.useCallback(
				(h) => () => {
					p &&
						((h = (h + p.length) % p.length),
						g.current && (g.current.scrollLeft = g.current.clientWidth * h),
						O(h));
				},
				[p],
			);
		u.useEffect(() => {
			g.current &&
				!M &&
				g.current.scrollLeft !== 0 &&
				O(Math.round(g.current.scrollLeft / g.current.clientWidth));
		}, [M]),
			u.useEffect(() => {
				if (E && !(m && U)) {
					const h = setInterval(() => !M && N(v + 1)(), w ?? 3e3);
					return () => clearInterval(h);
				}
			}, [v, M, N, E, w, m, U]),
			u.useEffect(() => {
				W.current ? d == null || d(v) : (W.current = !0);
			}, [d, v]);
		const A = (h) => () => he(h),
			H = u.useCallback(() => _(!0), []),
			X = u.useCallback(() => _(!1), []);
		return a.jsxs("div", {
			ref: s,
			className: P(t.root.base, L),
			"data-testid": "carousel",
			onMouseEnter: H,
			onMouseLeave: X,
			onTouchStart: H,
			onTouchEnd: X,
			...y,
			children: [
				a.jsx(ce, {
					className: P(
						t.scrollContainer.base,
						(ue || !M) && t.scrollContainer.snap,
					),
					draggingClassName: "cursor-grab",
					innerRef: g,
					onEndScroll: A(!1),
					onStartScroll: A(f),
					vertical: !1,
					horizontal: f,
					children:
						p == null
							? void 0
							: p.map((h, b) =>
									a.jsx(
										"div",
										{
											className: t.item.wrapper[f ? "on" : "off"],
											"data-active": v === b,
											"data-testid": "carousel-item",
											children: h,
										},
										b,
									),
								),
				}),
				r &&
					a.jsx("div", {
						className: t.indicators.wrapper,
						children:
							p == null
								? void 0
								: p.map((h, b) =>
										a.jsx(
											"button",
											{
												className: P(
													t.indicators.base,
													t.indicators.active[b === v ? "on" : "off"],
												),
												onClick: N(b),
												"data-testid": "carousel-indicator",
												"aria-label": `Slide ${b + 1}`,
											},
											b,
										),
									),
					}),
				p &&
					a.jsxs(a.Fragment, {
						children: [
							a.jsx("div", {
								className: t.root.leftControl,
								children: a.jsx("button", {
									className: "group",
									"data-testid": "carousel-left-control",
									onClick: N(v - 1),
									type: "button",
									"aria-label": "Previous slide",
									children: n || a.jsx(Pe, { theme: t.control }),
								}),
							}),
							a.jsx("div", {
								className: t.root.rightControl,
								children: a.jsx("button", {
									className: "group",
									"data-testid": "carousel-right-control",
									onClick: N(v + 1),
									type: "button",
									"aria-label": "Next slide",
									children: i || a.jsx(ke, { theme: t.control }),
								}),
							}),
						],
					}),
			],
		});
	});
I.displayName = "Carousel";
function Pe({ theme: o }) {
	return a.jsx("span", {
		className: o.base,
		children: a.jsx(be, { className: o.icon }),
	});
}
function ke({ theme: o }) {
	return a.jsx("span", {
		className: o.base,
		children: a.jsx(we, { className: o.icon }),
	});
}
const Ae = { title: "Components/Carousel", component: I },
	D = (o) =>
		a.jsx("div", {
			className: "h-56 sm:h-64 xl:h-80 2xl:h-96",
			children: a.jsxs(I, {
				...o,
				children: [
					a.jsx("img", {
						src: "https://flowbite.com/docs/images/carousel/carousel-1.svg",
						alt: "...",
					}),
					a.jsx("img", {
						src: "https://flowbite.com/docs/images/carousel/carousel-2.svg",
						alt: "...",
					}),
					a.jsx("img", {
						src: "https://flowbite.com/docs/images/carousel/carousel-3.svg",
						alt: "...",
					}),
					a.jsx("img", {
						src: "https://flowbite.com/docs/images/carousel/carousel-4.svg",
						alt: "...",
					}),
					a.jsx("img", {
						src: "https://flowbite.com/docs/images/carousel/carousel-5.svg",
						alt: "...",
					}),
				],
			}),
		}),
	T = D.bind({});
T.args = {};
const x = D.bind({});
x.storyName = "Slide interval";
x.args = { slideInterval: 5e3 };
const j = D.bind({});
j.args = { slide: !1 };
const C = D.bind({});
C.storyName = "With custom controls";
C.args = { leftControl: "<", rightControl: ">" };
const S = D.bind({});
S.storyName = "With no indicators";
S.args = { indicators: !1 };
var B, V, G;
T.parameters = {
	...T.parameters,
	docs: {
		...((B = T.parameters) == null ? void 0 : B.docs),
		source: {
			originalSource: `args => <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">\r
        <Carousel {...args}>\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..." />\r
        </Carousel>\r
    </div>`,
			...((G = (V = T.parameters) == null ? void 0 : V.docs) == null
				? void 0
				: G.source),
		},
	},
};
var J, K, Q;
x.parameters = {
	...x.parameters,
	docs: {
		...((J = x.parameters) == null ? void 0 : J.docs),
		source: {
			originalSource: `args => <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">\r
        <Carousel {...args}>\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..." />\r
        </Carousel>\r
    </div>`,
			...((Q = (K = x.parameters) == null ? void 0 : K.docs) == null
				? void 0
				: Q.source),
		},
	},
};
var Z, ee, se;
j.parameters = {
	...j.parameters,
	docs: {
		...((Z = j.parameters) == null ? void 0 : Z.docs),
		source: {
			originalSource: `args => <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">\r
        <Carousel {...args}>\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..." />\r
        </Carousel>\r
    </div>`,
			...((se = (ee = j.parameters) == null ? void 0 : ee.docs) == null
				? void 0
				: se.source),
		},
	},
};
var te, re, oe;
C.parameters = {
	...C.parameters,
	docs: {
		...((te = C.parameters) == null ? void 0 : te.docs),
		source: {
			originalSource: `args => <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">\r
        <Carousel {...args}>\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..." />\r
        </Carousel>\r
    </div>`,
			...((oe = (re = C.parameters) == null ? void 0 : re.docs) == null
				? void 0
				: oe.source),
		},
	},
};
var ie, ae, le;
S.parameters = {
	...S.parameters,
	docs: {
		...((ie = S.parameters) == null ? void 0 : ie.docs),
		source: {
			originalSource: `args => <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">\r
        <Carousel {...args}>\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..." />\r
            <img src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..." />\r
        </Carousel>\r
    </div>`,
			...((le = (ae = S.parameters) == null ? void 0 : ae.docs) == null
				? void 0
				: le.source),
		},
	},
};
const He = [
	"Default",
	"SlideInterval",
	"Static",
	"CustomControls",
	"WithNoIndicators",
];
export {
	C as CustomControls,
	T as Default,
	x as SlideInterval,
	j as Static,
	S as WithNoIndicators,
	He as __namedExportsOrder,
	Ae as default,
};
