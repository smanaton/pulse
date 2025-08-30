import {
	m as b,
	r as c,
	e as d,
	t as g,
	d as h,
	q as i,
	s as l,
	c as m,
	n,
	o,
	b as p,
	u as r,
	p as u,
} from "./floating-ui.react-Dgys7JzL.js";
const f = ({ arrowRef: e, placement: t }) => {
		const s = [];
		return (
			s.push(o(8)),
			s.push(t === "auto" ? n() : u()),
			s.push(l({ padding: 8 })),
			e != null && e.current && s.push(i({ element: e.current })),
			s
		);
	},
	P = ({ placement: e }) => (e === "auto" ? void 0 : e),
	C = ({ placement: e }) =>
		({ top: "bottom", right: "left", bottom: "top", left: "right" })[
			e.split("-")[0]
		],
	F = ({ open: e, arrowRef: t, placement: s = "top", setOpen: a }) =>
		r({
			placement: P({ placement: s }),
			open: e,
			onOpenChange: a,
			whileElementsMounted: b,
			middleware: f({ placement: s, arrowRef: t }),
		}),
	k = ({ context: e, trigger: t, role: s = "tooltip", interactions: a = [] }) =>
		d([
			p(e, { enabled: t === "click" }),
			c(e, { enabled: t === "hover", handleClose: g() }),
			m(e),
			h(e, { role: s }),
			...a,
		]);
export { k as a, C as g, F as u };
