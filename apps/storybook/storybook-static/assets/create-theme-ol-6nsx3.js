import { r as D, j as Ye } from "./iframe-ByD-PdrA.js";
function st(e, r) {
	const o = r.split(".");
	let t = e;
	for (const n of o) {
		if (typeof t == "boolean" || typeof t == "string") return t;
		if (t == null || typeof t != "object") return;
		t = t[n];
	}
	return t;
}
function Je(e) {
	const { theme: r, clearTheme: o, applyTheme: t, ...n } = e;
	return n;
}
function it(e, r) {
	let o = Je(e);
	return r && (o = { ...r, ...e }), o;
}
const C = {
	defaultMerge: Symbol("deepmerge-ts: default merge"),
	skip: Symbol("deepmerge-ts: skip"),
};
C.defaultMerge;
function Te(e, r) {
	return r;
}
function Xe(e, r) {
	return e.filter((o) => o !== void 0);
}
var Me;
((e) => {
	(e[(e.NOT = 0)] = "NOT"),
		(e[(e.RECORD = 1)] = "RECORD"),
		(e[(e.ARRAY = 2)] = "ARRAY"),
		(e[(e.SET = 3)] = "SET"),
		(e[(e.MAP = 4)] = "MAP"),
		(e[(e.OTHER = 5)] = "OTHER");
})(Me || (Me = {}));
function ke(e) {
	return typeof e != "object" || e === null
		? 0
		: Array.isArray(e)
			? 2
			: Le(e)
				? 1
				: e instanceof Set
					? 3
					: e instanceof Map
						? 4
						: 5;
}
function Qe(e) {
	const r = new Set();
	for (const o of e)
		for (const t of [...Object.keys(o), ...Object.getOwnPropertySymbols(o)])
			r.add(t);
	return r;
}
function Ze(e, r) {
	return (
		typeof e == "object" && Object.prototype.propertyIsEnumerable.call(e, r)
	);
}
function Oe(e) {
	var t;
	let r = 0,
		o = (t = e[0]) == null ? void 0 : t[Symbol.iterator]();
	return {
		[Symbol.iterator]() {
			return {
				next() {
					var n;
					do {
						if (o === void 0) return { done: !0, value: void 0 };
						const i = o.next();
						if (i.done === !0) {
							(r += 1),
								(o = (n = e[r]) == null ? void 0 : n[Symbol.iterator]());
							continue;
						}
						return { done: !1, value: i.value };
					} while (!0);
				},
			};
		},
	};
}
const Se = ["[object Object]", "[object Module]"];
function Le(e) {
	if (!Se.includes(Object.prototype.toString.call(e))) return !1;
	const { constructor: r } = e;
	if (r === void 0) return !0;
	const o = r.prototype;
	return !(
		o === null ||
		typeof o != "object" ||
		!Se.includes(Object.prototype.toString.call(o)) ||
		!Object.hasOwn(o, "isPrototypeOf")
	);
}
function er(e, r, o) {
	const t = {};
	for (const n of Qe(e)) {
		const i = [];
		for (const a of e) Ze(a, n) && i.push(a[n]);
		if (i.length === 0) continue;
		const s = r.metaDataUpdater(o, { key: n, parents: e }),
			d = Fe(i, r, s);
		d !== C.skip &&
			(n === "__proto__"
				? Object.defineProperty(t, n, {
						value: d,
						configurable: !0,
						enumerable: !0,
						writable: !0,
					})
				: (t[n] = d));
	}
	return t;
}
function rr(e) {
	return e.flat();
}
function tr(e) {
	return new Set(Oe(e));
}
function or(e) {
	return new Map(Oe(e));
}
function nr(e) {
	return e.at(-1);
}
const X = {
	mergeRecords: er,
	mergeArrays: rr,
	mergeSets: tr,
	mergeMaps: or,
	mergeOthers: nr,
};
function ee(...e) {
	return je({})(...e);
}
function je(e, r) {
	const o = sr(e, t);
	function t(...n) {
		return Fe(n, o, r);
	}
	return t;
}
function sr(e, r) {
	return {
		defaultMergeFunctions: X,
		mergeFunctions: {
			...X,
			...Object.fromEntries(
				Object.entries(e)
					.filter(([o, t]) => Object.hasOwn(X, o))
					.map(([o, t]) => (t === !1 ? [o, X.mergeOthers] : [o, t])),
			),
		},
		metaDataUpdater: e.metaDataUpdater ?? Te,
		deepmerge: r,
		useImplicitDefaultMerging: e.enableImplicitDefaultMerging ?? !1,
		filterValues: e.filterValues === !1 ? void 0 : (e.filterValues ?? Xe),
		actions: C,
	};
}
function Fe(e, r, o) {
	var i;
	const t = ((i = r.filterValues) == null ? void 0 : i.call(r, e, o)) ?? e;
	if (t.length === 0) return;
	if (t.length === 1) return le(t, r, o);
	const n = ke(t[0]);
	if (n !== 0 && n !== 5) {
		for (let s = 1; s < t.length; s++) if (ke(t[s]) !== n) return le(t, r, o);
	}
	switch (n) {
		case 1:
			return ir(t, r, o);
		case 2:
			return lr(t, r, o);
		case 3:
			return cr(t, r, o);
		case 4:
			return ar(t, r, o);
		default:
			return le(t, r, o);
	}
}
function ir(e, r, o) {
	const t = r.mergeFunctions.mergeRecords(e, r, o);
	return t === C.defaultMerge ||
		(r.useImplicitDefaultMerging &&
			t === void 0 &&
			r.mergeFunctions.mergeRecords !== r.defaultMergeFunctions.mergeRecords)
		? r.defaultMergeFunctions.mergeRecords(e, r, o)
		: t;
}
function lr(e, r, o) {
	const t = r.mergeFunctions.mergeArrays(e, r, o);
	return t === C.defaultMerge ||
		(r.useImplicitDefaultMerging &&
			t === void 0 &&
			r.mergeFunctions.mergeArrays !== r.defaultMergeFunctions.mergeArrays)
		? r.defaultMergeFunctions.mergeArrays(e)
		: t;
}
function cr(e, r, o) {
	const t = r.mergeFunctions.mergeSets(e, r, o);
	return t === C.defaultMerge ||
		(r.useImplicitDefaultMerging &&
			t === void 0 &&
			r.mergeFunctions.mergeSets !== r.defaultMergeFunctions.mergeSets)
		? r.defaultMergeFunctions.mergeSets(e)
		: t;
}
function ar(e, r, o) {
	const t = r.mergeFunctions.mergeMaps(e, r, o);
	return t === C.defaultMerge ||
		(r.useImplicitDefaultMerging &&
			t === void 0 &&
			r.mergeFunctions.mergeMaps !== r.defaultMergeFunctions.mergeMaps)
		? r.defaultMergeFunctions.mergeMaps(e)
		: t;
}
function le(e, r, o) {
	const t = r.mergeFunctions.mergeOthers(e, r, o);
	return t === C.defaultMerge ||
		(r.useImplicitDefaultMerging &&
			t === void 0 &&
			r.mergeFunctions.mergeOthers !== r.defaultMergeFunctions.mergeOthers)
		? r.defaultMergeFunctions.mergeOthers(e)
		: t;
}
function re(e) {
	var r, o, t;
	if (Array.isArray(e)) {
		for (o = Array((r = e.length)); r--; )
			o[r] = (t = e[r]) && typeof t == "object" ? re(t) : t;
		return o;
	}
	if (Object.prototype.toString.call(e) === "[object Object]") {
		o = {};
		for (r in e)
			r === "__proto__"
				? Object.defineProperty(o, r, {
						value: re(e[r]),
						configurable: !0,
						enumerable: !0,
						writable: !0,
					})
				: (o[r] = (t = e[r]) && typeof t == "object" ? re(t) : t);
		return o;
	}
	return e;
}
const te = { dark: void 0, mode: void 0, prefix: void 0, version: void 0 };
function dr() {
	return te.dark;
}
function lt() {
	return te.mode;
}
function Pe() {
	return te.prefix;
}
function Ee() {
	return te.version;
}
function Ve(e) {
	return je({
		mergeOthers: (r, o) => {
			if (r.some((t) => typeof t == "string")) {
				const t = r.filter((s) => typeof s == "string"),
					n = new Set(),
					i = [];
				for (const s of t) {
					const d = [...new Set(s.split(/\s+/))];
					i.push(d.filter((a) => !n.has(a)).join(" "));
					for (const a of d) n.add(a);
				}
				return e(i);
			}
			return o.actions.defaultMerge;
		},
	});
}
function ae(e, r) {
	if (e === r) return !0;
	if (e && r && typeof e == "object" && typeof r == "object") {
		if (e.constructor !== r.constructor) return !1;
		if (Array.isArray(e))
			return e.length !== r.length ? !1 : e.every((t, n) => ae(t, r[n]));
		if (e.constructor === RegExp)
			return e.source === r.source && e.flags === r.flags;
		if (e.valueOf !== Object.prototype.valueOf)
			return e.valueOf() === r.valueOf();
		if (e.toString !== Object.prototype.toString)
			return e.toString() === r.toString();
		const o = Object.keys(e);
		return o.length !== Object.keys(r).length
			? !1
			: o.every((t) => Object.hasOwn(r, t) && ae(e[t], r[t]));
	}
	return e !== e && r !== r;
}
const me = "-",
	ur = (e) => {
		const r = pr(e),
			{ conflictingClassGroups: o, conflictingClassGroupModifiers: t } = e;
		return {
			getClassGroupId: (s) => {
				const d = s.split(me);
				return d[0] === "" && d.length !== 1 && d.shift(), Ne(d, r) || fr(s);
			},
			getConflictingClassGroupIds: (s, d) => {
				const a = o[s] || [];
				return d && t[s] ? [...a, ...t[s]] : a;
			},
		};
	},
	Ne = (e, r) => {
		var s;
		if (e.length === 0) return r.classGroupId;
		const o = e[0],
			t = r.nextPart.get(o),
			n = t ? Ne(e.slice(1), t) : void 0;
		if (n) return n;
		if (r.validators.length === 0) return;
		const i = e.join(me);
		return (s = r.validators.find(({ validator: d }) => d(i))) == null
			? void 0
			: s.classGroupId;
	},
	Ae = /^\[(.+)\]$/,
	fr = (e) => {
		if (Ae.test(e)) {
			const r = Ae.exec(e)[1],
				o = r == null ? void 0 : r.substring(0, r.indexOf(":"));
			if (o) return "arbitrary.." + o;
		}
	},
	pr = (e) => {
		const { theme: r, classGroups: o } = e,
			t = { nextPart: new Map(), validators: [] };
		for (const n in o) de(o[n], t, n, r);
		return t;
	},
	de = (e, r, o, t) => {
		e.forEach((n) => {
			if (typeof n == "string") {
				const i = n === "" ? r : Re(r, n);
				i.classGroupId = o;
				return;
			}
			if (typeof n == "function") {
				if (gr(n)) {
					de(n(t), r, o, t);
					return;
				}
				r.validators.push({ validator: n, classGroupId: o });
				return;
			}
			Object.entries(n).forEach(([i, s]) => {
				de(s, Re(r, i), o, t);
			});
		});
	},
	Re = (e, r) => {
		let o = e;
		return (
			r.split(me).forEach((t) => {
				o.nextPart.has(t) ||
					o.nextPart.set(t, { nextPart: new Map(), validators: [] }),
					(o = o.nextPart.get(t));
			}),
			o
		);
	},
	gr = (e) => e.isThemeGetter,
	mr = (e) => {
		if (e < 1) return { get: () => {}, set: () => {} };
		let r = 0,
			o = new Map(),
			t = new Map();
		const n = (i, s) => {
			o.set(i, s), r++, r > e && ((r = 0), (t = o), (o = new Map()));
		};
		return {
			get(i) {
				let s = o.get(i);
				if (s !== void 0) return s;
				if ((s = t.get(i)) !== void 0) return n(i, s), s;
			},
			set(i, s) {
				o.has(i) ? o.set(i, s) : n(i, s);
			},
		};
	},
	ue = "!",
	fe = ":",
	br = fe.length,
	hr = (e) => {
		const { prefix: r, experimentalParseClassName: o } = e;
		let t = (n) => {
			const i = [];
			let s = 0,
				d = 0,
				a = 0,
				m;
			for (let b = 0; b < n.length; b++) {
				const S = n[b];
				if (s === 0 && d === 0) {
					if (S === fe) {
						i.push(n.slice(a, b)), (a = b + br);
						continue;
					}
					if (S === "/") {
						m = b;
						continue;
					}
				}
				S === "[" ? s++ : S === "]" ? s-- : S === "(" ? d++ : S === ")" && d--;
			}
			const g = i.length === 0 ? n : n.substring(a),
				M = yr(g),
				y = M !== g,
				k = m && m > a ? m - a : void 0;
			return {
				modifiers: i,
				hasImportantModifier: y,
				baseClassName: M,
				maybePostfixModifierPosition: k,
			};
		};
		if (r) {
			const n = r + fe,
				i = t;
			t = (s) =>
				s.startsWith(n)
					? i(s.substring(n.length))
					: {
							isExternal: !0,
							modifiers: [],
							hasImportantModifier: !1,
							baseClassName: s,
							maybePostfixModifierPosition: void 0,
						};
		}
		if (o) {
			const n = t;
			t = (i) => o({ className: i, parseClassName: n });
		}
		return t;
	},
	yr = (e) =>
		e.endsWith(ue)
			? e.substring(0, e.length - 1)
			: e.startsWith(ue)
				? e.substring(1)
				: e,
	wr = (e) => {
		const r = Object.fromEntries(e.orderSensitiveModifiers.map((t) => [t, !0]));
		return (t) => {
			if (t.length <= 1) return t;
			const n = [];
			let i = [];
			return (
				t.forEach((s) => {
					s[0] === "[" || r[s] ? (n.push(...i.sort(), s), (i = [])) : i.push(s);
				}),
				n.push(...i.sort()),
				n
			);
		};
	},
	xr = (e) => ({
		cache: mr(e.cacheSize),
		parseClassName: hr(e),
		sortModifiers: wr(e),
		...ur(e),
	}),
	vr = /\s+/,
	Mr = (e, r) => {
		const {
				parseClassName: o,
				getClassGroupId: t,
				getConflictingClassGroupIds: n,
				sortModifiers: i,
			} = r,
			s = [],
			d = e.trim().split(vr);
		let a = "";
		for (let m = d.length - 1; m >= 0; m -= 1) {
			const g = d[m],
				{
					isExternal: M,
					modifiers: y,
					hasImportantModifier: k,
					baseClassName: b,
					maybePostfixModifierPosition: S,
				} = o(g);
			if (M) {
				a = g + (a.length > 0 ? " " + a : a);
				continue;
			}
			let F = !!S,
				G = t(F ? b.substring(0, S) : b);
			if (!G) {
				if (!F) {
					a = g + (a.length > 0 ? " " + a : a);
					continue;
				}
				if (((G = t(b)), !G)) {
					a = g + (a.length > 0 ? " " + a : a);
					continue;
				}
				F = !1;
			}
			const U = i(y).join(":"),
				B = k ? U + ue : U,
				P = B + G;
			if (s.includes(P)) continue;
			s.push(P);
			const E = n(G, F);
			for (let x = 0; x < E.length; ++x) {
				const q = E[x];
				s.push(B + q);
			}
			a = g + (a.length > 0 ? " " + a : a);
		}
		return a;
	};
function kr() {
	let e = 0,
		r,
		o,
		t = "";
	for (; e < arguments.length; )
		(r = arguments[e++]) && (o = De(r)) && (t && (t += " "), (t += o));
	return t;
}
const De = (e) => {
	if (typeof e == "string") return e;
	let r,
		o = "";
	for (let t = 0; t < e.length; t++)
		e[t] && (r = De(e[t])) && (o && (o += " "), (o += r));
	return o;
};
function ze(e, ...r) {
	let o,
		t,
		n,
		i = s;
	function s(a) {
		const m = r.reduce((g, M) => M(g), e());
		return (o = xr(m)), (t = o.cache.get), (n = o.cache.set), (i = d), d(a);
	}
	function d(a) {
		const m = t(a);
		if (m) return m;
		const g = Mr(a, o);
		return n(a, g), g;
	}
	return () => i(kr.apply(null, arguments));
}
const h = (e) => {
		const r = (o) => o[e] || [];
		return (r.isThemeGetter = !0), r;
	},
	$e = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
	_e = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
	Sr = /^\d+\/\d+$/,
	Ar = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
	Rr =
		/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
	zr = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,
	Cr = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
	Gr =
		/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
	N = (e) => Sr.test(e),
	u = (e) => !!e && !Number.isNaN(Number(e)),
	O = (e) => !!e && Number.isInteger(Number(e)),
	Ce = (e) => e.endsWith("%") && u(e.slice(0, -1)),
	z = (e) => Ar.test(e),
	Ir = () => !0,
	Or = (e) => Rr.test(e) && !zr.test(e),
	be = () => !1,
	jr = (e) => Cr.test(e),
	Fr = (e) => Gr.test(e),
	Pr = (e) => !l(e) && !c(e),
	Er = (e) => $(e, We, be),
	l = (e) => $e.test(e),
	j = (e) => $(e, qe, Or),
	ce = (e) => $(e, Kr, u),
	Vr = (e) => $(e, Ue, be),
	Nr = (e) => $(e, Be, Fr),
	Dr = (e) => $(e, be, jr),
	c = (e) => _e.test(e),
	Q = (e) => _(e, qe),
	$r = (e) => _(e, Yr),
	_r = (e) => _(e, Ue),
	Ur = (e) => _(e, We),
	Br = (e) => _(e, Be),
	Wr = (e) => _(e, Jr, !0),
	$ = (e, r, o) => {
		const t = $e.exec(e);
		return t ? (t[1] ? r(t[1]) : o(t[2])) : !1;
	},
	_ = (e, r, o = !1) => {
		const t = _e.exec(e);
		return t ? (t[1] ? r(t[1]) : o) : !1;
	},
	Ue = (e) => e === "position",
	qr = new Set(["image", "url"]),
	Be = (e) => qr.has(e),
	Hr = new Set(["length", "size", "percentage"]),
	We = (e) => Hr.has(e),
	qe = (e) => e === "length",
	Kr = (e) => e === "number",
	Yr = (e) => e === "family-name",
	Jr = (e) => e === "shadow",
	Ge = () => {
		const e = h("color"),
			r = h("font"),
			o = h("text"),
			t = h("font-weight"),
			n = h("tracking"),
			i = h("leading"),
			s = h("breakpoint"),
			d = h("container"),
			a = h("spacing"),
			m = h("radius"),
			g = h("shadow"),
			M = h("inset-shadow"),
			y = h("drop-shadow"),
			k = h("blur"),
			b = h("perspective"),
			S = h("aspect"),
			F = h("ease"),
			G = h("animate"),
			U = () => [
				"auto",
				"avoid",
				"all",
				"avoid-page",
				"page",
				"left",
				"right",
				"column",
			],
			B = () => [
				"bottom",
				"center",
				"left",
				"left-bottom",
				"left-top",
				"right",
				"right-bottom",
				"right-top",
				"top",
			],
			P = () => ["auto", "hidden", "clip", "visible", "scroll"],
			E = () => ["auto", "contain", "none"],
			x = () => [N, "px", "full", "auto", c, l, a],
			q = () => [O, "none", "subgrid", c, l],
			he = () => ["auto", { span: ["full", O, c, l] }, c, l],
			H = () => [O, "auto", c, l],
			ye = () => ["auto", "min", "max", "fr", c, l],
			oe = () => [c, l, a],
			ne = () => [
				"start",
				"end",
				"center",
				"between",
				"around",
				"evenly",
				"stretch",
				"baseline",
			],
			V = () => ["start", "end", "center", "stretch"],
			f = () => [c, l, a],
			A = () => ["px", ...f()],
			R = () => ["px", "auto", ...f()],
			I = () => [
				N,
				"auto",
				"px",
				"full",
				"dvw",
				"dvh",
				"lvw",
				"lvh",
				"svw",
				"svh",
				"min",
				"max",
				"fit",
				c,
				l,
				a,
			],
			p = () => [e, c, l],
			se = () => [Ce, j],
			w = () => ["", "none", "full", m, c, l],
			v = () => ["", u, Q, j],
			K = () => ["solid", "dashed", "dotted", "double"],
			we = () => [
				"normal",
				"multiply",
				"screen",
				"overlay",
				"darken",
				"lighten",
				"color-dodge",
				"color-burn",
				"hard-light",
				"soft-light",
				"difference",
				"exclusion",
				"hue",
				"saturation",
				"color",
				"luminosity",
			],
			xe = () => ["", "none", k, c, l],
			ve = () => [
				"center",
				"top",
				"top-right",
				"right",
				"bottom-right",
				"bottom",
				"bottom-left",
				"left",
				"top-left",
				c,
				l,
			],
			Y = () => ["none", u, c, l],
			J = () => ["none", u, c, l],
			ie = () => [u, c, l],
			T = () => [N, "full", "px", c, l, a];
		return {
			cacheSize: 500,
			theme: {
				animate: ["spin", "ping", "pulse", "bounce"],
				aspect: ["video"],
				blur: [z],
				breakpoint: [z],
				color: [Ir],
				container: [z],
				"drop-shadow": [z],
				ease: ["in", "out", "in-out"],
				font: [Pr],
				"font-weight": [
					"thin",
					"extralight",
					"light",
					"normal",
					"medium",
					"semibold",
					"bold",
					"extrabold",
					"black",
				],
				"inset-shadow": [z],
				leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
				perspective: [
					"dramatic",
					"near",
					"normal",
					"midrange",
					"distant",
					"none",
				],
				radius: [z],
				shadow: [z],
				spacing: [u],
				text: [z],
				tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
			},
			classGroups: {
				aspect: [{ aspect: ["auto", "square", N, l, c, S] }],
				container: ["container"],
				columns: [{ columns: [u, l, c, d] }],
				"break-after": [{ "break-after": U() }],
				"break-before": [{ "break-before": U() }],
				"break-inside": [
					{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] },
				],
				"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
				box: [{ box: ["border", "content"] }],
				display: [
					"block",
					"inline-block",
					"inline",
					"flex",
					"inline-flex",
					"table",
					"inline-table",
					"table-caption",
					"table-cell",
					"table-column",
					"table-column-group",
					"table-footer-group",
					"table-header-group",
					"table-row-group",
					"table-row",
					"flow-root",
					"grid",
					"inline-grid",
					"contents",
					"list-item",
					"hidden",
				],
				sr: ["sr-only", "not-sr-only"],
				float: [{ float: ["right", "left", "none", "start", "end"] }],
				clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
				isolation: ["isolate", "isolation-auto"],
				"object-fit": [
					{ object: ["contain", "cover", "fill", "none", "scale-down"] },
				],
				"object-position": [{ object: [...B(), l, c] }],
				overflow: [{ overflow: P() }],
				"overflow-x": [{ "overflow-x": P() }],
				"overflow-y": [{ "overflow-y": P() }],
				overscroll: [{ overscroll: E() }],
				"overscroll-x": [{ "overscroll-x": E() }],
				"overscroll-y": [{ "overscroll-y": E() }],
				position: ["static", "fixed", "absolute", "relative", "sticky"],
				inset: [{ inset: x() }],
				"inset-x": [{ "inset-x": x() }],
				"inset-y": [{ "inset-y": x() }],
				start: [{ start: x() }],
				end: [{ end: x() }],
				top: [{ top: x() }],
				right: [{ right: x() }],
				bottom: [{ bottom: x() }],
				left: [{ left: x() }],
				visibility: ["visible", "invisible", "collapse"],
				z: [{ z: [O, "auto", c, l] }],
				basis: [{ basis: [N, "full", "auto", c, l, d, a] }],
				"flex-direction": [
					{ flex: ["row", "row-reverse", "col", "col-reverse"] },
				],
				"flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }],
				flex: [{ flex: [u, N, "auto", "initial", "none", l] }],
				grow: [{ grow: ["", u, c, l] }],
				shrink: [{ shrink: ["", u, c, l] }],
				order: [{ order: [O, "first", "last", "none", c, l] }],
				"grid-cols": [{ "grid-cols": q() }],
				"col-start-end": [{ col: he() }],
				"col-start": [{ "col-start": H() }],
				"col-end": [{ "col-end": H() }],
				"grid-rows": [{ "grid-rows": q() }],
				"row-start-end": [{ row: he() }],
				"row-start": [{ "row-start": H() }],
				"row-end": [{ "row-end": H() }],
				"grid-flow": [
					{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] },
				],
				"auto-cols": [{ "auto-cols": ye() }],
				"auto-rows": [{ "auto-rows": ye() }],
				gap: [{ gap: oe() }],
				"gap-x": [{ "gap-x": oe() }],
				"gap-y": [{ "gap-y": oe() }],
				"justify-content": [{ justify: [...ne(), "normal"] }],
				"justify-items": [{ "justify-items": [...V(), "normal"] }],
				"justify-self": [{ "justify-self": ["auto", ...V()] }],
				"align-content": [{ content: ["normal", ...ne()] }],
				"align-items": [{ items: [...V(), "baseline"] }],
				"align-self": [{ self: ["auto", ...V(), "baseline"] }],
				"place-content": [{ "place-content": ne() }],
				"place-items": [{ "place-items": [...V(), "baseline"] }],
				"place-self": [{ "place-self": ["auto", ...V()] }],
				p: [{ p: A() }],
				px: [{ px: A() }],
				py: [{ py: A() }],
				ps: [{ ps: A() }],
				pe: [{ pe: A() }],
				pt: [{ pt: A() }],
				pr: [{ pr: A() }],
				pb: [{ pb: A() }],
				pl: [{ pl: A() }],
				m: [{ m: R() }],
				mx: [{ mx: R() }],
				my: [{ my: R() }],
				ms: [{ ms: R() }],
				me: [{ me: R() }],
				mt: [{ mt: R() }],
				mr: [{ mr: R() }],
				mb: [{ mb: R() }],
				ml: [{ ml: R() }],
				"space-x": [{ "space-x": f() }],
				"space-x-reverse": ["space-x-reverse"],
				"space-y": [{ "space-y": f() }],
				"space-y-reverse": ["space-y-reverse"],
				size: [{ size: I() }],
				w: [{ w: [d, "screen", ...I()] }],
				"min-w": [{ "min-w": [d, "screen", "none", ...I()] }],
				"max-w": [
					{ "max-w": [d, "screen", "none", "prose", { screen: [s] }, ...I()] },
				],
				h: [{ h: ["screen", ...I()] }],
				"min-h": [{ "min-h": ["screen", "none", ...I()] }],
				"max-h": [{ "max-h": ["screen", ...I()] }],
				"font-size": [{ text: ["base", o, Q, j] }],
				"font-smoothing": ["antialiased", "subpixel-antialiased"],
				"font-style": ["italic", "not-italic"],
				"font-weight": [{ font: [t, c, ce] }],
				"font-stretch": [
					{
						"font-stretch": [
							"ultra-condensed",
							"extra-condensed",
							"condensed",
							"semi-condensed",
							"normal",
							"semi-expanded",
							"expanded",
							"extra-expanded",
							"ultra-expanded",
							Ce,
							l,
						],
					},
				],
				"font-family": [{ font: [$r, l, r] }],
				"fvn-normal": ["normal-nums"],
				"fvn-ordinal": ["ordinal"],
				"fvn-slashed-zero": ["slashed-zero"],
				"fvn-figure": ["lining-nums", "oldstyle-nums"],
				"fvn-spacing": ["proportional-nums", "tabular-nums"],
				"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
				tracking: [{ tracking: [n, c, l] }],
				"line-clamp": [{ "line-clamp": [u, "none", c, ce] }],
				leading: [{ leading: [c, l, i, a] }],
				"list-image": [{ "list-image": ["none", c, l] }],
				"list-style-position": [{ list: ["inside", "outside"] }],
				"list-style-type": [{ list: ["disc", "decimal", "none", c, l] }],
				"text-alignment": [
					{ text: ["left", "center", "right", "justify", "start", "end"] },
				],
				"placeholder-color": [{ placeholder: p() }],
				"text-color": [{ text: p() }],
				"text-decoration": [
					"underline",
					"overline",
					"line-through",
					"no-underline",
				],
				"text-decoration-style": [{ decoration: [...K(), "wavy"] }],
				"text-decoration-thickness": [
					{ decoration: [u, "from-font", "auto", c, j] },
				],
				"text-decoration-color": [{ decoration: p() }],
				"underline-offset": [{ "underline-offset": [u, "auto", c, l] }],
				"text-transform": [
					"uppercase",
					"lowercase",
					"capitalize",
					"normal-case",
				],
				"text-overflow": ["truncate", "text-ellipsis", "text-clip"],
				"text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
				indent: [{ indent: ["px", ...f()] }],
				"vertical-align": [
					{
						align: [
							"baseline",
							"top",
							"middle",
							"bottom",
							"text-top",
							"text-bottom",
							"sub",
							"super",
							c,
							l,
						],
					},
				],
				whitespace: [
					{
						whitespace: [
							"normal",
							"nowrap",
							"pre",
							"pre-line",
							"pre-wrap",
							"break-spaces",
						],
					},
				],
				break: [{ break: ["normal", "words", "all", "keep"] }],
				hyphens: [{ hyphens: ["none", "manual", "auto"] }],
				content: [{ content: ["none", c, l] }],
				"bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
				"bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
				"bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
				"bg-position": [{ bg: [...B(), _r, Vr] }],
				"bg-repeat": [
					{ bg: ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }] },
				],
				"bg-size": [{ bg: ["auto", "cover", "contain", Ur, Er] }],
				"bg-image": [
					{
						bg: [
							"none",
							{
								linear: [
									{ to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] },
									O,
									c,
									l,
								],
								radial: ["", c, l],
								conic: [O, c, l],
							},
							Br,
							Nr,
						],
					},
				],
				"bg-color": [{ bg: p() }],
				"gradient-from-pos": [{ from: se() }],
				"gradient-via-pos": [{ via: se() }],
				"gradient-to-pos": [{ to: se() }],
				"gradient-from": [{ from: p() }],
				"gradient-via": [{ via: p() }],
				"gradient-to": [{ to: p() }],
				rounded: [{ rounded: w() }],
				"rounded-s": [{ "rounded-s": w() }],
				"rounded-e": [{ "rounded-e": w() }],
				"rounded-t": [{ "rounded-t": w() }],
				"rounded-r": [{ "rounded-r": w() }],
				"rounded-b": [{ "rounded-b": w() }],
				"rounded-l": [{ "rounded-l": w() }],
				"rounded-ss": [{ "rounded-ss": w() }],
				"rounded-se": [{ "rounded-se": w() }],
				"rounded-ee": [{ "rounded-ee": w() }],
				"rounded-es": [{ "rounded-es": w() }],
				"rounded-tl": [{ "rounded-tl": w() }],
				"rounded-tr": [{ "rounded-tr": w() }],
				"rounded-br": [{ "rounded-br": w() }],
				"rounded-bl": [{ "rounded-bl": w() }],
				"border-w": [{ border: v() }],
				"border-w-x": [{ "border-x": v() }],
				"border-w-y": [{ "border-y": v() }],
				"border-w-s": [{ "border-s": v() }],
				"border-w-e": [{ "border-e": v() }],
				"border-w-t": [{ "border-t": v() }],
				"border-w-r": [{ "border-r": v() }],
				"border-w-b": [{ "border-b": v() }],
				"border-w-l": [{ "border-l": v() }],
				"divide-x": [{ "divide-x": v() }],
				"divide-x-reverse": ["divide-x-reverse"],
				"divide-y": [{ "divide-y": v() }],
				"divide-y-reverse": ["divide-y-reverse"],
				"border-style": [{ border: [...K(), "hidden", "none"] }],
				"divide-style": [{ divide: [...K(), "hidden", "none"] }],
				"border-color": [{ border: p() }],
				"border-color-x": [{ "border-x": p() }],
				"border-color-y": [{ "border-y": p() }],
				"border-color-s": [{ "border-s": p() }],
				"border-color-e": [{ "border-e": p() }],
				"border-color-t": [{ "border-t": p() }],
				"border-color-r": [{ "border-r": p() }],
				"border-color-b": [{ "border-b": p() }],
				"border-color-l": [{ "border-l": p() }],
				"divide-color": [{ divide: p() }],
				"outline-style": [{ outline: [...K(), "none", "hidden"] }],
				"outline-offset": [{ "outline-offset": [u, c, l] }],
				"outline-w": [{ outline: ["", u, Q, j] }],
				"outline-color": [{ outline: [e] }],
				shadow: [{ shadow: ["", "none", g, Wr, Dr] }],
				"shadow-color": [{ shadow: p() }],
				"inset-shadow": [{ "inset-shadow": ["none", c, l, M] }],
				"inset-shadow-color": [{ "inset-shadow": p() }],
				"ring-w": [{ ring: v() }],
				"ring-w-inset": ["ring-inset"],
				"ring-color": [{ ring: p() }],
				"ring-offset-w": [{ "ring-offset": [u, j] }],
				"ring-offset-color": [{ "ring-offset": p() }],
				"inset-ring-w": [{ "inset-ring": v() }],
				"inset-ring-color": [{ "inset-ring": p() }],
				opacity: [{ opacity: [u, c, l] }],
				"mix-blend": [
					{ "mix-blend": [...we(), "plus-darker", "plus-lighter"] },
				],
				"bg-blend": [{ "bg-blend": we() }],
				filter: [{ filter: ["", "none", c, l] }],
				blur: [{ blur: xe() }],
				brightness: [{ brightness: [u, c, l] }],
				contrast: [{ contrast: [u, c, l] }],
				"drop-shadow": [{ "drop-shadow": ["", "none", y, c, l] }],
				grayscale: [{ grayscale: ["", u, c, l] }],
				"hue-rotate": [{ "hue-rotate": [u, c, l] }],
				invert: [{ invert: ["", u, c, l] }],
				saturate: [{ saturate: [u, c, l] }],
				sepia: [{ sepia: ["", u, c, l] }],
				"backdrop-filter": [{ "backdrop-filter": ["", "none", c, l] }],
				"backdrop-blur": [{ "backdrop-blur": xe() }],
				"backdrop-brightness": [{ "backdrop-brightness": [u, c, l] }],
				"backdrop-contrast": [{ "backdrop-contrast": [u, c, l] }],
				"backdrop-grayscale": [{ "backdrop-grayscale": ["", u, c, l] }],
				"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [u, c, l] }],
				"backdrop-invert": [{ "backdrop-invert": ["", u, c, l] }],
				"backdrop-opacity": [{ "backdrop-opacity": [u, c, l] }],
				"backdrop-saturate": [{ "backdrop-saturate": [u, c, l] }],
				"backdrop-sepia": [{ "backdrop-sepia": ["", u, c, l] }],
				"border-collapse": [{ border: ["collapse", "separate"] }],
				"border-spacing": [{ "border-spacing": f() }],
				"border-spacing-x": [{ "border-spacing-x": f() }],
				"border-spacing-y": [{ "border-spacing-y": f() }],
				"table-layout": [{ table: ["auto", "fixed"] }],
				caption: [{ caption: ["top", "bottom"] }],
				transition: [
					{
						transition: [
							"",
							"all",
							"colors",
							"opacity",
							"shadow",
							"transform",
							"none",
							c,
							l,
						],
					},
				],
				"transition-behavior": [{ transition: ["normal", "discrete"] }],
				duration: [{ duration: [u, "initial", c, l] }],
				ease: [{ ease: ["linear", "initial", F, c, l] }],
				delay: [{ delay: [u, c, l] }],
				animate: [{ animate: ["none", G, c, l] }],
				backface: [{ backface: ["hidden", "visible"] }],
				perspective: [{ perspective: [b, c, l] }],
				"perspective-origin": [{ "perspective-origin": ve() }],
				rotate: [{ rotate: Y() }],
				"rotate-x": [{ "rotate-x": Y() }],
				"rotate-y": [{ "rotate-y": Y() }],
				"rotate-z": [{ "rotate-z": Y() }],
				scale: [{ scale: J() }],
				"scale-x": [{ "scale-x": J() }],
				"scale-y": [{ "scale-y": J() }],
				"scale-z": [{ "scale-z": J() }],
				"scale-3d": ["scale-3d"],
				skew: [{ skew: ie() }],
				"skew-x": [{ "skew-x": ie() }],
				"skew-y": [{ "skew-y": ie() }],
				transform: [{ transform: [c, l, "", "none", "gpu", "cpu"] }],
				"transform-origin": [{ origin: ve() }],
				"transform-style": [{ transform: ["3d", "flat"] }],
				translate: [{ translate: T() }],
				"translate-x": [{ "translate-x": T() }],
				"translate-y": [{ "translate-y": T() }],
				"translate-z": [{ "translate-z": T() }],
				"translate-none": ["translate-none"],
				accent: [{ accent: p() }],
				appearance: [{ appearance: ["none", "auto"] }],
				"caret-color": [{ caret: p() }],
				"color-scheme": [
					{
						scheme: [
							"normal",
							"dark",
							"light",
							"light-dark",
							"only-dark",
							"only-light",
						],
					},
				],
				cursor: [
					{
						cursor: [
							"auto",
							"default",
							"pointer",
							"wait",
							"text",
							"move",
							"help",
							"not-allowed",
							"none",
							"context-menu",
							"progress",
							"cell",
							"crosshair",
							"vertical-text",
							"alias",
							"copy",
							"no-drop",
							"grab",
							"grabbing",
							"all-scroll",
							"col-resize",
							"row-resize",
							"n-resize",
							"e-resize",
							"s-resize",
							"w-resize",
							"ne-resize",
							"nw-resize",
							"se-resize",
							"sw-resize",
							"ew-resize",
							"ns-resize",
							"nesw-resize",
							"nwse-resize",
							"zoom-in",
							"zoom-out",
							c,
							l,
						],
					},
				],
				"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
				"pointer-events": [{ "pointer-events": ["auto", "none"] }],
				resize: [{ resize: ["none", "", "y", "x"] }],
				"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
				"scroll-m": [{ "scroll-m": f() }],
				"scroll-mx": [{ "scroll-mx": f() }],
				"scroll-my": [{ "scroll-my": f() }],
				"scroll-ms": [{ "scroll-ms": f() }],
				"scroll-me": [{ "scroll-me": f() }],
				"scroll-mt": [{ "scroll-mt": f() }],
				"scroll-mr": [{ "scroll-mr": f() }],
				"scroll-mb": [{ "scroll-mb": f() }],
				"scroll-ml": [{ "scroll-ml": f() }],
				"scroll-p": [{ "scroll-p": f() }],
				"scroll-px": [{ "scroll-px": f() }],
				"scroll-py": [{ "scroll-py": f() }],
				"scroll-ps": [{ "scroll-ps": f() }],
				"scroll-pe": [{ "scroll-pe": f() }],
				"scroll-pt": [{ "scroll-pt": f() }],
				"scroll-pr": [{ "scroll-pr": f() }],
				"scroll-pb": [{ "scroll-pb": f() }],
				"scroll-pl": [{ "scroll-pl": f() }],
				"snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
				"snap-stop": [{ snap: ["normal", "always"] }],
				"snap-type": [{ snap: ["none", "x", "y", "both"] }],
				"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
				touch: [{ touch: ["auto", "none", "manipulation"] }],
				"touch-x": [{ "touch-pan": ["x", "left", "right"] }],
				"touch-y": [{ "touch-pan": ["y", "up", "down"] }],
				"touch-pz": ["touch-pinch-zoom"],
				select: [{ select: ["none", "text", "all", "auto"] }],
				"will-change": [
					{ "will-change": ["auto", "scroll", "contents", "transform", c, l] },
				],
				fill: [{ fill: ["none", ...p()] }],
				"stroke-w": [{ stroke: [u, Q, j, ce] }],
				stroke: [{ stroke: ["none", ...p()] }],
				"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
			},
			conflictingClassGroups: {
				overflow: ["overflow-x", "overflow-y"],
				overscroll: ["overscroll-x", "overscroll-y"],
				inset: [
					"inset-x",
					"inset-y",
					"start",
					"end",
					"top",
					"right",
					"bottom",
					"left",
				],
				"inset-x": ["right", "left"],
				"inset-y": ["top", "bottom"],
				flex: ["basis", "grow", "shrink"],
				gap: ["gap-x", "gap-y"],
				p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
				px: ["pr", "pl"],
				py: ["pt", "pb"],
				m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
				mx: ["mr", "ml"],
				my: ["mt", "mb"],
				size: ["w", "h"],
				"font-size": ["leading"],
				"fvn-normal": [
					"fvn-ordinal",
					"fvn-slashed-zero",
					"fvn-figure",
					"fvn-spacing",
					"fvn-fraction",
				],
				"fvn-ordinal": ["fvn-normal"],
				"fvn-slashed-zero": ["fvn-normal"],
				"fvn-figure": ["fvn-normal"],
				"fvn-spacing": ["fvn-normal"],
				"fvn-fraction": ["fvn-normal"],
				"line-clamp": ["display", "overflow"],
				rounded: [
					"rounded-s",
					"rounded-e",
					"rounded-t",
					"rounded-r",
					"rounded-b",
					"rounded-l",
					"rounded-ss",
					"rounded-se",
					"rounded-ee",
					"rounded-es",
					"rounded-tl",
					"rounded-tr",
					"rounded-br",
					"rounded-bl",
				],
				"rounded-s": ["rounded-ss", "rounded-es"],
				"rounded-e": ["rounded-se", "rounded-ee"],
				"rounded-t": ["rounded-tl", "rounded-tr"],
				"rounded-r": ["rounded-tr", "rounded-br"],
				"rounded-b": ["rounded-br", "rounded-bl"],
				"rounded-l": ["rounded-tl", "rounded-bl"],
				"border-spacing": ["border-spacing-x", "border-spacing-y"],
				"border-w": [
					"border-w-s",
					"border-w-e",
					"border-w-t",
					"border-w-r",
					"border-w-b",
					"border-w-l",
				],
				"border-w-x": ["border-w-r", "border-w-l"],
				"border-w-y": ["border-w-t", "border-w-b"],
				"border-color": [
					"border-color-s",
					"border-color-e",
					"border-color-t",
					"border-color-r",
					"border-color-b",
					"border-color-l",
				],
				"border-color-x": ["border-color-r", "border-color-l"],
				"border-color-y": ["border-color-t", "border-color-b"],
				translate: ["translate-x", "translate-y", "translate-none"],
				"translate-none": [
					"translate",
					"translate-x",
					"translate-y",
					"translate-z",
				],
				"scroll-m": [
					"scroll-mx",
					"scroll-my",
					"scroll-ms",
					"scroll-me",
					"scroll-mt",
					"scroll-mr",
					"scroll-mb",
					"scroll-ml",
				],
				"scroll-mx": ["scroll-mr", "scroll-ml"],
				"scroll-my": ["scroll-mt", "scroll-mb"],
				"scroll-p": [
					"scroll-px",
					"scroll-py",
					"scroll-ps",
					"scroll-pe",
					"scroll-pt",
					"scroll-pr",
					"scroll-pb",
					"scroll-pl",
				],
				"scroll-px": ["scroll-pr", "scroll-pl"],
				"scroll-py": ["scroll-pt", "scroll-pb"],
				touch: ["touch-x", "touch-y", "touch-pz"],
				"touch-x": ["touch"],
				"touch-y": ["touch"],
				"touch-pz": ["touch"],
			},
			conflictingClassGroupModifiers: { "font-size": ["leading"] },
			orderSensitiveModifiers: [
				"before",
				"after",
				"placeholder",
				"file",
				"marker",
				"selection",
				"first-line",
				"first-letter",
				"backdrop",
				"*",
				"**",
			],
		};
	},
	Tr = (
		e,
		{
			cacheSize: r,
			prefix: o,
			experimentalParseClassName: t,
			extend: n = {},
			override: i = {},
		},
	) => (
		W(e, "cacheSize", r),
		W(e, "prefix", o),
		W(e, "experimentalParseClassName", t),
		Z(e.theme, i.theme),
		Z(e.classGroups, i.classGroups),
		Z(e.conflictingClassGroups, i.conflictingClassGroups),
		Z(e.conflictingClassGroupModifiers, i.conflictingClassGroupModifiers),
		W(e, "orderSensitiveModifiers", i.orderSensitiveModifiers),
		L(e.theme, n.theme),
		L(e.classGroups, n.classGroups),
		L(e.conflictingClassGroups, n.conflictingClassGroups),
		L(e.conflictingClassGroupModifiers, n.conflictingClassGroupModifiers),
		He(e, n, "orderSensitiveModifiers"),
		e
	),
	W = (e, r, o) => {
		o !== void 0 && (e[r] = o);
	},
	Z = (e, r) => {
		if (r) for (const o in r) W(e, o, r[o]);
	},
	L = (e, r) => {
		if (r) for (const o in r) He(e, r, o);
	},
	He = (e, r, o) => {
		const t = r[o];
		t !== void 0 && (e[o] = e[o] ? e[o].concat(t) : t);
	},
	Xr = (e, ...r) =>
		typeof e == "function" ? ze(Ge, e, ...r) : ze(() => Tr(Ge(), e), ...r),
	Ie = new Map();
function Ke(...e) {
	const r = Pe(),
		o = Ee(),
		t = `${r}.${o}`,
		n = Ie.get(t);
	if (n) return n(...e);
	const i = Xr({
		extend: {
			classGroups: {
				"bg-image": [
					"bg-arrow-down-icon",
					"bg-check-icon",
					"bg-dash-icon",
					"bg-dot-icon",
				],
				shadow: ["shadow-sm-light"],
			},
		},
		prefix: r,
	});
	return Ie.set(t, i), i(...e);
}
function ct(...e) {
	return Qr(() => Zr(...e), e);
}
function Qr(e, r) {
	const o = D.useRef(),
		t = D.useRef();
	return (
		(!o.current || !ae(o.current, r)) && ((o.current = r), (t.current = e())),
		t.current
	);
}
function Zr([e, ...r], o, t) {
	const n = dr(),
		i = Pe(),
		s = Ee(),
		d =
			r != null && r.length
				? r == null
					? void 0
					: r.filter((y) => y !== void 0)
				: void 0,
		a =
			o != null && o.length
				? o == null
					? void 0
					: o.filter((y) => y !== void 0)
				: void 0,
		m =
			t != null && t.length
				? t == null
					? void 0
					: t.filter((y) => y !== void 0)
				: void 0,
		g = (a != null && a.length) || n === !1 || s === 4 || i ? re(e) : e;
	if (a != null && a.length) {
		const y = pe(g, !1);
		let k = !1;
		for (const b of a) b && (k = !0), Lr(y, b);
		k && rt(g, y);
	}
	let M = g;
	if (
		(d != null && d.length && (M = Ve(Ke)(g, ...d)),
		m != null && m.length && d != null && d.length)
	) {
		const y = pe(g, "merge");
		let k = !1;
		for (const b of m) b !== "merge" && (k = !0), et(y, b);
		k && tt(M, ee(g, ...r), y);
	}
	return M;
}
function Lr(e, r) {
	function o(t, n) {
		if (typeof n == "boolean")
			if (typeof t == "object" && t !== null)
				for (const i in t) t[i] = o(t[i], n);
			else return n;
		if (typeof n == "object" && n !== null)
			for (const i in n) t[i] = o(t[i], n[i]);
		return t;
	}
	o(e, r);
}
function et(e, r) {
	function o(t, n) {
		if (typeof n == "string")
			if (typeof t == "object" && t !== null)
				for (const i in t) t[i] = o(t[i], n);
			else return n;
		if (typeof n == "object" && n !== null)
			for (const i in n) t[i] = o(t[i], n[i]);
		return t;
	}
	o(e, r);
}
function rt(e, r) {
	function o(t, n) {
		if (n === !0)
			if (typeof t == "object" && t !== null)
				for (const i in t) t[i] = o(t[i], n);
			else return "";
		if (typeof n == "object" && n !== null)
			for (const i in n) t[i] = o(t[i], n[i]);
		return t;
	}
	o(e, r);
}
function tt(e, r, o) {
	function t(n, i, s) {
		if (s === "replace")
			if (typeof n == "object" && n !== null)
				for (const d in n) n[d] = t(n[d], i[d], s);
			else return i;
		if (typeof s == "object" && s !== null)
			for (const d in s) n[d] = t(n[d], i[d], s[d]);
		return n;
	}
	t(e, r, o);
}
function pe(e, r) {
	if (e === null || typeof e != "object") return r;
	const o = {};
	for (const t in e) o[t] = pe(e[t], r);
	return o;
}
const ge = D.createContext(void 0);
function ot({
	children: e,
	root: r,
	props: o,
	theme: t,
	clearTheme: n,
	applyTheme: i,
}) {
	const s = D.useContext(ge),
		d = D.useMemo(
			() => ({
				props:
					!r && s != null && s.props ? ee(s == null ? void 0 : s.props, o) : o,
				theme: !r && s != null && s.theme ? Ve(Ke)(s.theme, t) : t,
				clearTheme: !r && s != null && s.clearTheme ? ee(s.clearTheme, n) : n,
				applyTheme:
					!r && s != null && s.applyTheme
						? ee(s == null ? void 0 : s.applyTheme, i)
						: i,
			}),
			[
				r,
				o,
				t,
				n,
				i,
				s == null ? void 0 : s.props,
				s == null ? void 0 : s.theme,
				s == null ? void 0 : s.clearTheme,
				s == null ? void 0 : s.applyTheme,
			],
		);
	return Ye.jsx(ge.Provider, { value: d, children: e });
}
ot.displayName = "ThemeProvider";
function at() {
	return D.useContext(ge) ?? {};
}
function dt(e) {
	return e;
}
export {
	ot as T,
	ct as a,
	lt as b,
	dt as c,
	st as g,
	it as r,
	Ke as t,
	at as u,
};
