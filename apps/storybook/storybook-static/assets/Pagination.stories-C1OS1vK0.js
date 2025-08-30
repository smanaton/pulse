import { C as te } from "./chevron-left-icon-RFu8Vxl9.js";
import { C as ne } from "./chevron-right-icon-DzP0OM3K.js";
import {
	r as ae,
	u as D,
	g as h,
	a as M,
	t as m,
	c as se,
} from "./create-theme-ol-6nsx3.js";
import { j as a, r as f } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
function oe(t, s) {
	return t >= s ? [] : [...Array(s - t + 1).keys()].map((r) => r + t);
}
const R = se({
		base: "",
		layout: {
			table: {
				base: "text-sm text-gray-700 dark:text-gray-400",
				span: "font-semibold text-gray-900 dark:text-white",
			},
		},
		pages: {
			base: "xs:mt-0 mt-2 inline-flex items-center -space-x-px",
			showIcon: "inline-flex",
			previous: {
				base: "ml-0 rounded-l-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 enabled:hover:bg-gray-100 enabled:hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 enabled:dark:hover:bg-gray-700 enabled:dark:hover:text-white",
				icon: "h-5 w-5",
			},
			next: {
				base: "rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 enabled:hover:bg-gray-100 enabled:hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 enabled:dark:hover:bg-gray-700 enabled:dark:hover:text-white",
				icon: "h-5 w-5",
			},
			selector: {
				base: "w-12 border border-gray-300 bg-white py-2 leading-tight text-gray-500 enabled:hover:bg-gray-100 enabled:hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 enabled:dark:hover:bg-gray-700 enabled:dark:hover:text-white",
				active:
					"bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white",
				disabled: "cursor-not-allowed opacity-50",
			},
		},
	}),
	re = f.forwardRef(
		(
			{
				active: t,
				children: s,
				className: r,
				onClick: e,
				theme: P,
				clearTheme: n,
				applyTheme: p,
				...u
			},
			g,
		) => {
			var o;
			const i = D(),
				l = M(
					[R, (o = i.theme) == null ? void 0 : o.pagination, P],
					[h(i.clearTheme, "pagination"), n],
					[h(i.applyTheme, "pagination"), p],
				);
			return a.jsx("button", {
				ref: g,
				type: "button",
				className: m(t && l.pages.selector.active, r),
				onClick: e,
				...u,
				children: s,
			});
		},
	);
re.displayName = "PaginationButton";
function j({
	children: t,
	className: s,
	onClick: r,
	disabled: e = !1,
	theme: P,
	clearTheme: n,
	applyTheme: p,
	...u
}) {
	var l;
	const g = D(),
		i = M(
			[R, (l = g.theme) == null ? void 0 : l.pagination, P],
			[h(g.clearTheme, "pagination"), n],
			[h(g.applyTheme, "pagination"), p],
		);
	return a.jsx("button", {
		type: "button",
		className: m(e && i.pages.selector.disabled, s),
		disabled: e,
		onClick: r,
		...u,
		children: t,
	});
}
j.displayName = "PaginationNavigation";
const S = f.forwardRef((t, s) =>
		t.layout === "table"
			? a.jsx(ie, { ...t, ref: s })
			: a.jsx(ge, { ...t, ref: s }),
	),
	ge = f.forwardRef((t, s) => {
		var k, w;
		const r = D(),
			e = M(
				[R, (k = r.theme) == null ? void 0 : k.pagination, t.theme],
				[h(r.clearTheme, "pagination"), t.clearTheme],
				[h(r.applyTheme, "pagination"), t.applyTheme],
			),
			{
				className: P,
				currentPage: n,
				layout: p = "pagination",
				nextLabel: u = "Next",
				onPageChange: g,
				previousLabel: i = "Previous",
				renderPaginationButton: l = (c) => a.jsx(re, { ...c }),
				totalPages: o,
				showIcons: d = !1,
				...I
			} = ae(t, (w = r.props) == null ? void 0 : w.pagination);
		if (!Number.isInteger(n) || n < 1)
			throw new Error("Invalid props: currentPage must be a positive integer");
		if (!Number.isInteger(o) || o < 1)
			throw new Error("Invalid props: totalPages must be a positive integer");
		const N = Math.min(Math.max(p === "pagination" ? n + 2 : n + 4, 5), o),
			W = Math.max(1, N - 4);
		function L() {
			g(Math.min(n + 1, o));
		}
		function A() {
			g(Math.max(n - 1, 1));
		}
		return a.jsx("nav", {
			ref: s,
			className: m(e.base, P),
			...I,
			children: a.jsxs("ul", {
				className: e.pages.base,
				children: [
					a.jsx("li", {
						children: a.jsxs(j, {
							className: m(e.pages.previous.base, d && e.pages.showIcon),
							onClick: A,
							disabled: n === 1,
							children: [
								d &&
									a.jsx(te, {
										"aria-hidden": !0,
										className: e.pages.previous.icon,
									}),
								i,
							],
						}),
					}),
					p === "pagination" &&
						oe(W, N).map((c) =>
							a.jsx(
								"li",
								{
									"aria-current": c === n ? "page" : void 0,
									children: l({
										className: m(
											e.pages.selector.base,
											n === c && e.pages.selector.active,
										),
										active: c === n,
										onClick: () => g(c),
										children: c,
									}),
								},
								c,
							),
						),
					a.jsx("li", {
						children: a.jsxs(j, {
							className: m(e.pages.next.base, d && e.pages.showIcon),
							onClick: L,
							disabled: n === o,
							children: [
								u,
								d &&
									a.jsx(ne, {
										"aria-hidden": !0,
										className: e.pages.next.icon,
									}),
							],
						}),
					}),
				],
			}),
		});
	}),
	ie = f.forwardRef((t, s) => {
		var w, c;
		const r = D(),
			e = M(
				[R, (w = r.theme) == null ? void 0 : w.pagination, t.theme],
				[h(r.clearTheme, "pagination"), t.clearTheme],
				[h(r.applyTheme, "pagination"), t.applyTheme],
			),
			{
				className: P,
				currentPage: n,
				nextLabel: p = "Next",
				onPageChange: u,
				previousLabel: g = "Previous",
				showIcons: i = !1,
				itemsPerPage: l,
				totalItems: o,
				...d
			} = ae(t, (c = r.props) == null ? void 0 : c.pagination);
		if (!Number.isInteger(n) || n < 1)
			throw new Error("Invalid props: currentPage must be a positive integer");
		if (!Number.isInteger(l) || l < 1)
			throw new Error("Invalid props: itemsPerPage must be a positive integer");
		if (!Number.isInteger(o) || o < 0)
			throw new Error(
				"Invalid props: totalItems must be a non-negative integer",
			);
		const I = o > 0 ? Math.ceil(o / l) : 1,
			N = (n - 1) * l,
			W = o > 0 ? N + 1 : 0,
			L = n === I ? o : N + l;
		function A() {
			u(Math.min(n + 1, I));
		}
		function k() {
			u(Math.max(n - 1, 1));
		}
		return a.jsxs("nav", {
			ref: s,
			className: m(e.base, P),
			...d,
			children: [
				a.jsxs("div", {
					role: "status",
					"aria-live": "polite",
					"aria-label": "Table Pagination",
					className: e.layout.table.base,
					children: [
						"Showing ",
						a.jsx("span", { className: e.layout.table.span, children: W }),
						" to ",
						a.jsx("span", { className: e.layout.table.span, children: L }),
						" of ",
						a.jsx("span", { className: e.layout.table.span, children: o }),
						" Entries",
					],
				}),
				a.jsxs("ul", {
					className: e.pages.base,
					children: [
						a.jsx("li", {
							children: a.jsxs(j, {
								className: m(e.pages.previous.base, i && e.pages.showIcon),
								onClick: k,
								disabled: n === 1,
								children: [
									i &&
										a.jsx(te, {
											"aria-hidden": !0,
											className: e.pages.previous.icon,
										}),
									g,
								],
							}),
						}),
						a.jsx("li", {
							children: a.jsxs(j, {
								className: m(e.pages.next.base, i && e.pages.showIcon),
								onClick: A,
								disabled: n === I,
								children: [
									p,
									i &&
										a.jsx(ne, {
											"aria-hidden": !0,
											className: e.pages.next.icon,
										}),
								],
							}),
						}),
					],
				}),
			],
		});
	});
S.displayName = "Pagination";
const me = {
		title: "Components/Pagination",
		component: S,
		decorators: [
			(t) =>
				a.jsx("div", {
					className: "flex items-center justify-center text-center",
					children: a.jsx(t, {}),
				}),
		],
	},
	v = (t) => {
		const { currentPage: s = 1, layout: r = "pagination" } = t,
			[e, P] = f.useState(s),
			n = (g) => {
				P(g);
			};
		if (
			(f.useEffect(() => {
				P(s);
			}, [s]),
			r === "table")
		) {
			const { itemsPerPage: g = 10, totalItems: i = 100, ...l } = t;
			return a.jsx(S, {
				...l,
				currentPage: e,
				layout: r,
				onPageChange: n,
				itemsPerPage: g,
				totalItems: i,
			});
		}
		const { totalPages: p = 100, ...u } = t;
		return a.jsx(S, {
			...u,
			currentPage: e,
			layout: r,
			onPageChange: n,
			totalPages: p,
		});
	},
	E = v.bind({}),
	b = v.bind({});
b.storyName = "Pagination with icons";
b.args = { showIcons: !0 };
const C = v.bind({});
C.args = { layout: "navigation" };
const y = v.bind({});
y.storyName = "Nav with icons";
y.args = { layout: "navigation", showIcons: !0 };
const T = v.bind({});
T.args = { layout: "table", itemsPerPage: 10, totalItems: 100 };
const x = v.bind({});
x.storyName = "Table with icons";
x.args = { layout: "table", showIcons: !0, itemsPerPage: 10, totalItems: 100 };
var B, _, O;
E.parameters = {
	...E.parameters,
	docs: {
		...((B = E.parameters) == null ? void 0 : B.docs),
		source: {
			originalSource: `props => {
  const {
    currentPage = 1,
    layout = "pagination"
  } = props;
  const [page, setPage] = useState(currentPage);
  const onPageChange = (page: number) => {
    setPage(page);
  };
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  if (layout === "table") {
    const {
      itemsPerPage = 10,
      totalItems = 100,
      ...rest
    } = props as TablePaginationProps;
    return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} />;
  }
  const {
    totalPages = 100,
    ...rest
  } = props as DefaultPaginationProps;
  return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} totalPages={totalPages} />;
}`,
			...((O = (_ = E.parameters) == null ? void 0 : _.docs) == null
				? void 0
				: O.source),
		},
	},
};
var q, z, F;
b.parameters = {
	...b.parameters,
	docs: {
		...((q = b.parameters) == null ? void 0 : q.docs),
		source: {
			originalSource: `props => {
  const {
    currentPage = 1,
    layout = "pagination"
  } = props;
  const [page, setPage] = useState(currentPage);
  const onPageChange = (page: number) => {
    setPage(page);
  };
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  if (layout === "table") {
    const {
      itemsPerPage = 10,
      totalItems = 100,
      ...rest
    } = props as TablePaginationProps;
    return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} />;
  }
  const {
    totalPages = 100,
    ...rest
  } = props as DefaultPaginationProps;
  return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} totalPages={totalPages} />;
}`,
			...((F = (z = b.parameters) == null ? void 0 : z.docs) == null
				? void 0
				: F.source),
		},
	},
};
var G, H, J;
C.parameters = {
	...C.parameters,
	docs: {
		...((G = C.parameters) == null ? void 0 : G.docs),
		source: {
			originalSource: `props => {
  const {
    currentPage = 1,
    layout = "pagination"
  } = props;
  const [page, setPage] = useState(currentPage);
  const onPageChange = (page: number) => {
    setPage(page);
  };
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  if (layout === "table") {
    const {
      itemsPerPage = 10,
      totalItems = 100,
      ...rest
    } = props as TablePaginationProps;
    return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} />;
  }
  const {
    totalPages = 100,
    ...rest
  } = props as DefaultPaginationProps;
  return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} totalPages={totalPages} />;
}`,
			...((J = (H = C.parameters) == null ? void 0 : H.docs) == null
				? void 0
				: J.source),
		},
	},
};
var K, Q, U;
y.parameters = {
	...y.parameters,
	docs: {
		...((K = y.parameters) == null ? void 0 : K.docs),
		source: {
			originalSource: `props => {
  const {
    currentPage = 1,
    layout = "pagination"
  } = props;
  const [page, setPage] = useState(currentPage);
  const onPageChange = (page: number) => {
    setPage(page);
  };
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  if (layout === "table") {
    const {
      itemsPerPage = 10,
      totalItems = 100,
      ...rest
    } = props as TablePaginationProps;
    return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} />;
  }
  const {
    totalPages = 100,
    ...rest
  } = props as DefaultPaginationProps;
  return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} totalPages={totalPages} />;
}`,
			...((U = (Q = y.parameters) == null ? void 0 : Q.docs) == null
				? void 0
				: U.source),
		},
	},
};
var V, X, Y;
T.parameters = {
	...T.parameters,
	docs: {
		...((V = T.parameters) == null ? void 0 : V.docs),
		source: {
			originalSource: `props => {
  const {
    currentPage = 1,
    layout = "pagination"
  } = props;
  const [page, setPage] = useState(currentPage);
  const onPageChange = (page: number) => {
    setPage(page);
  };
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  if (layout === "table") {
    const {
      itemsPerPage = 10,
      totalItems = 100,
      ...rest
    } = props as TablePaginationProps;
    return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} />;
  }
  const {
    totalPages = 100,
    ...rest
  } = props as DefaultPaginationProps;
  return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} totalPages={totalPages} />;
}`,
			...((Y = (X = T.parameters) == null ? void 0 : X.docs) == null
				? void 0
				: Y.source),
		},
	},
};
var Z, $, ee;
x.parameters = {
	...x.parameters,
	docs: {
		...((Z = x.parameters) == null ? void 0 : Z.docs),
		source: {
			originalSource: `props => {
  const {
    currentPage = 1,
    layout = "pagination"
  } = props;
  const [page, setPage] = useState(currentPage);
  const onPageChange = (page: number) => {
    setPage(page);
  };
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  if (layout === "table") {
    const {
      itemsPerPage = 10,
      totalItems = 100,
      ...rest
    } = props as TablePaginationProps;
    return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} />;
  }
  const {
    totalPages = 100,
    ...rest
  } = props as DefaultPaginationProps;
  return <Pagination {...rest} currentPage={page} layout={layout} onPageChange={onPageChange} totalPages={totalPages} />;
}`,
			...((ee = ($ = x.parameters) == null ? void 0 : $.docs) == null
				? void 0
				: ee.source),
		},
	},
};
const he = [
	"Default",
	"PaginationWithIcons",
	"Nav",
	"NavWithIcons",
	"Table",
	"TableWithIcons",
];
export {
	E as Default,
	C as Nav,
	y as NavWithIcons,
	b as PaginationWithIcons,
	T as Table,
	x as TableWithIcons,
	he as __namedExportsOrder,
	me as default,
};
