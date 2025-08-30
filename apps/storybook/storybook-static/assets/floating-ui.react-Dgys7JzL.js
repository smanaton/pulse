import { r as g, V as hr, j as pe } from "./iframe-ByD-PdrA.js";
import { r as Wn } from "./index-DSXAykh4.js";
function wt() {
	return typeof window < "u";
}
function De(e) {
	return Kn(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function ge(e) {
	var t;
	return (
		(e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
		window
	);
}
function Te(e) {
	var t;
	return (t = (Kn(e) ? e.ownerDocument : e.document) || window.document) == null
		? void 0
		: t.documentElement;
}
function Kn(e) {
	return wt() ? e instanceof Node || e instanceof ge(e).Node : !1;
}
function G(e) {
	return wt() ? e instanceof Element || e instanceof ge(e).Element : !1;
}
function ne(e) {
	return wt() ? e instanceof HTMLElement || e instanceof ge(e).HTMLElement : !1;
}
function Vt(e) {
	return !wt() || typeof ShadowRoot > "u"
		? !1
		: e instanceof ShadowRoot || e instanceof ge(e).ShadowRoot;
}
const vr = new Set(["inline", "contents"]);
function Qe(e) {
	const { overflow: t, overflowX: n, overflowY: r, display: o } = be(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !vr.has(o);
}
const br = new Set(["table", "td", "th"]);
function yr(e) {
	return br.has(De(e));
}
const wr = [":popover-open", ":modal"];
function xt(e) {
	return wr.some((t) => {
		try {
			return e.matches(t);
		} catch {
			return !1;
		}
	});
}
const xr = ["transform", "translate", "scale", "rotate", "perspective"],
	Rr = ["transform", "translate", "scale", "rotate", "perspective", "filter"],
	Er = ["paint", "layout", "strict", "content"];
function zt(e) {
	const t = Rt(),
		n = G(e) ? be(e) : e;
	return (
		xr.some((r) => (n[r] ? n[r] !== "none" : !1)) ||
		(n.containerType ? n.containerType !== "normal" : !1) ||
		(!t && (n.backdropFilter ? n.backdropFilter !== "none" : !1)) ||
		(!t && (n.filter ? n.filter !== "none" : !1)) ||
		Rr.some((r) => (n.willChange || "").includes(r)) ||
		Er.some((r) => (n.contain || "").includes(r))
	);
}
function Tr(e) {
	let t = Oe(e);
	for (; ne(t) && !Ie(t); ) {
		if (zt(t)) return t;
		if (xt(t)) return null;
		t = Oe(t);
	}
	return null;
}
function Rt() {
	return typeof CSS > "u" || !CSS.supports
		? !1
		: CSS.supports("-webkit-backdrop-filter", "none");
}
const Cr = new Set(["html", "body", "#document"]);
function Ie(e) {
	return Cr.has(De(e));
}
function be(e) {
	return ge(e).getComputedStyle(e);
}
function Et(e) {
	return G(e)
		? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
		: { scrollLeft: e.scrollX, scrollTop: e.scrollY };
}
function Oe(e) {
	if (De(e) === "html") return e;
	const t = e.assignedSlot || e.parentNode || (Vt(e) && e.host) || Te(e);
	return Vt(t) ? t.host : t;
}
function $n(e) {
	const t = Oe(e);
	return Ie(t)
		? e.ownerDocument
			? e.ownerDocument.body
			: e.body
		: ne(t) && Qe(t)
			? t
			: $n(t);
}
function ke(e, t, n) {
	var r;
	t === void 0 && (t = []), n === void 0 && (n = !0);
	const o = $n(e),
		s = o === ((r = e.ownerDocument) == null ? void 0 : r.body),
		i = ge(o);
	if (s) {
		const c = Wt(i);
		return t.concat(
			i,
			i.visualViewport || [],
			Qe(o) ? o : [],
			c && n ? ke(c) : [],
		);
	}
	return t.concat(o, ke(o, [], n));
}
function Wt(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function ye(e) {
	let t = e.activeElement;
	for (
		;
		((n = t) == null || (n = n.shadowRoot) == null
			? void 0
			: n.activeElement) != null;
	) {
		var n;
		t = t.shadowRoot.activeElement;
	}
	return t;
}
function te(e, t) {
	if (!e || !t) return !1;
	const n = t.getRootNode == null ? void 0 : t.getRootNode();
	if (e.contains(t)) return !0;
	if (n && Vt(n)) {
		let r = t;
		for (; r; ) {
			if (e === r) return !0;
			r = r.parentNode || r.host;
		}
	}
	return !1;
}
function Xt() {
	const e = navigator.userAgentData;
	return e != null && e.platform ? e.platform : navigator.platform;
}
function jn() {
	const e = navigator.userAgentData;
	return e && Array.isArray(e.brands)
		? e.brands
				.map((t) => {
					const { brand: n, version: r } = t;
					return n + "/" + r;
				})
				.join(" ")
		: navigator.userAgent;
}
function Hn(e) {
	return e.mozInputSource === 0 && e.isTrusted
		? !0
		: Kt() && e.pointerType
			? e.type === "click" && e.buttons === 1
			: e.detail === 0 && !e.pointerType;
}
function Yt(e) {
	return Or()
		? !1
		: (!Kt() && e.width === 0 && e.height === 0) ||
				(Kt() &&
					e.width === 1 &&
					e.height === 1 &&
					e.pressure === 0 &&
					e.detail === 0 &&
					e.pointerType === "mouse") ||
				(e.width < 1 &&
					e.height < 1 &&
					e.pressure === 0 &&
					e.detail === 0 &&
					e.pointerType === "touch");
}
function qn() {
	return /apple/i.test(navigator.vendor);
}
function Kt() {
	const e = /android/i;
	return e.test(Xt()) || e.test(jn());
}
function Ir() {
	return Xt().toLowerCase().startsWith("mac") && !navigator.maxTouchPoints;
}
function Or() {
	return jn().includes("jsdom/");
}
function Je(e, t) {
	const n = ["mouse", "pen"];
	return t || n.push("", void 0), n.includes(e);
}
function Sr(e) {
	return "nativeEvent" in e;
}
function Pr(e) {
	return e.matches("html,body");
}
function ue(e) {
	return (e == null ? void 0 : e.ownerDocument) || document;
}
function Mt(e, t) {
	if (t == null) return !1;
	if ("composedPath" in e) return e.composedPath().includes(t);
	const n = e;
	return n.target != null && t.contains(n.target);
}
function Ce(e) {
	return "composedPath" in e ? e.composedPath()[0] : e.target;
}
const Mr =
	"input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";
function Ut(e) {
	return ne(e) && e.matches(Mr);
}
function le(e) {
	e.preventDefault(), e.stopPropagation();
}
function zn(e) {
	return e ? e.getAttribute("role") === "combobox" && Ut(e) : !1;
}
const Ar = ["top", "right", "bottom", "left"],
	cn = ["start", "end"],
	ln = Ar.reduce((e, t) => e.concat(t, t + "-" + cn[0], t + "-" + cn[1]), []),
	Xe = Math.min,
	Ve = Math.max,
	ft = Math.round,
	qe = Math.floor,
	Re = (e) => ({ x: e, y: e }),
	kr = { left: "right", right: "left", bottom: "top", top: "bottom" },
	Lr = { start: "end", end: "start" };
function $t(e, t, n) {
	return Ve(e, Xe(t, n));
}
function Ue(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Se(e) {
	return e.split("-")[0];
}
function Ee(e) {
	return e.split("-")[1];
}
function Xn(e) {
	return e === "x" ? "y" : "x";
}
function Gt(e) {
	return e === "y" ? "height" : "width";
}
const Fr = new Set(["top", "bottom"]);
function Ae(e) {
	return Fr.has(Se(e)) ? "y" : "x";
}
function Zt(e) {
	return Xn(Ae(e));
}
function Yn(e, t, n) {
	n === void 0 && (n = !1);
	const r = Ee(e),
		o = Zt(e),
		s = Gt(o);
	let i =
		o === "x"
			? r === (n ? "end" : "start")
				? "right"
				: "left"
			: r === "start"
				? "bottom"
				: "top";
	return t.reference[s] > t.floating[s] && (i = mt(i)), [i, mt(i)];
}
function Dr(e) {
	const t = mt(e);
	return [dt(e), t, dt(t)];
}
function dt(e) {
	return e.replace(/start|end/g, (t) => Lr[t]);
}
const un = ["left", "right"],
	an = ["right", "left"],
	Nr = ["top", "bottom"],
	_r = ["bottom", "top"];
function Br(e, t, n) {
	switch (e) {
		case "top":
		case "bottom":
			return n ? (t ? an : un) : t ? un : an;
		case "left":
		case "right":
			return t ? Nr : _r;
		default:
			return [];
	}
}
function Vr(e, t, n, r) {
	const o = Ee(e);
	let s = Br(Se(e), n === "start", r);
	return (
		o && ((s = s.map((i) => i + "-" + o)), t && (s = s.concat(s.map(dt)))), s
	);
}
function mt(e) {
	return e.replace(/left|right|bottom|top/g, (t) => kr[t]);
}
function Wr(e) {
	return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function Un(e) {
	return typeof e != "number"
		? Wr(e)
		: { top: e, right: e, bottom: e, left: e };
}
function gt(e) {
	const { x: t, y: n, width: r, height: o } = e;
	return {
		width: r,
		height: o,
		top: n,
		left: t,
		right: t + r,
		bottom: n + o,
		x: t,
		y: n,
	};
} /*!
 * tabbable 6.2.0
 * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
 */
var Kr = [
		"input:not([inert])",
		"select:not([inert])",
		"textarea:not([inert])",
		"a[href]:not([inert])",
		"button:not([inert])",
		"[tabindex]:not(slot):not([inert])",
		"audio[controls]:not([inert])",
		"video[controls]:not([inert])",
		'[contenteditable]:not([contenteditable="false"]):not([inert])',
		"details>summary:first-of-type:not([inert])",
		"details:not([inert])",
	],
	pt = Kr.join(","),
	Gn = typeof Element > "u",
	Ye = Gn
		? () => {}
		: Element.prototype.matches ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.webkitMatchesSelector,
	ht =
		!Gn && Element.prototype.getRootNode
			? (e) => {
					var t;
					return e == null || (t = e.getRootNode) === null || t === void 0
						? void 0
						: t.call(e);
				}
			: (e) => (e == null ? void 0 : e.ownerDocument),
	vt = function e(t, n) {
		var r;
		n === void 0 && (n = !0);
		var o =
				t == null || (r = t.getAttribute) === null || r === void 0
					? void 0
					: r.call(t, "inert"),
			s = o === "" || o === "true",
			i = s || (n && t && e(t.parentNode));
		return i;
	},
	$r = (t) => {
		var n,
			r =
				t == null || (n = t.getAttribute) === null || n === void 0
					? void 0
					: n.call(t, "contenteditable");
		return r === "" || r === "true";
	},
	jr = (t, n, r) => {
		if (vt(t)) return [];
		var o = Array.prototype.slice.apply(t.querySelectorAll(pt));
		return n && Ye.call(t, pt) && o.unshift(t), (o = o.filter(r)), o;
	},
	Hr = function e(t, n, r) {
		for (var o = [], s = Array.from(t); s.length; ) {
			var i = s.shift();
			if (!vt(i, !1))
				if (i.tagName === "SLOT") {
					var c = i.assignedElements(),
						a = c.length ? c : i.children,
						l = e(a, !0, r);
					r.flatten
						? o.push.apply(o, l)
						: o.push({ scopeParent: i, candidates: l });
				} else {
					var f = Ye.call(i, pt);
					f && r.filter(i) && (n || !t.includes(i)) && o.push(i);
					var m =
							i.shadowRoot ||
							(typeof r.getShadowRoot == "function" && r.getShadowRoot(i)),
						p = !vt(m, !1) && (!r.shadowRootFilter || r.shadowRootFilter(i));
					if (m && p) {
						var u = e(m === !0 ? i.children : m.children, !0, r);
						r.flatten
							? o.push.apply(o, u)
							: o.push({ scopeParent: i, candidates: u });
					} else s.unshift.apply(s, i.children);
				}
		}
		return o;
	},
	Zn = (t) => !isNaN(Number.parseInt(t.getAttribute("tabindex"), 10)),
	Jn = (t) => {
		if (!t) throw new Error("No node provided");
		return t.tabIndex < 0 &&
			(/^(AUDIO|VIDEO|DETAILS)$/.test(t.tagName) || $r(t)) &&
			!Zn(t)
			? 0
			: t.tabIndex;
	},
	qr = (t, n) => {
		var r = Jn(t);
		return r < 0 && n && !Zn(t) ? 0 : r;
	},
	zr = (t, n) =>
		t.tabIndex === n.tabIndex
			? t.documentOrder - n.documentOrder
			: t.tabIndex - n.tabIndex,
	Qn = (t) => t.tagName === "INPUT",
	Xr = (t) => Qn(t) && t.type === "hidden",
	Yr = (t) => {
		var n =
			t.tagName === "DETAILS" &&
			Array.prototype.slice
				.apply(t.children)
				.some((r) => r.tagName === "SUMMARY");
		return n;
	},
	Ur = (t, n) => {
		for (var r = 0; r < t.length; r++)
			if (t[r].checked && t[r].form === n) return t[r];
	},
	Gr = (t) => {
		if (!t.name) return !0;
		var n = t.form || ht(t),
			r = (c) => n.querySelectorAll('input[type="radio"][name="' + c + '"]'),
			o;
		if (
			typeof window < "u" &&
			typeof window.CSS < "u" &&
			typeof window.CSS.escape == "function"
		)
			o = r(window.CSS.escape(t.name));
		else
			try {
				o = r(t.name);
			} catch (i) {
				return (
					console.error(
						"Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",
						i.message,
					),
					!1
				);
			}
		var s = Ur(o, t.form);
		return !s || s === t;
	},
	Zr = (t) => Qn(t) && t.type === "radio",
	Jr = (t) => Zr(t) && !Gr(t),
	Qr = (t) => {
		var n,
			r = t && ht(t),
			o = (n = r) === null || n === void 0 ? void 0 : n.host,
			s = !1;
		if (r && r !== t) {
			var i, c, a;
			for (
				s = !!(
					((i = o) !== null &&
						i !== void 0 &&
						(c = i.ownerDocument) !== null &&
						c !== void 0 &&
						c.contains(o)) ||
					(t != null &&
						(a = t.ownerDocument) !== null &&
						a !== void 0 &&
						a.contains(t))
				);
				!s && o;
			) {
				var l, f, m;
				(r = ht(o)),
					(o = (l = r) === null || l === void 0 ? void 0 : l.host),
					(s = !!(
						(f = o) !== null &&
						f !== void 0 &&
						(m = f.ownerDocument) !== null &&
						m !== void 0 &&
						m.contains(o)
					));
			}
		}
		return s;
	},
	fn = (t) => {
		var n = t.getBoundingClientRect(),
			r = n.width,
			o = n.height;
		return r === 0 && o === 0;
	},
	eo = (t, n) => {
		var r = n.displayCheck,
			o = n.getShadowRoot;
		if (getComputedStyle(t).visibility === "hidden") return !0;
		var s = Ye.call(t, "details>summary:first-of-type"),
			i = s ? t.parentElement : t;
		if (Ye.call(i, "details:not([open]) *")) return !0;
		if (!r || r === "full" || r === "legacy-full") {
			if (typeof o == "function") {
				for (var c = t; t; ) {
					var a = t.parentElement,
						l = ht(t);
					if (a && !a.shadowRoot && o(a) === !0) return fn(t);
					t.assignedSlot
						? (t = t.assignedSlot)
						: !a && l !== t.ownerDocument
							? (t = l.host)
							: (t = a);
				}
				t = c;
			}
			if (Qr(t)) return !t.getClientRects().length;
			if (r !== "legacy-full") return !0;
		} else if (r === "non-zero-area") return fn(t);
		return !1;
	},
	to = (t) => {
		if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(t.tagName))
			for (var n = t.parentElement; n; ) {
				if (n.tagName === "FIELDSET" && n.disabled) {
					for (var r = 0; r < n.children.length; r++) {
						var o = n.children.item(r);
						if (o.tagName === "LEGEND")
							return Ye.call(n, "fieldset[disabled] *") ? !0 : !o.contains(t);
					}
					return !0;
				}
				n = n.parentElement;
			}
		return !1;
	},
	no = (t, n) => !(n.disabled || vt(n) || Xr(n) || eo(n, t) || Yr(n) || to(n)),
	jt = (t, n) => !(Jr(n) || Jn(n) < 0 || !no(t, n)),
	ro = (t) => {
		var n = Number.parseInt(t.getAttribute("tabindex"), 10);
		return !!(isNaN(n) || n >= 0);
	},
	oo = function e(t) {
		var n = [],
			r = [];
		return (
			t.forEach((o, s) => {
				var i = !!o.scopeParent,
					c = i ? o.scopeParent : o,
					a = qr(c, i),
					l = i ? e(o.candidates) : c;
				a === 0
					? i
						? n.push.apply(n, l)
						: n.push(c)
					: r.push({
							documentOrder: s,
							tabIndex: a,
							item: o,
							isScope: i,
							content: l,
						});
			}),
			r
				.sort(zr)
				.reduce(
					(o, s) => (
						s.isScope ? o.push.apply(o, s.content) : o.push(s.content), o
					),
					[],
				)
				.concat(n)
		);
	},
	Tt = (t, n) => {
		n = n || {};
		var r;
		return (
			n.getShadowRoot
				? (r = Hr([t], n.includeContainer, {
						filter: jt.bind(null, n),
						flatten: !1,
						getShadowRoot: n.getShadowRoot,
						shadowRootFilter: ro,
					}))
				: (r = jr(t, n.includeContainer, jt.bind(null, n))),
			oo(r)
		);
	},
	io = (t, n) => {
		if (((n = n || {}), !t)) throw new Error("No node provided");
		return Ye.call(t, pt) === !1 ? !1 : jt(n, t);
	};
function dn(e, t, n) {
	const { reference: r, floating: o } = e;
	const s = Ae(t),
		i = Zt(t),
		c = Gt(i),
		a = Se(t),
		l = s === "y",
		f = r.x + r.width / 2 - o.width / 2,
		m = r.y + r.height / 2 - o.height / 2,
		p = r[c] / 2 - o[c] / 2;
	let u;
	switch (a) {
		case "top":
			u = { x: f, y: r.y - o.height };
			break;
		case "bottom":
			u = { x: f, y: r.y + r.height };
			break;
		case "right":
			u = { x: r.x + r.width, y: m };
			break;
		case "left":
			u = { x: r.x - o.width, y: m };
			break;
		default:
			u = { x: r.x, y: r.y };
	}
	switch (Ee(t)) {
		case "start":
			u[i] -= p * (n && l ? -1 : 1);
			break;
		case "end":
			u[i] += p * (n && l ? -1 : 1);
			break;
	}
	return u;
}
const so = async (e, t, n) => {
	const {
			placement: r = "bottom",
			strategy: o = "absolute",
			middleware: s = [],
			platform: i,
		} = n,
		c = s.filter(Boolean),
		a = await (i.isRTL == null ? void 0 : i.isRTL(t));
	let l = await i.getElementRects({ reference: e, floating: t, strategy: o }),
		{ x: f, y: m } = dn(l, r, a),
		p = r,
		u = {},
		h = 0;
	for (let d = 0; d < c.length; d++) {
		const { name: w, fn: v } = c[d],
			{
				x: b,
				y: R,
				data: A,
				reset: k,
			} = await v({
				x: f,
				y: m,
				initialPlacement: r,
				placement: p,
				strategy: o,
				middlewareData: u,
				rects: l,
				platform: i,
				elements: { reference: e, floating: t },
			});
		(f = b ?? f),
			(m = R ?? m),
			(u = { ...u, [w]: { ...u[w], ...A } }),
			k &&
				h <= 50 &&
				(h++,
				typeof k == "object" &&
					(k.placement && (p = k.placement),
					k.rects &&
						(l =
							k.rects === !0
								? await i.getElementRects({
										reference: e,
										floating: t,
										strategy: o,
									})
								: k.rects),
					({ x: f, y: m } = dn(l, p, a))),
				(d = -1));
	}
	return { x: f, y: m, placement: p, strategy: o, middlewareData: u };
};
async function Jt(e, t) {
	var n;
	t === void 0 && (t = {});
	const { x: r, y: o, platform: s, rects: i, elements: c, strategy: a } = e,
		{
			boundary: l = "clippingAncestors",
			rootBoundary: f = "viewport",
			elementContext: m = "floating",
			altBoundary: p = !1,
			padding: u = 0,
		} = Ue(t, e),
		h = Un(u),
		w = c[p ? (m === "floating" ? "reference" : "floating") : m],
		v = gt(
			await s.getClippingRect({
				element:
					(n = await (s.isElement == null ? void 0 : s.isElement(w))) == null ||
					n
						? w
						: w.contextElement ||
							(await (s.getDocumentElement == null
								? void 0
								: s.getDocumentElement(c.floating))),
				boundary: l,
				rootBoundary: f,
				strategy: a,
			}),
		),
		b =
			m === "floating"
				? { x: r, y: o, width: i.floating.width, height: i.floating.height }
				: i.reference,
		R = await (s.getOffsetParent == null
			? void 0
			: s.getOffsetParent(c.floating)),
		A = (await (s.isElement == null ? void 0 : s.isElement(R)))
			? (await (s.getScale == null ? void 0 : s.getScale(R))) || { x: 1, y: 1 }
			: { x: 1, y: 1 },
		k = gt(
			s.convertOffsetParentRelativeRectToViewportRelativeRect
				? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
						elements: c,
						rect: b,
						offsetParent: R,
						strategy: a,
					})
				: b,
		);
	return {
		top: (v.top - k.top + h.top) / A.y,
		bottom: (k.bottom - v.bottom + h.bottom) / A.y,
		left: (v.left - k.left + h.left) / A.x,
		right: (k.right - v.right + h.right) / A.x,
	};
}
const co = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		const {
				x: n,
				y: r,
				placement: o,
				rects: s,
				platform: i,
				elements: c,
				middlewareData: a,
			} = t,
			{ element: l, padding: f = 0 } = Ue(e, t) || {};
		if (l == null) return {};
		const m = Un(f),
			p = { x: n, y: r },
			u = Zt(o),
			h = Gt(u),
			d = await i.getDimensions(l),
			w = u === "y",
			v = w ? "top" : "left",
			b = w ? "bottom" : "right",
			R = w ? "clientHeight" : "clientWidth",
			A = s.reference[h] + s.reference[u] - p[u] - s.floating[h],
			k = p[u] - s.reference[u],
			N = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(l));
		let _ = N ? N[R] : 0;
		(!_ || !(await (i.isElement == null ? void 0 : i.isElement(N)))) &&
			(_ = c.floating[R] || s.floating[h]);
		const Y = A / 2 - k / 2,
			V = _ / 2 - d[h] / 2 - 1,
			S = Xe(m[v], V),
			$ = Xe(m[b], V),
			M = S,
			y = _ - d[h] - $,
			x = _ / 2 - d[h] / 2 + Y,
			P = $t(M, x, y),
			E =
				!a.arrow &&
				Ee(o) != null &&
				x !== P &&
				s.reference[h] / 2 - (x < M ? S : $) - d[h] / 2 < 0,
			O = E ? (x < M ? x - M : x - y) : 0;
		return {
			[u]: p[u] + O,
			data: {
				[u]: P,
				centerOffset: x - P - O,
				...(E && { alignmentOffset: O }),
			},
			reset: E,
		};
	},
});
function lo(e, t, n) {
	return (
		e
			? [...n.filter((o) => Ee(o) === e), ...n.filter((o) => Ee(o) !== e)]
			: n.filter((o) => Se(o) === o)
	).filter((o) => (e ? Ee(o) === e || (t ? dt(o) !== o : !1) : !0));
}
const uo = (e) => (
		e === void 0 && (e = {}),
		{
			name: "autoPlacement",
			options: e,
			async fn(t) {
				var n, r, o;
				const {
						rects: s,
						middlewareData: i,
						placement: c,
						platform: a,
						elements: l,
					} = t,
					{
						crossAxis: f = !1,
						alignment: m,
						allowedPlacements: p = ln,
						autoAlignment: u = !0,
						...h
					} = Ue(e, t),
					d = m !== void 0 || p === ln ? lo(m || null, u, p) : p,
					w = await Jt(t, h),
					v = ((n = i.autoPlacement) == null ? void 0 : n.index) || 0,
					b = d[v];
				if (b == null) return {};
				const R = Yn(
					b,
					s,
					await (a.isRTL == null ? void 0 : a.isRTL(l.floating)),
				);
				if (c !== b) return { reset: { placement: d[0] } };
				const A = [w[Se(b)], w[R[0]], w[R[1]]],
					k = [
						...(((r = i.autoPlacement) == null ? void 0 : r.overflows) || []),
						{ placement: b, overflows: A },
					],
					N = d[v + 1];
				if (N)
					return {
						data: { index: v + 1, overflows: k },
						reset: { placement: N },
					};
				const _ = k
						.map((S) => {
							const $ = Ee(S.placement);
							return [
								S.placement,
								$ && f
									? S.overflows.slice(0, 2).reduce((M, y) => M + y, 0)
									: S.overflows[0],
								S.overflows,
							];
						})
						.sort((S, $) => S[1] - $[1]),
					V =
						((o = _.filter((S) =>
							S[2].slice(0, Ee(S[0]) ? 2 : 3).every(($) => $ <= 0),
						)[0]) == null
							? void 0
							: o[0]) || _[0][0];
				return V !== c
					? { data: { index: v + 1, overflows: k }, reset: { placement: V } }
					: {};
			},
		}
	),
	ao = (e) => (
		e === void 0 && (e = {}),
		{
			name: "flip",
			options: e,
			async fn(t) {
				var n, r;
				const {
						placement: o,
						middlewareData: s,
						rects: i,
						initialPlacement: c,
						platform: a,
						elements: l,
					} = t,
					{
						mainAxis: f = !0,
						crossAxis: m = !0,
						fallbackPlacements: p,
						fallbackStrategy: u = "bestFit",
						fallbackAxisSideDirection: h = "none",
						flipAlignment: d = !0,
						...w
					} = Ue(e, t);
				if ((n = s.arrow) != null && n.alignmentOffset) return {};
				const v = Se(o),
					b = Ae(c),
					R = Se(c) === c,
					A = await (a.isRTL == null ? void 0 : a.isRTL(l.floating)),
					k = p || (R || !d ? [mt(c)] : Dr(c)),
					N = h !== "none";
				!p && N && k.push(...Vr(c, d, h, A));
				const _ = [c, ...k],
					Y = await Jt(t, w),
					V = [];
				let S = ((r = s.flip) == null ? void 0 : r.overflows) || [];
				if ((f && V.push(Y[v]), m)) {
					const x = Yn(o, i, A);
					V.push(Y[x[0]], Y[x[1]]);
				}
				if (
					((S = [...S, { placement: o, overflows: V }]),
					!V.every((x) => x <= 0))
				) {
					var $, M;
					const x = ((($ = s.flip) == null ? void 0 : $.index) || 0) + 1,
						P = _[x];
					if (
						P &&
						(!(m === "alignment" ? b !== Ae(P) : !1) ||
							S.every((T) => (Ae(T.placement) === b ? T.overflows[0] > 0 : !0)))
					)
						return {
							data: { index: x, overflows: S },
							reset: { placement: P },
						};
					let E =
						(M = S.filter((O) => O.overflows[0] <= 0).sort(
							(O, T) => O.overflows[1] - T.overflows[1],
						)[0]) == null
							? void 0
							: M.placement;
					if (!E)
						switch (u) {
							case "bestFit": {
								var y;
								const O =
									(y = S.filter((T) => {
										if (N) {
											const I = Ae(T.placement);
											return I === b || I === "y";
										}
										return !0;
									})
										.map((T) => [
											T.placement,
											T.overflows
												.filter((I) => I > 0)
												.reduce((I, C) => I + C, 0),
										])
										.sort((T, I) => T[1] - I[1])[0]) == null
										? void 0
										: y[0];
								O && (E = O);
								break;
							}
							case "initialPlacement":
								E = c;
								break;
						}
					if (o !== E) return { reset: { placement: E } };
				}
				return {};
			},
		}
	),
	fo = new Set(["left", "top"]);
async function mo(e, t) {
	const { placement: n, platform: r, elements: o } = e,
		s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)),
		i = Se(n),
		c = Ee(n),
		a = Ae(n) === "y",
		l = fo.has(i) ? -1 : 1,
		f = s && a ? -1 : 1,
		m = Ue(t, e);
	let {
		mainAxis: p,
		crossAxis: u,
		alignmentAxis: h,
	} = typeof m == "number"
		? { mainAxis: m, crossAxis: 0, alignmentAxis: null }
		: {
				mainAxis: m.mainAxis || 0,
				crossAxis: m.crossAxis || 0,
				alignmentAxis: m.alignmentAxis,
			};
	return (
		c && typeof h == "number" && (u = c === "end" ? h * -1 : h),
		a ? { x: u * f, y: p * l } : { x: p * l, y: u * f }
	);
}
const go = (e) => (
		e === void 0 && (e = 0),
		{
			name: "offset",
			options: e,
			async fn(t) {
				var n, r;
				const { x: o, y: s, placement: i, middlewareData: c } = t,
					a = await mo(t, e);
				return i === ((n = c.offset) == null ? void 0 : n.placement) &&
					(r = c.arrow) != null &&
					r.alignmentOffset
					? {}
					: { x: o + a.x, y: s + a.y, data: { ...a, placement: i } };
			},
		}
	),
	po = (e) => (
		e === void 0 && (e = {}),
		{
			name: "shift",
			options: e,
			async fn(t) {
				const { x: n, y: r, placement: o } = t,
					{
						mainAxis: s = !0,
						crossAxis: i = !1,
						limiter: c = {
							fn: (w) => {
								const { x: v, y: b } = w;
								return { x: v, y: b };
							},
						},
						...a
					} = Ue(e, t),
					l = { x: n, y: r },
					f = await Jt(t, a),
					m = Ae(Se(o)),
					p = Xn(m);
				let u = l[p],
					h = l[m];
				if (s) {
					const w = p === "y" ? "top" : "left",
						v = p === "y" ? "bottom" : "right",
						b = u + f[w],
						R = u - f[v];
					u = $t(b, u, R);
				}
				if (i) {
					const w = m === "y" ? "top" : "left",
						v = m === "y" ? "bottom" : "right",
						b = h + f[w],
						R = h - f[v];
					h = $t(b, h, R);
				}
				const d = c.fn({ ...t, [p]: u, [m]: h });
				return {
					...d,
					data: { x: d.x - n, y: d.y - r, enabled: { [p]: s, [m]: i } },
				};
			},
		}
	);
function er(e) {
	const t = be(e);
	let n = Number.parseFloat(t.width) || 0,
		r = Number.parseFloat(t.height) || 0;
	const o = ne(e),
		s = o ? e.offsetWidth : n,
		i = o ? e.offsetHeight : r,
		c = ft(n) !== s || ft(r) !== i;
	return c && ((n = s), (r = i)), { width: n, height: r, $: c };
}
function Qt(e) {
	return G(e) ? e : e.contextElement;
}
function ze(e) {
	const t = Qt(e);
	if (!ne(t)) return Re(1);
	const n = t.getBoundingClientRect(),
		{ width: r, height: o, $: s } = er(t);
	let i = (s ? ft(n.width) : n.width) / r,
		c = (s ? ft(n.height) : n.height) / o;
	return (
		(!i || !Number.isFinite(i)) && (i = 1),
		(!c || !Number.isFinite(c)) && (c = 1),
		{ x: i, y: c }
	);
}
const ho = Re(0);
function tr(e) {
	const t = ge(e);
	return !Rt() || !t.visualViewport
		? ho
		: { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function vo(e, t, n) {
	return t === void 0 && (t = !1), !n || (t && n !== ge(e)) ? !1 : t;
}
function Ke(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	const o = e.getBoundingClientRect(),
		s = Qt(e);
	let i = Re(1);
	t && (r ? G(r) && (i = ze(r)) : (i = ze(e)));
	const c = vo(s, n, r) ? tr(s) : Re(0);
	let a = (o.left + c.x) / i.x,
		l = (o.top + c.y) / i.y,
		f = o.width / i.x,
		m = o.height / i.y;
	if (s) {
		const p = ge(s),
			u = r && G(r) ? ge(r) : r;
		let h = p,
			d = Wt(h);
		for (; d && r && u !== h; ) {
			const w = ze(d),
				v = d.getBoundingClientRect(),
				b = be(d),
				R = v.left + (d.clientLeft + Number.parseFloat(b.paddingLeft)) * w.x,
				A = v.top + (d.clientTop + Number.parseFloat(b.paddingTop)) * w.y;
			(a *= w.x),
				(l *= w.y),
				(f *= w.x),
				(m *= w.y),
				(a += R),
				(l += A),
				(h = ge(d)),
				(d = Wt(h));
		}
	}
	return gt({ width: f, height: m, x: a, y: l });
}
function Ct(e, t) {
	const n = Et(e).scrollLeft;
	return t ? t.left + n : Ke(Te(e)).left + n;
}
function nr(e, t) {
	const n = e.getBoundingClientRect(),
		r = n.left + t.scrollLeft - Ct(e, n),
		o = n.top + t.scrollTop;
	return { x: r, y: o };
}
function bo(e) {
	const { elements: t, rect: n, offsetParent: r, strategy: o } = e;
	const s = o === "fixed",
		i = Te(r),
		c = t ? xt(t.floating) : !1;
	if (r === i || (c && s)) return n;
	let a = { scrollLeft: 0, scrollTop: 0 },
		l = Re(1);
	const f = Re(0),
		m = ne(r);
	if (
		(m || (!m && !s)) &&
		((De(r) !== "body" || Qe(i)) && (a = Et(r)), ne(r))
	) {
		const u = Ke(r);
		(l = ze(r)), (f.x = u.x + r.clientLeft), (f.y = u.y + r.clientTop);
	}
	const p = i && !m && !s ? nr(i, a) : Re(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - a.scrollLeft * l.x + f.x + p.x,
		y: n.y * l.y - a.scrollTop * l.y + f.y + p.y,
	};
}
function yo(e) {
	return Array.from(e.getClientRects());
}
function wo(e) {
	const t = Te(e),
		n = Et(e),
		r = e.ownerDocument.body,
		o = Ve(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
		s = Ve(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
	let i = -n.scrollLeft + Ct(e);
	const c = -n.scrollTop;
	return (
		be(r).direction === "rtl" && (i += Ve(t.clientWidth, r.clientWidth) - o),
		{ width: o, height: s, x: i, y: c }
	);
}
const mn = 25;
function xo(e, t) {
	const n = ge(e),
		r = Te(e),
		o = n.visualViewport;
	let s = r.clientWidth,
		i = r.clientHeight,
		c = 0,
		a = 0;
	if (o) {
		(s = o.width), (i = o.height);
		const f = Rt();
		(!f || (f && t === "fixed")) && ((c = o.offsetLeft), (a = o.offsetTop));
	}
	const l = Ct(r);
	if (l <= 0) {
		const f = r.ownerDocument,
			m = f.body,
			p = getComputedStyle(m),
			u =
				(f.compatMode === "CSS1Compat" &&
					Number.parseFloat(p.marginLeft) + Number.parseFloat(p.marginRight)) ||
				0,
			h = Math.abs(r.clientWidth - m.clientWidth - u);
		h <= mn && (s -= h);
	} else l <= mn && (s += l);
	return { width: s, height: i, x: c, y: a };
}
const Ro = new Set(["absolute", "fixed"]);
function Eo(e, t) {
	const n = Ke(e, !0, t === "fixed"),
		r = n.top + e.clientTop,
		o = n.left + e.clientLeft,
		s = ne(e) ? ze(e) : Re(1),
		i = e.clientWidth * s.x,
		c = e.clientHeight * s.y,
		a = o * s.x,
		l = r * s.y;
	return { width: i, height: c, x: a, y: l };
}
function gn(e, t, n) {
	let r;
	if (t === "viewport") r = xo(e, n);
	else if (t === "document") r = wo(Te(e));
	else if (G(t)) r = Eo(t, n);
	else {
		const o = tr(e);
		r = { x: t.x - o.x, y: t.y - o.y, width: t.width, height: t.height };
	}
	return gt(r);
}
function rr(e, t) {
	const n = Oe(e);
	return n === t || !G(n) || Ie(n)
		? !1
		: be(n).position === "fixed" || rr(n, t);
}
function To(e, t) {
	const n = t.get(e);
	if (n) return n;
	let r = ke(e, [], !1).filter((c) => G(c) && De(c) !== "body"),
		o = null;
	const s = be(e).position === "fixed";
	let i = s ? Oe(e) : e;
	for (; G(i) && !Ie(i); ) {
		const c = be(i),
			a = zt(i);
		!a && c.position === "fixed" && (o = null),
			(
				s
					? !a && !o
					: (!a && c.position === "static" && !!o && Ro.has(o.position)) ||
						(Qe(i) && !a && rr(e, i))
			)
				? (r = r.filter((f) => f !== i))
				: (o = c),
			(i = Oe(i));
	}
	return t.set(e, r), r;
}
function Co(e) {
	const { element: t, boundary: n, rootBoundary: r, strategy: o } = e;
	const i = [
			...(n === "clippingAncestors"
				? xt(t)
					? []
					: To(t, this._c)
				: [].concat(n)),
			r,
		],
		c = i[0],
		a = i.reduce(
			(l, f) => {
				const m = gn(t, f, o);
				return (
					(l.top = Ve(m.top, l.top)),
					(l.right = Xe(m.right, l.right)),
					(l.bottom = Xe(m.bottom, l.bottom)),
					(l.left = Ve(m.left, l.left)),
					l
				);
			},
			gn(t, c, o),
		);
	return {
		width: a.right - a.left,
		height: a.bottom - a.top,
		x: a.left,
		y: a.top,
	};
}
function Io(e) {
	const { width: t, height: n } = er(e);
	return { width: t, height: n };
}
function Oo(e, t, n) {
	const r = ne(t),
		o = Te(t),
		s = n === "fixed",
		i = Ke(e, !0, s, t);
	let c = { scrollLeft: 0, scrollTop: 0 };
	const a = Re(0);
	function l() {
		a.x = Ct(o);
	}
	if (r || (!r && !s))
		if (((De(t) !== "body" || Qe(o)) && (c = Et(t)), r)) {
			const u = Ke(t, !0, s, t);
			(a.x = u.x + t.clientLeft), (a.y = u.y + t.clientTop);
		} else o && l();
	s && !r && o && l();
	const f = o && !r && !s ? nr(o, c) : Re(0),
		m = i.left + c.scrollLeft - a.x - f.x,
		p = i.top + c.scrollTop - a.y - f.y;
	return { x: m, y: p, width: i.width, height: i.height };
}
function At(e) {
	return be(e).position === "static";
}
function pn(e, t) {
	if (!ne(e) || be(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Te(e) === n && (n = n.ownerDocument.body), n;
}
function or(e, t) {
	const n = ge(e);
	if (xt(e)) return n;
	if (!ne(e)) {
		let o = Oe(e);
		for (; o && !Ie(o); ) {
			if (G(o) && !At(o)) return o;
			o = Oe(o);
		}
		return n;
	}
	let r = pn(e, t);
	for (; r && yr(r) && At(r); ) r = pn(r, t);
	return r && Ie(r) && At(r) && !zt(r) ? n : r || Tr(e) || n;
}
const So = async function (e) {
	const t = this.getOffsetParent || or,
		n = this.getDimensions,
		r = await n(e.floating);
	return {
		reference: Oo(e.reference, await t(e.floating), e.strategy),
		floating: { x: 0, y: 0, width: r.width, height: r.height },
	};
};
function Po(e) {
	return be(e).direction === "rtl";
}
const Mo = {
	convertOffsetParentRelativeRectToViewportRelativeRect: bo,
	getDocumentElement: Te,
	getClippingRect: Co,
	getOffsetParent: or,
	getElementRects: So,
	getClientRects: yo,
	getDimensions: Io,
	getScale: ze,
	isElement: G,
	isRTL: Po,
};
function ir(e, t) {
	return (
		e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
	);
}
function Ao(e, t) {
	let n = null,
		r;
	const o = Te(e);
	function s() {
		var c;
		clearTimeout(r), (c = n) == null || c.disconnect(), (n = null);
	}
	function i(c, a) {
		c === void 0 && (c = !1), a === void 0 && (a = 1), s();
		const l = e.getBoundingClientRect(),
			{ left: f, top: m, width: p, height: u } = l;
		if ((c || t(), !p || !u)) return;
		const h = qe(m),
			d = qe(o.clientWidth - (f + p)),
			w = qe(o.clientHeight - (m + u)),
			v = qe(f),
			R = {
				rootMargin: -h + "px " + -d + "px " + -w + "px " + -v + "px",
				threshold: Ve(0, Xe(1, a)) || 1,
			};
		let A = !0;
		function k(N) {
			const _ = N[0].intersectionRatio;
			if (_ !== a) {
				if (!A) return i();
				_
					? i(!1, _)
					: (r = setTimeout(() => {
							i(!1, 1e-7);
						}, 1e3));
			}
			_ === 1 && !ir(l, e.getBoundingClientRect()) && i(), (A = !1);
		}
		try {
			n = new IntersectionObserver(k, { ...R, root: o.ownerDocument });
		} catch {
			n = new IntersectionObserver(k, R);
		}
		n.observe(e);
	}
	return i(!0), s;
}
function yi(e, t, n, r) {
	r === void 0 && (r = {});
	const {
			ancestorScroll: o = !0,
			ancestorResize: s = !0,
			elementResize: i = typeof ResizeObserver == "function",
			layoutShift: c = typeof IntersectionObserver == "function",
			animationFrame: a = !1,
		} = r,
		l = Qt(e),
		f = o || s ? [...(l ? ke(l) : []), ...ke(t)] : [];
	f.forEach((v) => {
		o && v.addEventListener("scroll", n, { passive: !0 }),
			s && v.addEventListener("resize", n);
	});
	const m = l && c ? Ao(l, n) : null;
	let p = -1,
		u = null;
	i &&
		((u = new ResizeObserver((v) => {
			const [b] = v;
			b &&
				b.target === l &&
				u &&
				(u.unobserve(t),
				cancelAnimationFrame(p),
				(p = requestAnimationFrame(() => {
					var R;
					(R = u) == null || R.observe(t);
				}))),
				n();
		})),
		l && !a && u.observe(l),
		u.observe(t));
	let h,
		d = a ? Ke(e) : null;
	a && w();
	function w() {
		const v = Ke(e);
		d && !ir(d, v) && n(), (d = v), (h = requestAnimationFrame(w));
	}
	return (
		n(),
		() => {
			var v;
			f.forEach((b) => {
				o && b.removeEventListener("scroll", n),
					s && b.removeEventListener("resize", n);
			}),
				m == null || m(),
				(v = u) == null || v.disconnect(),
				(u = null),
				a && cancelAnimationFrame(h);
		}
	);
}
const ko = go,
	Lo = uo,
	Fo = po,
	Do = ao,
	hn = co,
	No = (e, t, n) => {
		const r = new Map(),
			o = { platform: Mo, ...n },
			s = { ...o.platform, _c: r };
		return so(e, t, { ...o, platform: s });
	};
var _o = typeof document < "u",
	Bo = () => {},
	ut = _o ? g.useLayoutEffect : Bo;
function bt(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, o;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (((n = e.length), n !== t.length)) return !1;
			for (r = n; r-- !== 0; ) if (!bt(e[r], t[r])) return !1;
			return !0;
		}
		if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
			return !1;
		for (r = n; r-- !== 0; ) if (!Object.hasOwn(t, o[r])) return !1;
		for (r = n; r-- !== 0; ) {
			const s = o[r];
			if (!(s === "_owner" && e.$$typeof) && !bt(e[s], t[s])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function sr(e) {
	return typeof window > "u"
		? 1
		: (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function vn(e, t) {
	const n = sr(e);
	return Math.round(t * n) / n;
}
function kt(e) {
	const t = g.useRef(e);
	return (
		ut(() => {
			t.current = e;
		}),
		t
	);
}
function Vo(e) {
	e === void 0 && (e = {});
	const {
			placement: t = "bottom",
			strategy: n = "absolute",
			middleware: r = [],
			platform: o,
			elements: { reference: s, floating: i } = {},
			transform: c = !0,
			whileElementsMounted: a,
			open: l,
		} = e,
		[f, m] = g.useState({
			x: 0,
			y: 0,
			strategy: n,
			placement: t,
			middlewareData: {},
			isPositioned: !1,
		}),
		[p, u] = g.useState(r);
	bt(p, r) || u(r);
	const [h, d] = g.useState(null),
		[w, v] = g.useState(null),
		b = g.useCallback((T) => {
			T !== N.current && ((N.current = T), d(T));
		}, []),
		R = g.useCallback((T) => {
			T !== _.current && ((_.current = T), v(T));
		}, []),
		A = s || h,
		k = i || w,
		N = g.useRef(null),
		_ = g.useRef(null),
		Y = g.useRef(f),
		V = a != null,
		S = kt(a),
		$ = kt(o),
		M = kt(l),
		y = g.useCallback(() => {
			if (!N.current || !_.current) return;
			const T = { placement: t, strategy: n, middleware: p };
			$.current && (T.platform = $.current),
				No(N.current, _.current, T).then((I) => {
					const C = { ...I, isPositioned: M.current !== !1 };
					x.current &&
						!bt(Y.current, C) &&
						((Y.current = C),
						Wn.flushSync(() => {
							m(C);
						}));
				});
		}, [p, t, n, $, M]);
	ut(() => {
		l === !1 &&
			Y.current.isPositioned &&
			((Y.current.isPositioned = !1), m((T) => ({ ...T, isPositioned: !1 })));
	}, [l]);
	const x = g.useRef(!1);
	ut(
		() => (
			(x.current = !0),
			() => {
				x.current = !1;
			}
		),
		[],
	),
		ut(() => {
			if ((A && (N.current = A), k && (_.current = k), A && k)) {
				if (S.current) return S.current(A, k, y);
				y();
			}
		}, [A, k, y, S, V]);
	const P = g.useMemo(
			() => ({ reference: N, floating: _, setReference: b, setFloating: R }),
			[b, R],
		),
		E = g.useMemo(() => ({ reference: A, floating: k }), [A, k]),
		O = g.useMemo(() => {
			const T = { position: n, left: 0, top: 0 };
			if (!E.floating) return T;
			const I = vn(E.floating, f.x),
				C = vn(E.floating, f.y);
			return c
				? {
						...T,
						transform: "translate(" + I + "px, " + C + "px)",
						...(sr(E.floating) >= 1.5 && { willChange: "transform" }),
					}
				: { position: n, left: I, top: C };
		}, [n, c, E.floating, f.x, f.y]);
	return g.useMemo(
		() => ({ ...f, update: y, refs: P, elements: E, floatingStyles: O }),
		[f, y, P, E, O],
	);
}
const Wo = (e) => {
		function t(n) {
			return Object.hasOwn(n, "current");
		}
		return {
			name: "arrow",
			options: e,
			fn(n) {
				const { element: r, padding: o } = typeof e == "function" ? e(n) : e;
				return r && t(r)
					? r.current != null
						? hn({ element: r.current, padding: o }).fn(n)
						: {}
					: r
						? hn({ element: r, padding: o }).fn(n)
						: {};
			},
		};
	},
	wi = (e, t) => ({ ...ko(e), options: [e, t] }),
	xi = (e, t) => ({ ...Fo(e), options: [e, t] }),
	Ri = (e, t) => ({ ...Do(e), options: [e, t] }),
	Ei = (e, t) => ({ ...Lo(e), options: [e, t] }),
	Ti = (e, t) => ({ ...Wo(e), options: [e, t] });
function bn(e) {
	return g.useMemo(
		() =>
			e.every((t) => t == null)
				? null
				: (t) => {
						e.forEach((n) => {
							typeof n == "function" ? n(t) : n != null && (n.current = t);
						});
					},
		e,
	);
}
const cr = { ...hr },
	Ko = cr.useInsertionEffect,
	$o = Ko || ((e) => e());
function oe(e) {
	const t = g.useRef(() => {});
	return (
		$o(() => {
			t.current = e;
		}),
		g.useCallback(() => {
			for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++)
				r[o] = arguments[o];
			return t.current == null ? void 0 : t.current(...r);
		}, [])
	);
}
const en = "ArrowUp",
	et = "ArrowDown",
	Le = "ArrowLeft",
	Fe = "ArrowRight";
function it(e, t, n) {
	return Math.floor(e / t) !== n;
}
function Ge(e, t) {
	return t < 0 || t >= e.current.length;
}
function Lt(e, t) {
	return fe(e, { disabledIndices: t });
}
function yn(e, t) {
	return fe(e, {
		decrement: !0,
		startingIndex: e.current.length,
		disabledIndices: t,
	});
}
function fe(e, t) {
	const {
		startingIndex: n = -1,
		decrement: r = !1,
		disabledIndices: o,
		amount: s = 1,
	} = t === void 0 ? {} : t;
	const i = e.current;
	let c = n;
	do c += r ? -s : s;
	while (c >= 0 && c <= i.length - 1 && at(i, c, o));
	return c;
}
function jo(e, t) {
	let {
			event: n,
			orientation: r,
			loop: o,
			rtl: s,
			cols: i,
			disabledIndices: c,
			minIndex: a,
			maxIndex: l,
			prevIndex: f,
			stopEvent: m = !1,
		} = t,
		p = f;
	if (n.key === en) {
		if ((m && le(n), f === -1)) p = l;
		else if (
			((p = fe(e, {
				startingIndex: p,
				amount: i,
				decrement: !0,
				disabledIndices: c,
			})),
			o && (f - i < a || p < 0))
		) {
			const u = f % i,
				h = l % i,
				d = l - (h - u);
			h === u ? (p = l) : (p = h > u ? d : d - i);
		}
		Ge(e, p) && (p = f);
	}
	if (
		(n.key === et &&
			(m && le(n),
			f === -1
				? (p = a)
				: ((p = fe(e, { startingIndex: f, amount: i, disabledIndices: c })),
					o &&
						f + i > l &&
						(p = fe(e, {
							startingIndex: (f % i) - i,
							amount: i,
							disabledIndices: c,
						}))),
			Ge(e, p) && (p = f)),
		r === "both")
	) {
		const u = qe(f / i);
		n.key === (s ? Le : Fe) &&
			(m && le(n),
			f % i !== i - 1
				? ((p = fe(e, { startingIndex: f, disabledIndices: c })),
					o &&
						it(p, i, u) &&
						(p = fe(e, { startingIndex: f - (f % i) - 1, disabledIndices: c })))
				: o &&
					(p = fe(e, { startingIndex: f - (f % i) - 1, disabledIndices: c })),
			it(p, i, u) && (p = f)),
			n.key === (s ? Fe : Le) &&
				(m && le(n),
				f % i !== 0
					? ((p = fe(e, {
							startingIndex: f,
							decrement: !0,
							disabledIndices: c,
						})),
						o &&
							it(p, i, u) &&
							(p = fe(e, {
								startingIndex: f + (i - (f % i)),
								decrement: !0,
								disabledIndices: c,
							})))
					: o &&
						(p = fe(e, {
							startingIndex: f + (i - (f % i)),
							decrement: !0,
							disabledIndices: c,
						})),
				it(p, i, u) && (p = f));
		const h = qe(l / i) === u;
		Ge(e, p) &&
			(o && h
				? (p =
						n.key === (s ? Fe : Le)
							? l
							: fe(e, { startingIndex: f - (f % i) - 1, disabledIndices: c }))
				: (p = f));
	}
	return p;
}
function Ho(e, t, n) {
	const r = [];
	let o = 0;
	return (
		e.forEach((s, i) => {
			let { width: c, height: a } = s,
				l = !1;
			for (n && (o = 0); !l; ) {
				const f = [];
				for (let m = 0; m < c; m++)
					for (let p = 0; p < a; p++) f.push(o + m + p * t);
				(o % t) + c <= t && f.every((m) => r[m] == null)
					? (f.forEach((m) => {
							r[m] = i;
						}),
						(l = !0))
					: o++;
			}
		}),
		[...r]
	);
}
function qo(e, t, n, r, o) {
	if (e === -1) return -1;
	const s = n.indexOf(e),
		i = t[e];
	switch (o) {
		case "tl":
			return s;
		case "tr":
			return i ? s + i.width - 1 : s;
		case "bl":
			return i ? s + (i.height - 1) * r : s;
		case "br":
			return n.lastIndexOf(e);
	}
}
function zo(e, t) {
	return t.flatMap((n, r) => (e.includes(n) ? [r] : []));
}
function at(e, t, n) {
	if (n) return n.includes(t);
	const r = e[t];
	return (
		r == null ||
		r.hasAttribute("disabled") ||
		r.getAttribute("aria-disabled") === "true"
	);
}
var Z = typeof document < "u" ? g.useLayoutEffect : g.useEffect;
function Xo(e, t) {
	const n = e.compareDocumentPosition(t);
	return n & Node.DOCUMENT_POSITION_FOLLOWING ||
		n & Node.DOCUMENT_POSITION_CONTAINED_BY
		? -1
		: n & Node.DOCUMENT_POSITION_PRECEDING ||
				n & Node.DOCUMENT_POSITION_CONTAINS
			? 1
			: 0;
}
function Yo(e, t) {
	if (e.size !== t.size) return !1;
	for (const [n, r] of e.entries()) if (r !== t.get(n)) return !1;
	return !0;
}
const lr = g.createContext({
	register: () => {},
	unregister: () => {},
	map: new Map(),
	elementsRef: { current: [] },
});
function Ci(e) {
	const { children: t, elementsRef: n, labelsRef: r } = e,
		[o, s] = g.useState(() => new Map()),
		i = g.useCallback((a) => {
			s((l) => new Map(l).set(a, null));
		}, []),
		c = g.useCallback((a) => {
			s((l) => {
				const f = new Map(l);
				return f.delete(a), f;
			});
		}, []);
	return (
		Z(() => {
			const a = new Map(o);
			Array.from(a.keys())
				.sort(Xo)
				.forEach((f, m) => {
					a.set(f, m);
				}),
				Yo(o, a) || s(a);
		}, [o]),
		pe.jsx(lr.Provider, {
			value: g.useMemo(
				() => ({
					register: i,
					unregister: c,
					map: o,
					elementsRef: n,
					labelsRef: r,
				}),
				[i, c, o, n, r],
			),
			children: t,
		})
	);
}
function Ii(e) {
	e === void 0 && (e = {});
	const { label: t } = e,
		{
			register: n,
			unregister: r,
			map: o,
			elementsRef: s,
			labelsRef: i,
		} = g.useContext(lr),
		[c, a] = g.useState(null),
		l = g.useRef(null),
		f = g.useCallback(
			(m) => {
				if (((l.current = m), c !== null && ((s.current[c] = m), i))) {
					var p;
					const u = t !== void 0;
					i.current[c] = u
						? t
						: (p = m == null ? void 0 : m.textContent) != null
							? p
							: null;
				}
			},
			[c, s, i, t],
		);
	return (
		Z(() => {
			const m = l.current;
			if (m)
				return (
					n(m),
					() => {
						r(m);
					}
				);
		}, [n, r]),
		Z(() => {
			const m = l.current ? o.get(l.current) : null;
			m != null && a(m);
		}, [o]),
		g.useMemo(() => ({ ref: f, index: c ?? -1 }), [c, f])
	);
}
let wn = !1,
	Uo = 0;
const xn = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + Uo++;
function Go() {
	const [e, t] = g.useState(() => (wn ? xn() : void 0));
	return (
		Z(() => {
			e == null && t(xn());
		}, []),
		g.useEffect(() => {
			wn = !0;
		}, []),
		e
	);
}
const Zo = cr.useId,
	tn = Zo || Go;
function Jo() {
	const e = new Map();
	return {
		emit(t, n) {
			var r;
			(r = e.get(t)) == null || r.forEach((o) => o(n));
		},
		on(t, n) {
			e.set(t, [...(e.get(t) || []), n]);
		},
		off(t, n) {
			var r;
			e.set(
				t,
				((r = e.get(t)) == null ? void 0 : r.filter((o) => o !== n)) || [],
			);
		},
	};
}
const Qo = g.createContext(null),
	ei = g.createContext(null),
	It = () => {
		var e;
		return ((e = g.useContext(Qo)) == null ? void 0 : e.id) || null;
	},
	tt = () => g.useContext(ei);
function $e(e) {
	return "data-floating-ui-" + e;
}
function he(e) {
	const t = g.useRef(e);
	return (
		Z(() => {
			t.current = e;
		}),
		t
	);
}
const Rn = $e("safe-polygon");
function Ft(e, t, n) {
	return n && !Je(n) ? 0 : typeof e == "number" ? e : e == null ? void 0 : e[t];
}
function Oi(e, t) {
	t === void 0 && (t = {});
	const { open: n, onOpenChange: r, dataRef: o, events: s, elements: i } = e,
		{
			enabled: c = !0,
			delay: a = 0,
			handleClose: l = null,
			mouseOnly: f = !1,
			restMs: m = 0,
			move: p = !0,
		} = t,
		u = tt(),
		h = It(),
		d = he(l),
		w = he(a),
		v = he(n),
		b = g.useRef(),
		R = g.useRef(-1),
		A = g.useRef(),
		k = g.useRef(-1),
		N = g.useRef(!0),
		_ = g.useRef(!1),
		Y = g.useRef(() => {}),
		V = g.useRef(!1),
		S = g.useCallback(() => {
			var O;
			const T = (O = o.current.openEvent) == null ? void 0 : O.type;
			return (T == null ? void 0 : T.includes("mouse")) && T !== "mousedown";
		}, [o]);
	g.useEffect(() => {
		if (!c) return;
		function O(T) {
			const { open: I } = T;
			I ||
				(clearTimeout(R.current),
				clearTimeout(k.current),
				(N.current = !0),
				(V.current = !1));
		}
		return (
			s.on("openchange", O),
			() => {
				s.off("openchange", O);
			}
		);
	}, [c, s]),
		g.useEffect(() => {
			if (!c || !d.current || !n) return;
			function O(I) {
				S() && r(!1, I, "hover");
			}
			const T = ue(i.floating).documentElement;
			return (
				T.addEventListener("mouseleave", O),
				() => {
					T.removeEventListener("mouseleave", O);
				}
			);
		}, [i.floating, n, r, c, d, S]);
	const $ = g.useCallback(
			(O, T, I) => {
				T === void 0 && (T = !0), I === void 0 && (I = "hover");
				const C = Ft(w.current, "close", b.current);
				C && !A.current
					? (clearTimeout(R.current),
						(R.current = window.setTimeout(() => r(!1, O, I), C)))
					: T && (clearTimeout(R.current), r(!1, O, I));
			},
			[w, r],
		),
		M = oe(() => {
			Y.current(), (A.current = void 0);
		}),
		y = oe(() => {
			if (_.current) {
				const O = ue(i.floating).body;
				(O.style.pointerEvents = ""), O.removeAttribute(Rn), (_.current = !1);
			}
		}),
		x = oe(() =>
			o.current.openEvent
				? ["click", "mousedown"].includes(o.current.openEvent.type)
				: !1,
		);
	g.useEffect(() => {
		if (!c) return;
		function O(L) {
			if (
				(clearTimeout(R.current),
				(N.current = !1),
				(f && !Je(b.current)) || (m > 0 && !Ft(w.current, "open")))
			)
				return;
			const H = Ft(w.current, "open", b.current);
			H
				? (R.current = window.setTimeout(() => {
						v.current || r(!0, L, "hover");
					}, H))
				: n || r(!0, L, "hover");
		}
		function T(L) {
			if (x()) return;
			Y.current();
			const H = ue(i.floating);
			if (
				(clearTimeout(k.current),
				(V.current = !1),
				d.current && o.current.floatingContext)
			) {
				n || clearTimeout(R.current),
					(A.current = d.current({
						...o.current.floatingContext,
						tree: u,
						x: L.clientX,
						y: L.clientY,
						onClose() {
							y(), M(), x() || $(L, !0, "safe-polygon");
						},
					}));
				const se = A.current;
				H.addEventListener("mousemove", se),
					(Y.current = () => {
						H.removeEventListener("mousemove", se);
					});
				return;
			}
			(b.current === "touch" ? !te(i.floating, L.relatedTarget) : !0) && $(L);
		}
		function I(L) {
			x() ||
				(o.current.floatingContext &&
					(d.current == null ||
						d.current({
							...o.current.floatingContext,
							tree: u,
							x: L.clientX,
							y: L.clientY,
							onClose() {
								y(), M(), x() || $(L);
							},
						})(L)));
		}
		if (G(i.domReference)) {
			var C;
			const L = i.domReference;
			return (
				n && L.addEventListener("mouseleave", I),
				(C = i.floating) == null || C.addEventListener("mouseleave", I),
				p && L.addEventListener("mousemove", O, { once: !0 }),
				L.addEventListener("mouseenter", O),
				L.addEventListener("mouseleave", T),
				() => {
					var H;
					n && L.removeEventListener("mouseleave", I),
						(H = i.floating) == null || H.removeEventListener("mouseleave", I),
						p && L.removeEventListener("mousemove", O),
						L.removeEventListener("mouseenter", O),
						L.removeEventListener("mouseleave", T);
				}
			);
		}
	}, [i, c, e, f, m, p, $, M, y, r, n, v, u, w, d, o, x]),
		Z(() => {
			var O;
			if (
				c &&
				n &&
				(O = d.current) != null &&
				O.__options.blockPointerEvents &&
				S()
			) {
				_.current = !0;
				const I = i.floating;
				if (G(i.domReference) && I) {
					var T;
					const C = ue(i.floating).body;
					C.setAttribute(Rn, "");
					const L = i.domReference,
						H =
							u == null ||
							(T = u.nodesRef.current.find((ie) => ie.id === h)) == null ||
							(T = T.context) == null
								? void 0
								: T.elements.floating;
					return (
						H && (H.style.pointerEvents = ""),
						(C.style.pointerEvents = "none"),
						(L.style.pointerEvents = "auto"),
						(I.style.pointerEvents = "auto"),
						() => {
							(C.style.pointerEvents = ""),
								(L.style.pointerEvents = ""),
								(I.style.pointerEvents = "");
						}
					);
				}
			}
		}, [c, n, h, i, u, d, S]),
		Z(() => {
			n || ((b.current = void 0), (V.current = !1), M(), y());
		}, [n, M, y]),
		g.useEffect(
			() => () => {
				M(), clearTimeout(R.current), clearTimeout(k.current), y();
			},
			[c, i.domReference, M, y],
		);
	const P = g.useMemo(() => {
			function O(T) {
				b.current = T.pointerType;
			}
			return {
				onPointerDown: O,
				onPointerEnter: O,
				onMouseMove(T) {
					const { nativeEvent: I } = T;
					function C() {
						!N.current && !v.current && r(!0, I, "hover");
					}
					(f && !Je(b.current)) ||
						n ||
						m === 0 ||
						(V.current && T.movementX ** 2 + T.movementY ** 2 < 2) ||
						(clearTimeout(k.current),
						b.current === "touch"
							? C()
							: ((V.current = !0), (k.current = window.setTimeout(C, m))));
				},
			};
		}, [f, r, n, v, m]),
		E = g.useMemo(
			() => ({
				onMouseEnter() {
					clearTimeout(R.current);
				},
				onMouseLeave(O) {
					x() || $(O.nativeEvent, !1);
				},
			}),
			[$, x],
		);
	return g.useMemo(() => (c ? { reference: P, floating: E } : {}), [c, P, E]);
}
let En = 0;
function _e(e, t) {
	t === void 0 && (t = {});
	const { preventScroll: n = !1, cancelPrevious: r = !0, sync: o = !1 } = t;
	r && cancelAnimationFrame(En);
	const s = () => (e == null ? void 0 : e.focus({ preventScroll: n }));
	o ? s() : (En = requestAnimationFrame(s));
}
function Tn(e, t) {
	var n;
	let r = [],
		o = (n = e.find((s) => s.id === t)) == null ? void 0 : n.parentId;
	for (; o; ) {
		const s = e.find((i) => i.id === o);
		(o = s == null ? void 0 : s.parentId), s && (r = r.concat(s));
	}
	return r;
}
function We(e, t) {
	let n = e.filter((o) => {
			var s;
			return o.parentId === t && ((s = o.context) == null ? void 0 : s.open);
		}),
		r = n;
	for (; r.length; )
		(r = e.filter((o) => {
			var s;
			return (s = r) == null
				? void 0
				: s.some((i) => {
						var c;
						return (
							o.parentId === i.id && ((c = o.context) == null ? void 0 : c.open)
						);
					});
		})),
			(n = n.concat(r));
	return n;
}
function ti(e, t) {
	let n,
		r = -1;
	function o(s, i) {
		i > r && ((n = s), (r = i)),
			We(e, s).forEach((a) => {
				o(a.id, i + 1);
			});
	}
	return o(t, 0), e.find((s) => s.id === n);
}
let He = new WeakMap(),
	st = new WeakSet(),
	ct = {},
	Dt = 0;
const ni = () => typeof HTMLElement < "u" && "inert" in HTMLElement.prototype,
	ur = (e) => e && (e.host || ur(e.parentNode)),
	ri = (e, t) =>
		t
			.map((n) => {
				if (e.contains(n)) return n;
				const r = ur(n);
				return e.contains(r) ? r : null;
			})
			.filter((n) => n != null);
function oi(e, t, n, r) {
	const o = "data-floating-ui-inert",
		s = r ? "inert" : n ? "aria-hidden" : null,
		i = ri(t, e),
		c = new Set(),
		a = new Set(i),
		l = [];
	ct[o] || (ct[o] = new WeakMap());
	const f = ct[o];
	i.forEach(m), p(t), c.clear();
	function m(u) {
		!u || c.has(u) || (c.add(u), u.parentNode && m(u.parentNode));
	}
	function p(u) {
		!u ||
			a.has(u) ||
			[].forEach.call(u.children, (h) => {
				if (De(h) !== "script")
					if (c.has(h)) p(h);
					else {
						const d = s ? h.getAttribute(s) : null,
							w = d !== null && d !== "false",
							v = He.get(h) || 0,
							b = s ? v + 1 : v,
							R = (f.get(h) || 0) + 1;
						He.set(h, b),
							f.set(h, R),
							l.push(h),
							b === 1 && w && st.add(h),
							R === 1 && h.setAttribute(o, ""),
							!w && s && h.setAttribute(s, "true");
					}
			});
	}
	return (
		Dt++,
		() => {
			l.forEach((u) => {
				const h = He.get(u) || 0,
					d = s ? h - 1 : h,
					w = (f.get(u) || 0) - 1;
				He.set(u, d),
					f.set(u, w),
					d || (!st.has(u) && s && u.removeAttribute(s), st.delete(u)),
					w || u.removeAttribute(o);
			}),
				Dt--,
				Dt ||
					((He = new WeakMap()),
					(He = new WeakMap()),
					(st = new WeakSet()),
					(ct = {}));
		}
	);
}
function Cn(e, t, n) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	const r = ue(e[0]).body;
	return oi(e.concat(Array.from(r.querySelectorAll("[aria-live]"))), r, t, n);
}
const Ot = () => ({
	getShadowRoot: !0,
	displayCheck:
		typeof ResizeObserver == "function" &&
		ResizeObserver.toString().includes("[native code]")
			? "full"
			: "none",
});
function ar(e, t) {
	const n = Tt(e, Ot());
	t === "prev" && n.reverse();
	const r = n.indexOf(ye(ue(e)));
	return n.slice(r + 1)[0];
}
function fr() {
	return ar(document.body, "next");
}
function dr() {
	return ar(document.body, "prev");
}
function Ze(e, t) {
	const n = t || e.currentTarget,
		r = e.relatedTarget;
	return !r || !te(n, r);
}
function ii(e) {
	Tt(e, Ot()).forEach((n) => {
		(n.dataset.tabindex = n.getAttribute("tabindex") || ""),
			n.setAttribute("tabindex", "-1");
	});
}
function In(e) {
	e.querySelectorAll("[data-tabindex]").forEach((n) => {
		const r = n.dataset.tabindex;
		delete n.dataset.tabindex,
			r ? n.setAttribute("tabindex", r) : n.removeAttribute("tabindex");
	});
}
const St = {
	border: 0,
	clip: "rect(0 0 0 0)",
	height: "1px",
	margin: "-1px",
	overflow: "hidden",
	padding: 0,
	position: "fixed",
	whiteSpace: "nowrap",
	width: "1px",
	top: 0,
	left: 0,
};
let si;
function On(e) {
	e.key === "Tab" && (e.target, clearTimeout(si));
}
const yt = g.forwardRef((t, n) => {
		const [r, o] = g.useState();
		Z(
			() => (
				qn() && o("button"),
				document.addEventListener("keydown", On),
				() => {
					document.removeEventListener("keydown", On);
				}
			),
			[],
		);
		const s = {
			ref: n,
			tabIndex: 0,
			role: r,
			"aria-hidden": r ? void 0 : !0,
			[$e("focus-guard")]: "",
			style: St,
		};
		return pe.jsx("span", { ...t, ...s });
	}),
	mr = g.createContext(null),
	Sn = $e("portal");
function ci(e) {
	e === void 0 && (e = {});
	const { id: t, root: n } = e,
		r = tn(),
		o = gr(),
		[s, i] = g.useState(null),
		c = g.useRef(null);
	return (
		Z(
			() => () => {
				s == null || s.remove(),
					queueMicrotask(() => {
						c.current = null;
					});
			},
			[s],
		),
		Z(() => {
			if (!r || c.current) return;
			const a = t ? document.getElementById(t) : null;
			if (!a) return;
			const l = document.createElement("div");
			(l.id = r),
				l.setAttribute(Sn, ""),
				a.appendChild(l),
				(c.current = l),
				i(l);
		}, [t, r]),
		Z(() => {
			if (n === null || !r || c.current) return;
			let a = n || (o == null ? void 0 : o.portalNode);
			a && !G(a) && (a = a.current), (a = a || document.body);
			let l = null;
			t && ((l = document.createElement("div")), (l.id = t), a.appendChild(l));
			const f = document.createElement("div");
			(f.id = r),
				f.setAttribute(Sn, ""),
				(a = l || a),
				a.appendChild(f),
				(c.current = f),
				i(f);
		}, [t, n, r, o]),
		s
	);
}
function Si(e) {
	const { children: t, id: n, root: r, preserveTabOrder: o = !0 } = e,
		s = ci({ id: n, root: r }),
		[i, c] = g.useState(null),
		a = g.useRef(null),
		l = g.useRef(null),
		f = g.useRef(null),
		m = g.useRef(null),
		p = i == null ? void 0 : i.modal,
		u = i == null ? void 0 : i.open,
		h = !!i && !i.modal && i.open && o && !!(r || s);
	return (
		g.useEffect(() => {
			if (!s || !o || p) return;
			function d(w) {
				s && Ze(w) && (w.type === "focusin" ? In : ii)(s);
			}
			return (
				s.addEventListener("focusin", d, !0),
				s.addEventListener("focusout", d, !0),
				() => {
					s.removeEventListener("focusin", d, !0),
						s.removeEventListener("focusout", d, !0);
				}
			);
		}, [s, o, p]),
		g.useEffect(() => {
			s && (u || In(s));
		}, [u, s]),
		pe.jsxs(mr.Provider, {
			value: g.useMemo(
				() => ({
					preserveTabOrder: o,
					beforeOutsideRef: a,
					afterOutsideRef: l,
					beforeInsideRef: f,
					afterInsideRef: m,
					portalNode: s,
					setFocusManagerState: c,
				}),
				[o, s],
			),
			children: [
				h &&
					s &&
					pe.jsx(yt, {
						"data-type": "outside",
						ref: a,
						onFocus: (d) => {
							if (Ze(d, s)) {
								var w;
								(w = f.current) == null || w.focus();
							} else {
								const v = dr() || (i == null ? void 0 : i.domReference);
								v == null || v.focus();
							}
						},
					}),
				h && s && pe.jsx("span", { "aria-owns": s.id, style: St }),
				s && Wn.createPortal(t, s),
				h &&
					s &&
					pe.jsx(yt, {
						"data-type": "outside",
						ref: l,
						onFocus: (d) => {
							if (Ze(d, s)) {
								var w;
								(w = m.current) == null || w.focus();
							} else {
								const v = fr() || (i == null ? void 0 : i.domReference);
								v == null || v.focus(),
									i != null &&
										i.closeOnFocusOut &&
										(i == null ||
											i.onOpenChange(!1, d.nativeEvent, "focus-out"));
							}
						},
					}),
			],
		})
	);
}
const gr = () => g.useContext(mr),
	Ht = "data-floating-ui-focusable";
function qt(e) {
	return e
		? e.hasAttribute(Ht)
			? e
			: e.querySelector("[" + Ht + "]") || e
		: null;
}
const Pn = 20;
let Be = [];
function Nt(e) {
	(Be = Be.filter((t) => t.isConnected)),
		e &&
			De(e) !== "body" &&
			(Be.push(e), Be.length > Pn && (Be = Be.slice(-Pn)));
}
function Mn() {
	return Be.slice()
		.reverse()
		.find((e) => e.isConnected);
}
function li(e) {
	const t = Ot();
	return io(e, t) ? e : Tt(e, t)[0] || e;
}
const ui = g.forwardRef((t, n) =>
	pe.jsx("button", { ...t, type: "button", ref: n, tabIndex: -1, style: St }),
);
function Pi(e) {
	const {
			context: t,
			children: n,
			disabled: r = !1,
			order: o = ["content"],
			guards: s = !0,
			initialFocus: i = 0,
			returnFocus: c = !0,
			restoreFocus: a = !1,
			modal: l = !0,
			visuallyHiddenDismiss: f = !1,
			closeOnFocusOut: m = !0,
			outsideElementsInert: p = !1,
		} = e,
		{
			open: u,
			onOpenChange: h,
			events: d,
			dataRef: w,
			elements: { domReference: v, floating: b },
		} = t,
		R = oe(() => {
			var F;
			return (F = w.current.floatingContext) == null ? void 0 : F.nodeId;
		}),
		A = typeof i == "number" && i < 0,
		k = zn(v) && A,
		N = ni(),
		_ = N ? s : !0,
		Y = !_ || (N && p),
		V = he(o),
		S = he(i),
		$ = he(c),
		M = tt(),
		y = gr(),
		x = g.useRef(null),
		P = g.useRef(null),
		E = g.useRef(!1),
		O = g.useRef(!1),
		T = g.useRef(-1),
		I = y != null,
		C = qt(b),
		L = oe((F) => (F === void 0 && (F = C), F ? Tt(F, Ot()) : [])),
		H = oe((F) => {
			const W = L(F);
			return V.current
				.map((B) =>
					v && B === "reference" ? v : C && B === "floating" ? C : W,
				)
				.filter(Boolean)
				.flat();
		});
	g.useEffect(() => {
		if (r || !l) return;
		function F(B) {
			if (B.key === "Tab") {
				te(C, ye(ue(C))) && L().length === 0 && !k && le(B);
				const j = H(),
					J = Ce(B);
				V.current[0] === "reference" &&
					J === v &&
					(le(B), B.shiftKey ? _e(j[j.length - 1]) : _e(j[1])),
					V.current[1] === "floating" &&
						J === C &&
						B.shiftKey &&
						(le(B), _e(j[0]));
			}
		}
		const W = ue(C);
		return (
			W.addEventListener("keydown", F),
			() => {
				W.removeEventListener("keydown", F);
			}
		);
	}, [r, v, C, l, V, k, L, H]),
		g.useEffect(() => {
			if (r || !b) return;
			function F(W) {
				const B = Ce(W),
					J = L().indexOf(B);
				J !== -1 && (T.current = J);
			}
			return (
				b.addEventListener("focusin", F),
				() => {
					b.removeEventListener("focusin", F);
				}
			);
		}, [r, b, L]),
		g.useEffect(() => {
			if (r || !m) return;
			function F() {
				(O.current = !0),
					setTimeout(() => {
						O.current = !1;
					});
			}
			function W(B) {
				const j = B.relatedTarget;
				queueMicrotask(() => {
					const J = R(),
						ee = !(
							te(v, j) ||
							te(b, j) ||
							te(j, b) ||
							te(y == null ? void 0 : y.portalNode, j) ||
							(j != null && j.hasAttribute($e("focus-guard"))) ||
							(M &&
								(We(M.nodesRef.current, J).find((U) => {
									var ae, ce;
									return (
										te(
											(ae = U.context) == null ? void 0 : ae.elements.floating,
											j,
										) ||
										te(
											(ce = U.context) == null
												? void 0
												: ce.elements.domReference,
											j,
										)
									);
								}) ||
									Tn(M.nodesRef.current, J).find((U) => {
										var ae, ce, we;
										return (
											[
												(ae = U.context) == null
													? void 0
													: ae.elements.floating,
												qt(
													(ce = U.context) == null
														? void 0
														: ce.elements.floating,
												),
											].includes(j) ||
											((we = U.context) == null
												? void 0
												: we.elements.domReference) === j
										);
									})))
						);
					if (a && ee && ye(ue(C)) === ue(C).body) {
						ne(C) && C.focus();
						const U = T.current,
							ae = L(),
							ce = ae[U] || ae[ae.length - 1] || C;
						ne(ce) && ce.focus();
					}
					(k || !l) &&
						j &&
						ee &&
						!O.current &&
						j !== Mn() &&
						((E.current = !0), h(!1, B, "focus-out"));
				});
			}
			if (b && ne(v))
				return (
					v.addEventListener("focusout", W),
					v.addEventListener("pointerdown", F),
					b.addEventListener("focusout", W),
					() => {
						v.removeEventListener("focusout", W),
							v.removeEventListener("pointerdown", F),
							b.removeEventListener("focusout", W);
					}
				);
		}, [r, v, b, C, l, M, y, h, m, a, L, k, R]);
	const ie = g.useRef(null),
		se = g.useRef(null),
		ve = bn([ie, y == null ? void 0 : y.beforeInsideRef]),
		re = bn([se, y == null ? void 0 : y.afterInsideRef]);
	g.useEffect(() => {
		var F;
		if (r || !b) return;
		const W = Array.from(
				(y == null || (F = y.portalNode) == null
					? void 0
					: F.querySelectorAll("[" + $e("portal") + "]")) || [],
			),
			B =
				M && !l
					? Tn(M == null ? void 0 : M.nodesRef.current, R()).map((ee) => {
							var U;
							return (U = ee.context) == null ? void 0 : U.elements.floating;
						})
					: [],
			j = [
				b,
				...W,
				...B,
				x.current,
				P.current,
				ie.current,
				se.current,
				y == null ? void 0 : y.beforeOutsideRef.current,
				y == null ? void 0 : y.afterOutsideRef.current,
				V.current.includes("reference") || k ? v : null,
			].filter((ee) => ee != null),
			J = l || k ? Cn(j, !Y, Y) : Cn(j);
		return () => {
			J();
		};
	}, [r, v, b, l, V, y, k, _, Y, M, R]),
		Z(() => {
			if (r || !ne(C)) return;
			const F = ue(C),
				W = ye(F);
			queueMicrotask(() => {
				const B = H(C),
					j = S.current,
					J = (typeof j == "number" ? B[j] : j.current) || C,
					ee = te(C, W);
				!A && !ee && u && _e(J, { preventScroll: J === C });
			});
		}, [r, u, C, A, H, S]),
		Z(() => {
			if (r || !C) return;
			let F = !1;
			const W = ue(C),
				B = ye(W);
			let J = w.current.openEvent;
			Nt(B);
			function ee(ce) {
				const { open: we, reason: K, event: X, nested: D } = ce;
				we && (J = X),
					K === "escape-key" && v && Nt(v),
					["hover", "safe-polygon"].includes(K) &&
						X.type === "mouseleave" &&
						(E.current = !0),
					K === "outside-press" &&
						(D
							? ((E.current = !1), (F = !0))
							: (E.current = !(Hn(X) || Yt(X))));
			}
			d.on("openchange", ee);
			const U = W.createElement("span");
			U.setAttribute("tabindex", "-1"),
				U.setAttribute("aria-hidden", "true"),
				Object.assign(U.style, St),
				I && v && v.insertAdjacentElement("afterend", U);
			function ae() {
				return typeof $.current == "boolean"
					? Mn() || U
					: $.current.current || U;
			}
			return () => {
				d.off("openchange", ee);
				const ce = ye(W),
					we =
						te(b, ce) ||
						(M &&
							We(M.nodesRef.current, R()).some((D) => {
								var q;
								return te(
									(q = D.context) == null ? void 0 : q.elements.floating,
									ce,
								);
							}));
				(we || (J && ["click", "mousedown"].includes(J.type))) && v && Nt(v);
				const X = ae();
				queueMicrotask(() => {
					const D = li(X);
					$.current &&
						!E.current &&
						ne(D) &&
						(!(D !== ce && ce !== W.body) || we) &&
						D.focus({ preventScroll: F }),
						U.remove();
				});
			};
		}, [r, b, C, $, w, d, M, I, v, R]),
		g.useEffect(() => {
			queueMicrotask(() => {
				E.current = !1;
			});
		}, [r]),
		Z(() => {
			if (!r && y)
				return (
					y.setFocusManagerState({
						modal: l,
						closeOnFocusOut: m,
						open: u,
						onOpenChange: h,
						domReference: v,
					}),
					() => {
						y.setFocusManagerState(null);
					}
				);
		}, [r, y, l, u, h, m, v]),
		Z(() => {
			if (r || !C || typeof MutationObserver != "function" || A) return;
			const F = () => {
				const B = C.getAttribute("tabindex"),
					j = L(),
					J = ye(ue(b)),
					ee = j.indexOf(J);
				ee !== -1 && (T.current = ee),
					V.current.includes("floating") || (J !== v && j.length === 0)
						? B !== "0" && C.setAttribute("tabindex", "0")
						: B !== "-1" && C.setAttribute("tabindex", "-1");
			};
			F();
			const W = new MutationObserver(F);
			return (
				W.observe(C, { childList: !0, subtree: !0, attributes: !0 }),
				() => {
					W.disconnect();
				}
			);
		}, [r, b, C, v, V, L, A]);
	function Q(F) {
		return r || !f || !l
			? null
			: pe.jsx(ui, {
					ref: F === "start" ? x : P,
					onClick: (W) => h(!1, W.nativeEvent),
					children: typeof f == "string" ? f : "Dismiss",
				});
	}
	const z = !r && _ && (l ? !k : !0) && (I || l);
	return pe.jsxs(pe.Fragment, {
		children: [
			z &&
				pe.jsx(yt, {
					"data-type": "inside",
					ref: ve,
					onFocus: (F) => {
						if (l) {
							const B = H();
							_e(o[0] === "reference" ? B[0] : B[B.length - 1]);
						} else if (y != null && y.preserveTabOrder && y.portalNode)
							if (((E.current = !1), Ze(F, y.portalNode))) {
								const B = fr() || v;
								B == null || B.focus();
							} else {
								var W;
								(W = y.beforeOutsideRef.current) == null || W.focus();
							}
					},
				}),
			!k && Q("start"),
			n,
			Q("end"),
			z &&
				pe.jsx(yt, {
					"data-type": "inside",
					ref: re,
					onFocus: (F) => {
						if (l) _e(H()[0]);
						else if (y != null && y.preserveTabOrder && y.portalNode)
							if ((m && (E.current = !0), Ze(F, y.portalNode))) {
								const B = dr() || v;
								B == null || B.focus();
							} else {
								var W;
								(W = y.afterOutsideRef.current) == null || W.focus();
							}
					},
				}),
		],
	});
}
let lt = 0;
function ai() {
	const e = /iP(hone|ad|od)|iOS/.test(Xt()),
		t = document.body.style,
		r =
			Math.round(document.documentElement.getBoundingClientRect().left) +
			document.documentElement.scrollLeft
				? "paddingLeft"
				: "paddingRight",
		o = window.innerWidth - document.documentElement.clientWidth,
		s = t.left ? Number.parseFloat(t.left) : window.scrollX,
		i = t.top ? Number.parseFloat(t.top) : window.scrollY;
	if (((t.overflow = "hidden"), o && (t[r] = o + "px"), e)) {
		var c, a;
		const l =
				((c = window.visualViewport) == null ? void 0 : c.offsetLeft) || 0,
			f = ((a = window.visualViewport) == null ? void 0 : a.offsetTop) || 0;
		Object.assign(t, {
			position: "fixed",
			top: -(i - Math.floor(f)) + "px",
			left: -(s - Math.floor(l)) + "px",
			right: "0",
		});
	}
	return () => {
		Object.assign(t, { overflow: "", [r]: "" }),
			e &&
				(Object.assign(t, { position: "", top: "", left: "", right: "" }),
				window.scrollTo(s, i));
	};
}
let An = () => {};
const Mi = g.forwardRef((t, n) => {
	const { lockScroll: r = !1, ...o } = t;
	return (
		Z(() => {
			if (r)
				return (
					lt++,
					lt === 1 && (An = ai()),
					() => {
						lt--, lt === 0 && An();
					}
				);
		}, [r]),
		pe.jsx("div", {
			ref: n,
			...o,
			style: {
				position: "fixed",
				overflow: "auto",
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				...o.style,
			},
		})
	);
});
function kn(e) {
	return ne(e.target) && e.target.tagName === "BUTTON";
}
function Ln(e) {
	return Ut(e);
}
function Ai(e, t) {
	t === void 0 && (t = {});
	const {
			open: n,
			onOpenChange: r,
			dataRef: o,
			elements: { domReference: s },
		} = e,
		{
			enabled: i = !0,
			event: c = "click",
			toggle: a = !0,
			ignoreMouse: l = !1,
			keyboardHandlers: f = !0,
			stickIfOpen: m = !0,
		} = t,
		p = g.useRef(),
		u = g.useRef(!1),
		h = g.useMemo(
			() => ({
				onPointerDown(d) {
					p.current = d.pointerType;
				},
				onMouseDown(d) {
					const w = p.current;
					d.button === 0 &&
						c !== "click" &&
						((Je(w, !0) && l) ||
							(n &&
							a &&
							(!(o.current.openEvent && m) ||
								o.current.openEvent.type === "mousedown")
								? r(!1, d.nativeEvent, "click")
								: (d.preventDefault(), r(!0, d.nativeEvent, "click"))));
				},
				onClick(d) {
					const w = p.current;
					if (c === "mousedown" && p.current) {
						p.current = void 0;
						return;
					}
					(Je(w, !0) && l) ||
						(n &&
						a &&
						(!(o.current.openEvent && m) ||
							o.current.openEvent.type === "click")
							? r(!1, d.nativeEvent, "click")
							: r(!0, d.nativeEvent, "click"));
				},
				onKeyDown(d) {
					(p.current = void 0),
						!(d.defaultPrevented || !f || kn(d)) &&
							(d.key === " " &&
								!Ln(s) &&
								(d.preventDefault(), (u.current = !0)),
							d.key === "Enter" && r(!(n && a), d.nativeEvent, "click"));
				},
				onKeyUp(d) {
					d.defaultPrevented ||
						!f ||
						kn(d) ||
						Ln(s) ||
						(d.key === " " &&
							u.current &&
							((u.current = !1), r(!(n && a), d.nativeEvent, "click")));
				},
			}),
			[o, s, c, l, f, r, n, m, a],
		);
	return g.useMemo(() => (i ? { reference: h } : {}), [i, h]);
}
const fi = {
		pointerdown: "onPointerDown",
		mousedown: "onMouseDown",
		click: "onClick",
	},
	di = {
		pointerdown: "onPointerDownCapture",
		mousedown: "onMouseDownCapture",
		click: "onClickCapture",
	},
	Fn = (e) => {
		var t, n;
		return {
			escapeKey:
				typeof e == "boolean"
					? e
					: (t = e == null ? void 0 : e.escapeKey) != null
						? t
						: !1,
			outsidePress:
				typeof e == "boolean"
					? e
					: (n = e == null ? void 0 : e.outsidePress) != null
						? n
						: !0,
		};
	};
function ki(e, t) {
	t === void 0 && (t = {});
	const { open: n, onOpenChange: r, elements: o, dataRef: s } = e,
		{
			enabled: i = !0,
			escapeKey: c = !0,
			outsidePress: a = !0,
			outsidePressEvent: l = "pointerdown",
			referencePress: f = !1,
			referencePressEvent: m = "pointerdown",
			ancestorScroll: p = !1,
			bubbles: u,
			capture: h,
		} = t,
		d = tt(),
		w = oe(typeof a == "function" ? a : () => !1),
		v = typeof a == "function" ? w : a,
		b = g.useRef(!1),
		R = g.useRef(!1),
		{ escapeKey: A, outsidePress: k } = Fn(u),
		{ escapeKey: N, outsidePress: _ } = Fn(h),
		Y = g.useRef(!1),
		V = oe((P) => {
			var E;
			if (!n || !i || !c || P.key !== "Escape" || Y.current) return;
			const O = (E = s.current.floatingContext) == null ? void 0 : E.nodeId,
				T = d ? We(d.nodesRef.current, O) : [];
			if (!A && (P.stopPropagation(), T.length > 0)) {
				let I = !0;
				if (
					(T.forEach((C) => {
						var L;
						if (
							(L = C.context) != null &&
							L.open &&
							!C.context.dataRef.current.__escapeKeyBubbles
						) {
							I = !1;
							return;
						}
					}),
					!I)
				)
					return;
			}
			r(!1, Sr(P) ? P.nativeEvent : P, "escape-key");
		}),
		S = oe((P) => {
			var E;
			const O = () => {
				var T;
				V(P), (T = Ce(P)) == null || T.removeEventListener("keydown", O);
			};
			(E = Ce(P)) == null || E.addEventListener("keydown", O);
		}),
		$ = oe((P) => {
			var E;
			const O = b.current;
			b.current = !1;
			const T = R.current;
			if (
				((R.current = !1),
				(l === "click" && T) || O || (typeof v == "function" && !v(P)))
			)
				return;
			const I = Ce(P),
				C = "[" + $e("inert") + "]",
				L = ue(o.floating).querySelectorAll(C);
			let H = G(I) ? I : null;
			for (; H && !Ie(H); ) {
				const re = Oe(H);
				if (Ie(re) || !G(re)) break;
				H = re;
			}
			if (
				L.length &&
				G(I) &&
				!Pr(I) &&
				!te(I, o.floating) &&
				Array.from(L).every((re) => !te(H, re))
			)
				return;
			if (ne(I) && x) {
				const re = Ie(I),
					Q = be(I),
					z = /auto|scroll/,
					F = re || z.test(Q.overflowX),
					W = re || z.test(Q.overflowY),
					B = F && I.clientWidth > 0 && I.scrollWidth > I.clientWidth,
					j = W && I.clientHeight > 0 && I.scrollHeight > I.clientHeight,
					J = Q.direction === "rtl",
					ee =
						j &&
						(J
							? P.offsetX <= I.offsetWidth - I.clientWidth
							: P.offsetX > I.clientWidth),
					U = B && P.offsetY > I.clientHeight;
				if (ee || U) return;
			}
			const ie = (E = s.current.floatingContext) == null ? void 0 : E.nodeId,
				se =
					d &&
					We(d.nodesRef.current, ie).some((re) => {
						var Q;
						return Mt(
							P,
							(Q = re.context) == null ? void 0 : Q.elements.floating,
						);
					});
			if (Mt(P, o.floating) || Mt(P, o.domReference) || se) return;
			const ve = d ? We(d.nodesRef.current, ie) : [];
			if (ve.length > 0) {
				let re = !0;
				if (
					(ve.forEach((Q) => {
						var z;
						if (
							(z = Q.context) != null &&
							z.open &&
							!Q.context.dataRef.current.__outsidePressBubbles
						) {
							re = !1;
							return;
						}
					}),
					!re)
				)
					return;
			}
			r(!1, P, "outside-press");
		}),
		M = oe((P) => {
			var E;
			const O = () => {
				var T;
				$(P), (T = Ce(P)) == null || T.removeEventListener(l, O);
			};
			(E = Ce(P)) == null || E.addEventListener(l, O);
		});
	g.useEffect(() => {
		if (!n || !i) return;
		(s.current.__escapeKeyBubbles = A), (s.current.__outsidePressBubbles = k);
		let P = -1;
		function E(L) {
			r(!1, L, "ancestor-scroll");
		}
		function O() {
			window.clearTimeout(P), (Y.current = !0);
		}
		function T() {
			P = window.setTimeout(
				() => {
					Y.current = !1;
				},
				Rt() ? 5 : 0,
			);
		}
		const I = ue(o.floating);
		c &&
			(I.addEventListener("keydown", N ? S : V, N),
			I.addEventListener("compositionstart", O),
			I.addEventListener("compositionend", T)),
			v && I.addEventListener(l, _ ? M : $, _);
		let C = [];
		return (
			p &&
				(G(o.domReference) && (C = ke(o.domReference)),
				G(o.floating) && (C = C.concat(ke(o.floating))),
				!G(o.reference) &&
					o.reference &&
					o.reference.contextElement &&
					(C = C.concat(ke(o.reference.contextElement)))),
			(C = C.filter((L) => {
				var H;
				return L !== ((H = I.defaultView) == null ? void 0 : H.visualViewport);
			})),
			C.forEach((L) => {
				L.addEventListener("scroll", E, { passive: !0 });
			}),
			() => {
				c &&
					(I.removeEventListener("keydown", N ? S : V, N),
					I.removeEventListener("compositionstart", O),
					I.removeEventListener("compositionend", T)),
					v && I.removeEventListener(l, _ ? M : $, _),
					C.forEach((L) => {
						L.removeEventListener("scroll", E);
					}),
					window.clearTimeout(P);
			}
		);
	}, [s, o, c, v, l, n, r, p, i, A, k, V, N, S, $, _, M]),
		g.useEffect(() => {
			b.current = !1;
		}, [v, l]);
	const y = g.useMemo(
			() => ({
				onKeyDown: V,
				...(f && {
					[fi[m]]: (P) => {
						r(!1, P.nativeEvent, "reference-press");
					},
					...(m !== "click" && {
						onClick(P) {
							r(!1, P.nativeEvent, "reference-press");
						},
					}),
				}),
			}),
			[V, r, f, m],
		),
		x = g.useMemo(
			() => ({
				onKeyDown: V,
				onMouseDown() {
					R.current = !0;
				},
				onMouseUp() {
					R.current = !0;
				},
				[di[l]]: () => {
					b.current = !0;
				},
			}),
			[V, l],
		);
	return g.useMemo(() => (i ? { reference: y, floating: x } : {}), [i, y, x]);
}
function mi(e) {
	const { open: t = !1, onOpenChange: n, elements: r } = e,
		o = tn(),
		s = g.useRef({}),
		[i] = g.useState(() => Jo()),
		c = It() != null,
		[a, l] = g.useState(r.reference),
		f = oe((u, h, d) => {
			(s.current.openEvent = u ? h : void 0),
				i.emit("openchange", { open: u, event: h, reason: d, nested: c }),
				n == null || n(u, h, d);
		}),
		m = g.useMemo(() => ({ setPositionReference: l }), []),
		p = g.useMemo(
			() => ({
				reference: a || r.reference || null,
				floating: r.floating || null,
				domReference: r.reference,
			}),
			[a, r.reference, r.floating],
		);
	return g.useMemo(
		() => ({
			dataRef: s,
			open: t,
			onOpenChange: f,
			elements: p,
			events: i,
			floatingId: o,
			refs: m,
		}),
		[t, f, p, i, o, m],
	);
}
function Li(e) {
	e === void 0 && (e = {});
	const { nodeId: t } = e,
		n = mi({
			...e,
			elements: { reference: null, floating: null, ...e.elements },
		}),
		r = e.rootContext || n,
		o = r.elements,
		[s, i] = g.useState(null),
		[c, a] = g.useState(null),
		f = (o == null ? void 0 : o.domReference) || s,
		m = g.useRef(null),
		p = tt();
	Z(() => {
		f && (m.current = f);
	}, [f]);
	const u = Vo({ ...e, elements: { ...o, ...(c && { reference: c }) } }),
		h = g.useCallback(
			(R) => {
				const A = G(R)
					? {
							getBoundingClientRect: () => R.getBoundingClientRect(),
							contextElement: R,
						}
					: R;
				a(A), u.refs.setReference(A);
			},
			[u.refs],
		),
		d = g.useCallback(
			(R) => {
				(G(R) || R === null) && ((m.current = R), i(R)),
					(G(u.refs.reference.current) ||
						u.refs.reference.current === null ||
						(R !== null && !G(R))) &&
						u.refs.setReference(R);
			},
			[u.refs],
		),
		w = g.useMemo(
			() => ({
				...u.refs,
				setReference: d,
				setPositionReference: h,
				domReference: m,
			}),
			[u.refs, d, h],
		),
		v = g.useMemo(() => ({ ...u.elements, domReference: f }), [u.elements, f]),
		b = g.useMemo(
			() => ({ ...u, ...r, refs: w, elements: v, nodeId: t }),
			[u, w, v, t, r],
		);
	return (
		Z(() => {
			r.dataRef.current.floatingContext = b;
			const R = p == null ? void 0 : p.nodesRef.current.find((A) => A.id === t);
			R && (R.context = b);
		}),
		g.useMemo(() => ({ ...u, context: b, refs: w, elements: v }), [u, w, v, b])
	);
}
function Fi(e, t) {
	t === void 0 && (t = {});
	const { open: n, onOpenChange: r, events: o, dataRef: s, elements: i } = e,
		{ enabled: c = !0, visibleOnly: a = !0 } = t,
		l = g.useRef(!1),
		f = g.useRef(),
		m = g.useRef(!0);
	g.useEffect(() => {
		if (!c) return;
		const u = ge(i.domReference);
		function h() {
			!n &&
				ne(i.domReference) &&
				i.domReference === ye(ue(i.domReference)) &&
				(l.current = !0);
		}
		function d() {
			m.current = !0;
		}
		return (
			u.addEventListener("blur", h),
			u.addEventListener("keydown", d, !0),
			() => {
				u.removeEventListener("blur", h),
					u.removeEventListener("keydown", d, !0);
			}
		);
	}, [i.domReference, n, c]),
		g.useEffect(() => {
			if (!c) return;
			function u(h) {
				const { reason: d } = h;
				(d === "reference-press" || d === "escape-key") && (l.current = !0);
			}
			return (
				o.on("openchange", u),
				() => {
					o.off("openchange", u);
				}
			);
		}, [o, c]),
		g.useEffect(
			() => () => {
				clearTimeout(f.current);
			},
			[],
		);
	const p = g.useMemo(
		() => ({
			onPointerDown(u) {
				Yt(u.nativeEvent) || (m.current = !1);
			},
			onMouseLeave() {
				l.current = !1;
			},
			onFocus(u) {
				if (l.current) return;
				const h = Ce(u.nativeEvent);
				if (a && G(h))
					try {
						if (qn() && Ir()) throw Error();
						if (!h.matches(":focus-visible")) return;
					} catch {
						if (!m.current && !Ut(h)) return;
					}
				r(!0, u.nativeEvent, "focus");
			},
			onBlur(u) {
				l.current = !1;
				const h = u.relatedTarget,
					d = u.nativeEvent,
					w =
						G(h) &&
						h.hasAttribute($e("focus-guard")) &&
						h.getAttribute("data-type") === "outside";
				f.current = window.setTimeout(() => {
					var v;
					const b = ye(
						i.domReference ? i.domReference.ownerDocument : document,
					);
					(!h && b === i.domReference) ||
						te(
							(v = s.current.floatingContext) == null
								? void 0
								: v.refs.floating.current,
							b,
						) ||
						te(i.domReference, b) ||
						w ||
						r(!1, d, "focus");
				});
			},
		}),
		[s, i.domReference, r, a],
	);
	return g.useMemo(() => (c ? { reference: p } : {}), [c, p]);
}
const Dn = "active",
	Nn = "selected";
function _t(e, t, n) {
	const r = new Map(),
		o = n === "item";
	let s = e;
	if (o && e) {
		const { [Dn]: i, [Nn]: c, ...a } = e;
		s = a;
	}
	return {
		...(n === "floating" && { tabIndex: -1, [Ht]: "" }),
		...s,
		...t
			.map((i) => {
				const c = i ? i[n] : null;
				return typeof c == "function" ? (e ? c(e) : null) : c;
			})
			.concat(e)
			.reduce(
				(i, c) => (
					c &&
						Object.entries(c).forEach((a) => {
							const [l, f] = a;
							if (!(o && [Dn, Nn].includes(l)))
								if (l.indexOf("on") === 0) {
									if ((r.has(l) || r.set(l, []), typeof f == "function")) {
										var m;
										(m = r.get(l)) == null || m.push(f),
											(i[l] = () => {
												for (
													var p, u = arguments.length, h = new Array(u), d = 0;
													d < u;
													d++
												)
													h[d] = arguments[d];
												return (p = r.get(l)) == null
													? void 0
													: p.map((w) => w(...h)).find((w) => w !== void 0);
											});
									}
								} else i[l] = f;
						}),
					i
				),
				{},
			),
	};
}
function Di(e) {
	e === void 0 && (e = []);
	const t = e.map((c) => (c == null ? void 0 : c.reference)),
		n = e.map((c) => (c == null ? void 0 : c.floating)),
		r = e.map((c) => (c == null ? void 0 : c.item)),
		o = g.useCallback((c) => _t(c, e, "reference"), t),
		s = g.useCallback((c) => _t(c, e, "floating"), n),
		i = g.useCallback((c) => _t(c, e, "item"), r);
	return g.useMemo(
		() => ({ getReferenceProps: o, getFloatingProps: s, getItemProps: i }),
		[o, s, i],
	);
}
function Pt(e, t, n) {
	switch (e) {
		case "vertical":
			return t;
		case "horizontal":
			return n;
		default:
			return t || n;
	}
}
function _n(e, t) {
	return Pt(t, e === en || e === et, e === Le || e === Fe);
}
function Bt(e, t, n) {
	return (
		Pt(t, e === et, n ? e === Le : e === Fe) ||
		e === "Enter" ||
		e === " " ||
		e === ""
	);
}
function gi(e, t, n) {
	return Pt(t, n ? e === Le : e === Fe, e === et);
}
function Bn(e, t, n) {
	return Pt(t, n ? e === Fe : e === Le, e === en);
}
function Ni(e, t) {
	const { open: n, onOpenChange: r, elements: o } = e,
		{
			listRef: s,
			activeIndex: i,
			onNavigate: c = () => {},
			enabled: a = !0,
			selectedIndex: l = null,
			allowEscape: f = !1,
			loop: m = !1,
			nested: p = !1,
			rtl: u = !1,
			virtual: h = !1,
			focusItemOnOpen: d = "auto",
			focusItemOnHover: w = !0,
			openOnArrowKeyDown: v = !0,
			disabledIndices: b = void 0,
			orientation: R = "vertical",
			cols: A = 1,
			scrollItemIntoView: k = !0,
			virtualItemRef: N,
			itemSizes: _,
			dense: Y = !1,
		} = t,
		V = qt(o.floating),
		S = he(V),
		$ = It(),
		M = tt(),
		y = oe(() => {
			c(E.current === -1 ? null : E.current);
		}),
		x = zn(o.domReference),
		P = g.useRef(d),
		E = g.useRef(l ?? -1),
		O = g.useRef(null),
		T = g.useRef(!0),
		I = g.useRef(y),
		C = g.useRef(!!o.floating),
		L = g.useRef(n),
		H = g.useRef(!1),
		ie = g.useRef(!1),
		se = he(b),
		ve = he(n),
		re = he(k),
		Q = he(l),
		[z, F] = g.useState(),
		[W, B] = g.useState(),
		j = oe(() => {
			function K(q) {
				h
					? (F(q.id),
						M == null || M.events.emit("virtualfocus", q),
						N && (N.current = q))
					: _e(q, { sync: H.current, preventScroll: !0 });
			}
			const X = s.current[E.current];
			X && K(X),
				(H.current ? (q) => q() : requestAnimationFrame)(() => {
					const q = s.current[E.current] || X;
					if (!q) return;
					X || K(q);
					const de = re.current;
					de &&
						ee &&
						(ie.current || !T.current) &&
						(q.scrollIntoView == null ||
							q.scrollIntoView(
								typeof de == "boolean"
									? { block: "nearest", inline: "nearest" }
									: de,
							));
				});
		});
	Z(() => {
		a &&
			(n && o.floating
				? P.current && l != null && ((ie.current = !0), (E.current = l), y())
				: C.current && ((E.current = -1), I.current()));
	}, [a, n, o.floating, l, y]),
		Z(() => {
			if (a && n && o.floating)
				if (i == null) {
					if (((H.current = !1), Q.current != null)) return;
					if (
						(C.current && ((E.current = -1), j()),
						(!L.current || !C.current) &&
							P.current &&
							(O.current != null || (P.current === !0 && O.current == null)))
					) {
						let K = 0;
						const X = () => {
							s.current[0] == null
								? (K < 2 && (K ? requestAnimationFrame : queueMicrotask)(X),
									K++)
								: ((E.current =
										O.current == null || Bt(O.current, R, u) || p
											? Lt(s, se.current)
											: yn(s, se.current)),
									(O.current = null),
									y());
						};
						X();
					}
				} else Ge(s, i) || ((E.current = i), j(), (ie.current = !1));
		}, [a, n, o.floating, i, Q, p, s, R, u, y, j, se]),
		Z(() => {
			var K;
			if (!a || o.floating || !M || h || !C.current) return;
			const X = M.nodesRef.current,
				D =
					(K = X.find((me) => me.id === $)) == null || (K = K.context) == null
						? void 0
						: K.elements.floating,
				q = ye(ue(o.floating)),
				de = X.some((me) => me.context && te(me.context.elements.floating, q));
			D && !de && T.current && D.focus({ preventScroll: !0 });
		}, [a, o.floating, M, $, h]),
		Z(() => {
			if (!a || !M || !h || $) return;
			function K(X) {
				B(X.id), N && (N.current = X);
			}
			return (
				M.events.on("virtualfocus", K),
				() => {
					M.events.off("virtualfocus", K);
				}
			);
		}, [a, M, h, $, N]),
		Z(() => {
			(I.current = y), (L.current = n), (C.current = !!o.floating);
		}),
		Z(() => {
			n || (O.current = null);
		}, [n]);
	const J = i != null,
		ee = g.useMemo(() => {
			function K(D) {
				if (!n) return;
				const q = s.current.indexOf(D);
				q !== -1 && E.current !== q && ((E.current = q), y());
			}
			return {
				onFocus(D) {
					const { currentTarget: q } = D;
					(H.current = !0), K(q);
				},
				onClick: (D) => {
					const { currentTarget: q } = D;
					return q.focus({ preventScroll: !0 });
				},
				...(w && {
					onMouseMove(D) {
						const { currentTarget: q } = D;
						(H.current = !0), (ie.current = !1), K(q);
					},
					onPointerLeave(D) {
						const { pointerType: q } = D;
						if (
							!(!T.current || q === "touch") &&
							((H.current = !0), (E.current = -1), y(), !h)
						) {
							var de;
							(de = S.current) == null || de.focus({ preventScroll: !0 });
						}
					},
				}),
			};
		}, [n, S, w, s, y, h]),
		U = oe((K) => {
			if (
				((T.current = !1),
				(H.current = !0),
				K.which === 229 || (!ve.current && K.currentTarget === S.current))
			)
				return;
			if (p && Bn(K.key, R, u)) {
				le(K),
					r(!1, K.nativeEvent, "list-navigation"),
					ne(o.domReference) &&
						(h
							? M == null || M.events.emit("virtualfocus", o.domReference)
							: o.domReference.focus());
				return;
			}
			const X = E.current,
				D = Lt(s, b),
				q = yn(s, b);
			if (
				(x ||
					(K.key === "Home" && (le(K), (E.current = D), y()),
					K.key === "End" && (le(K), (E.current = q), y())),
				A > 1)
			) {
				const de =
						_ ||
						Array.from({ length: s.current.length }, () => ({
							width: 1,
							height: 1,
						})),
					me = Ho(de, A, Y),
					je = me.findIndex((xe) => xe != null && !at(s.current, xe, b)),
					nt = me.reduce(
						(xe, Pe, rt) => (Pe != null && !at(s.current, Pe, b) ? rt : xe),
						-1,
					),
					Ne =
						me[
							jo(
								{
									current: me.map((xe) => (xe != null ? s.current[xe] : null)),
								},
								{
									event: K,
									orientation: R,
									loop: m,
									rtl: u,
									cols: A,
									disabledIndices: zo(
										[
											...(b ||
												s.current.map((xe, Pe) =>
													at(s.current, Pe) ? Pe : void 0,
												)),
											void 0,
										],
										me,
									),
									minIndex: je,
									maxIndex: nt,
									prevIndex: qo(
										E.current > q ? D : E.current,
										de,
										me,
										A,
										K.key === et ? "bl" : K.key === (u ? Le : Fe) ? "tr" : "tl",
									),
									stopEvent: !0,
								},
							)
						];
				if ((Ne != null && ((E.current = Ne), y()), R === "both")) return;
			}
			if (_n(K.key, R)) {
				if (
					(le(K),
					n && !h && ye(K.currentTarget.ownerDocument) === K.currentTarget)
				) {
					(E.current = Bt(K.key, R, u) ? D : q), y();
					return;
				}
				Bt(K.key, R, u)
					? m
						? (E.current =
								X >= q
									? f && X !== s.current.length
										? -1
										: D
									: fe(s, { startingIndex: X, disabledIndices: b }))
						: (E.current = Math.min(
								q,
								fe(s, { startingIndex: X, disabledIndices: b }),
							))
					: m
						? (E.current =
								X <= D
									? f && X !== -1
										? s.current.length
										: q
									: fe(s, {
											startingIndex: X,
											decrement: !0,
											disabledIndices: b,
										}))
						: (E.current = Math.max(
								D,
								fe(s, { startingIndex: X, decrement: !0, disabledIndices: b }),
							)),
					Ge(s, E.current) && (E.current = -1),
					y();
			}
		}),
		ae = g.useMemo(
			() => h && n && J && { "aria-activedescendant": W || z },
			[h, n, J, W, z],
		),
		ce = g.useMemo(
			() => ({
				"aria-orientation": R === "both" ? void 0 : R,
				...(x ? {} : ae),
				onKeyDown: U,
				onPointerMove() {
					T.current = !0;
				},
			}),
			[ae, U, R, x],
		),
		we = g.useMemo(() => {
			function K(D) {
				d === "auto" && Hn(D.nativeEvent) && (P.current = !0);
			}
			function X(D) {
				(P.current = d), d === "auto" && Yt(D.nativeEvent) && (P.current = !0);
			}
			return {
				...ae,
				onKeyDown(D) {
					T.current = !1;
					const q = D.key.startsWith("Arrow"),
						de = ["Home", "End"].includes(D.key),
						me = q || de,
						je = gi(D.key, R, u),
						nt = Bn(D.key, R, u),
						Ne = _n(D.key, R),
						xe = (p ? je : Ne) || D.key === "Enter" || D.key.trim() === "";
					if (h && n) {
						const rn =
								M == null
									? void 0
									: M.nodesRef.current.find((ot) => ot.parentId == null),
							Me = M && rn ? ti(M.nodesRef.current, rn.id) : null;
						if (me && Me && N) {
							const ot = new KeyboardEvent("keydown", {
								key: D.key,
								bubbles: !0,
							});
							if (je || nt) {
								var Pe, rt;
								const pr =
										((Pe = Me.context) == null
											? void 0
											: Pe.elements.domReference) === D.currentTarget,
									on =
										nt && !pr
											? (rt = Me.context) == null
												? void 0
												: rt.elements.domReference
											: je
												? s.current.find(
														(sn) => (sn == null ? void 0 : sn.id) === z,
													)
												: null;
								on && (le(D), on.dispatchEvent(ot), B(void 0));
							}
							if (
								(Ne || de) &&
								Me.context &&
								Me.context.open &&
								Me.parentId &&
								D.currentTarget !== Me.context.elements.domReference
							) {
								var nn;
								le(D),
									(nn = Me.context.elements.domReference) == null ||
										nn.dispatchEvent(ot);
								return;
							}
						}
						return U(D);
					}
					if (!(!n && !v && q)) {
						if ((xe && (O.current = p && Ne ? null : D.key), p)) {
							je &&
								(le(D),
								n
									? ((E.current = Lt(s, se.current)), y())
									: r(!0, D.nativeEvent, "list-navigation"));
							return;
						}
						Ne &&
							(l != null && (E.current = l),
							le(D),
							!n && v ? r(!0, D.nativeEvent, "list-navigation") : U(D),
							n && y());
					}
				},
				onFocus() {
					n && !h && ((E.current = -1), y());
				},
				onPointerDown: X,
				onPointerEnter: X,
				onMouseDown: K,
				onClick: K,
			};
		}, [z, ae, U, se, d, s, p, y, r, n, v, R, u, l, M, h, N]);
	return g.useMemo(
		() => (a ? { reference: we, floating: ce, item: ee } : {}),
		[a, we, ce, ee],
	);
}
const pi = new Map([
	["select", "listbox"],
	["combobox", "listbox"],
	["label", !1],
]);
function _i(e, t) {
	var n;
	t === void 0 && (t = {});
	const { open: r, floatingId: o } = e,
		{ enabled: s = !0, role: i = "dialog" } = t,
		c = (n = pi.get(i)) != null ? n : i,
		a = tn(),
		f = It() != null,
		m = g.useMemo(
			() =>
				c === "tooltip" || i === "label"
					? {
							["aria-" + (i === "label" ? "labelledby" : "describedby")]: r
								? o
								: void 0,
						}
					: {
							"aria-expanded": r ? "true" : "false",
							"aria-haspopup": c === "alertdialog" ? "dialog" : c,
							"aria-controls": r ? o : void 0,
							...(c === "listbox" && { role: "combobox" }),
							...(c === "menu" && { id: a }),
							...(c === "menu" && f && { role: "menuitem" }),
							...(i === "select" && { "aria-autocomplete": "none" }),
							...(i === "combobox" && { "aria-autocomplete": "list" }),
						},
			[c, o, f, r, a, i],
		),
		p = g.useMemo(() => {
			const h = { id: o, ...(c && { role: c }) };
			return c === "tooltip" || i === "label"
				? h
				: { ...h, ...(c === "menu" && { "aria-labelledby": a }) };
		}, [c, o, a, i]),
		u = g.useCallback(
			(h) => {
				const { active: d, selected: w } = h;
				const v = { role: "option", ...(d && { id: o + "-option" }) };
				switch (i) {
					case "select":
						return { ...v, "aria-selected": d && w };
					case "combobox":
						return { ...v, ...(d && { "aria-selected": !0 }) };
				}
				return {};
			},
			[o, i],
		);
	return g.useMemo(
		() => (s ? { reference: m, floating: p, item: u } : {}),
		[s, m, p, u],
	);
}
function Bi(e, t) {
	var n;
	const { open: r, dataRef: o } = e,
		{
			listRef: s,
			activeIndex: i,
			onMatch: c,
			onTypingChange: a,
			enabled: l = !0,
			findMatch: f = null,
			resetMs: m = 750,
			ignoreKeys: p = [],
			selectedIndex: u = null,
		} = t,
		h = g.useRef(),
		d = g.useRef(""),
		w = g.useRef((n = u ?? i) != null ? n : -1),
		v = g.useRef(null),
		b = oe(c),
		R = oe(a),
		A = he(f),
		k = he(p);
	Z(() => {
		r && (clearTimeout(h.current), (v.current = null), (d.current = ""));
	}, [r]),
		Z(() => {
			if (r && d.current === "") {
				var S;
				w.current = (S = u ?? i) != null ? S : -1;
			}
		}, [r, u, i]);
	const N = oe((S) => {
			S
				? o.current.typing || ((o.current.typing = S), R(S))
				: o.current.typing && ((o.current.typing = S), R(S));
		}),
		_ = oe((S) => {
			function $(E, O, T) {
				const I = A.current
					? A.current(O, T)
					: O.find(
							(C) =>
								(C == null
									? void 0
									: C.toLocaleLowerCase().indexOf(T.toLocaleLowerCase())) === 0,
						);
				return I ? E.indexOf(I) : -1;
			}
			const M = s.current;
			if (
				(d.current.length > 0 &&
					d.current[0] !== " " &&
					($(M, M, d.current) === -1 ? N(!1) : S.key === " " && le(S)),
				M == null ||
					k.current.includes(S.key) ||
					S.key.length !== 1 ||
					S.ctrlKey ||
					S.metaKey ||
					S.altKey)
			)
				return;
			r && S.key !== " " && (le(S), N(!0)),
				M.every((E) => {
					var O, T;
					return E
						? ((O = E[0]) == null ? void 0 : O.toLocaleLowerCase()) !==
								((T = E[1]) == null ? void 0 : T.toLocaleLowerCase())
						: !0;
				}) &&
					d.current === S.key &&
					((d.current = ""), (w.current = v.current)),
				(d.current += S.key),
				clearTimeout(h.current),
				(h.current = setTimeout(() => {
					(d.current = ""), (w.current = v.current), N(!1);
				}, m));
			const x = w.current,
				P = $(
					M,
					[...M.slice((x || 0) + 1), ...M.slice(0, (x || 0) + 1)],
					d.current,
				);
			P !== -1
				? (b(P), (v.current = P))
				: S.key !== " " && ((d.current = ""), N(!1));
		}),
		Y = g.useMemo(() => ({ onKeyDown: _ }), [_]),
		V = g.useMemo(
			() => ({
				onKeyDown: _,
				onKeyUp(S) {
					S.key === " " && N(!1);
				},
			}),
			[_, N],
		);
	return g.useMemo(() => (l ? { reference: Y, floating: V } : {}), [l, Y, V]);
}
function Vn(e, t) {
	const [n, r] = e;
	let o = !1;
	const s = t.length;
	for (let i = 0, c = s - 1; i < s; c = i++) {
		const [a, l] = t[i] || [0, 0],
			[f, m] = t[c] || [0, 0];
		l >= r != m >= r && n <= ((f - a) * (r - l)) / (m - l) + a && (o = !o);
	}
	return o;
}
function hi(e, t) {
	return (
		e[0] >= t.x &&
		e[0] <= t.x + t.width &&
		e[1] >= t.y &&
		e[1] <= t.y + t.height
	);
}
function Vi(e) {
	e === void 0 && (e = {});
	const {
		buffer: t = 0.5,
		blockPointerEvents: n = !1,
		requireIntent: r = !0,
	} = e;
	let o,
		s = !1,
		i = null,
		c = null,
		a = performance.now();
	function l(m, p) {
		const u = performance.now(),
			h = u - a;
		if (i === null || c === null || h === 0)
			return (i = m), (c = p), (a = u), null;
		const d = m - i,
			w = p - c,
			b = Math.sqrt(d * d + w * w) / h;
		return (i = m), (c = p), (a = u), b;
	}
	const f = (m) => {
		const {
			x: p,
			y: u,
			placement: h,
			elements: d,
			onClose: w,
			nodeId: v,
			tree: b,
		} = m;
		return (A) => {
			function k() {
				clearTimeout(o), w();
			}
			if (
				(clearTimeout(o),
				!d.domReference || !d.floating || h == null || p == null || u == null)
			)
				return;
			const { clientX: N, clientY: _ } = A,
				Y = [N, _],
				V = Ce(A),
				S = A.type === "mouseleave",
				$ = te(d.floating, V),
				M = te(d.domReference, V),
				y = d.domReference.getBoundingClientRect(),
				x = d.floating.getBoundingClientRect(),
				P = h.split("-")[0],
				E = p > x.right - x.width / 2,
				O = u > x.bottom - x.height / 2,
				T = hi(Y, y),
				I = x.width > y.width,
				C = x.height > y.height,
				L = (I ? y : x).left,
				H = (I ? y : x).right,
				ie = (C ? y : x).top,
				se = (C ? y : x).bottom;
			if ($ && ((s = !0), !S)) return;
			if ((M && (s = !1), M && !S)) {
				s = !0;
				return;
			}
			if (
				(S && G(A.relatedTarget) && te(d.floating, A.relatedTarget)) ||
				(b &&
					We(b.nodesRef.current, v).some((Q) => {
						const { context: z } = Q;
						return z == null ? void 0 : z.open;
					}))
			)
				return;
			if (
				(P === "top" && u >= y.bottom - 1) ||
				(P === "bottom" && u <= y.top + 1) ||
				(P === "left" && p >= y.right - 1) ||
				(P === "right" && p <= y.left + 1)
			)
				return k();
			let ve = [];
			switch (P) {
				case "top":
					ve = [
						[L, y.top + 1],
						[L, x.bottom - 1],
						[H, x.bottom - 1],
						[H, y.top + 1],
					];
					break;
				case "bottom":
					ve = [
						[L, x.top + 1],
						[L, y.bottom - 1],
						[H, y.bottom - 1],
						[H, x.top + 1],
					];
					break;
				case "left":
					ve = [
						[x.right - 1, se],
						[x.right - 1, ie],
						[y.left + 1, ie],
						[y.left + 1, se],
					];
					break;
				case "right":
					ve = [
						[y.right - 1, se],
						[y.right - 1, ie],
						[x.left + 1, ie],
						[x.left + 1, se],
					];
					break;
			}
			function re(Q) {
				const [z, F] = Q;
				switch (P) {
					case "top": {
						const W = [I ? z + t / 2 : E ? z + t * 4 : z - t * 4, F + t + 1],
							B = [I ? z - t / 2 : E ? z + t * 4 : z - t * 4, F + t + 1],
							j = [
								[x.left, E || I ? x.bottom - t : x.top],
								[x.right, E ? (I ? x.bottom - t : x.top) : x.bottom - t],
							];
						return [W, B, ...j];
					}
					case "bottom": {
						const W = [I ? z + t / 2 : E ? z + t * 4 : z - t * 4, F - t],
							B = [I ? z - t / 2 : E ? z + t * 4 : z - t * 4, F - t],
							j = [
								[x.left, E || I ? x.top + t : x.bottom],
								[x.right, E ? (I ? x.top + t : x.bottom) : x.top + t],
							];
						return [W, B, ...j];
					}
					case "left": {
						const W = [z + t + 1, C ? F + t / 2 : O ? F + t * 4 : F - t * 4],
							B = [z + t + 1, C ? F - t / 2 : O ? F + t * 4 : F - t * 4];
						return [
							...[
								[O || C ? x.right - t : x.left, x.top],
								[O ? (C ? x.right - t : x.left) : x.right - t, x.bottom],
							],
							W,
							B,
						];
					}
					case "right": {
						const W = [z - t, C ? F + t / 2 : O ? F + t * 4 : F - t * 4],
							B = [z - t, C ? F - t / 2 : O ? F + t * 4 : F - t * 4],
							j = [
								[O || C ? x.left + t : x.right, x.top],
								[O ? (C ? x.left + t : x.right) : x.left + t, x.bottom],
							];
						return [W, B, ...j];
					}
				}
			}
			if (!Vn([N, _], ve)) {
				if (s && !T) return k();
				if (!S && r) {
					const Q = l(A.clientX, A.clientY);
					if (Q !== null && Q < 0.1) return k();
				}
				Vn([N, _], re([p, u]))
					? !s && r && (o = window.setTimeout(k, 40))
					: k();
			}
		};
	};
	return (f.__options = { blockPointerEvents: n }), f;
}
export {
	Si as F,
	bn as a,
	Ai as b,
	ki as c,
	_i as d,
	Di as e,
	Mi as f,
	Pi as g,
	Ii as h,
	Ni as i,
	Bi as j,
	Ci as k,
	Fi as l,
	yi as m,
	Ei as n,
	wi as o,
	Ri as p,
	Ti as q,
	Oi as r,
	xi as s,
	Vi as t,
	Li as u,
};
