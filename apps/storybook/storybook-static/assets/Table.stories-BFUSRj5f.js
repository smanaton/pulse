import {
	c as D,
	a as f,
	t as g,
	r as j,
	g as r,
	u as w,
} from "./create-theme-ol-6nsx3.js";
import { j as e, r as m } from "./iframe-ByD-PdrA.js";
import "./preload-helper-Dp1pzeXC.js";
const M = m.createContext(void 0);
function H() {
	const a = m.useContext(M);
	if (!a)
		throw new Error(
			"useTableContext should be used within the TableContext provider!",
		);
	return a;
}
const N = D({
		root: {
			base: "w-full text-left text-sm text-gray-500 dark:text-gray-400",
			shadow:
				"absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md dark:bg-black",
			wrapper: "relative",
		},
		body: {
			base: "group/body",
			cell: {
				base: "px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
			},
		},
		head: {
			base: "group/head text-xs uppercase text-gray-700 dark:text-gray-400",
			cell: {
				base: "bg-gray-50 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
			},
		},
		row: {
			base: "group/row",
			hovered: "hover:bg-gray-50 dark:hover:bg-gray-600",
			striped:
				"odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700",
		},
	}),
	E = m.forwardRef((a, i) => {
		var n, d;
		const t = w(),
			c = f(
				[N, (n = t.theme) == null ? void 0 : n.table, a.theme],
				[r(t.clearTheme, "table"), a.clearTheme],
				[r(t.applyTheme, "table"), a.applyTheme],
			),
			{
				className: h,
				striped: s,
				hoverable: T,
				...o
			} = j(a, (d = t.props) == null ? void 0 : d.table);
		return e.jsx("div", {
			"data-testid": "table-element",
			className: g(c.root.wrapper),
			children: e.jsxs(M.Provider, {
				value: {
					theme: a.theme,
					clearTheme: a.clearTheme,
					applyTheme: a.applyTheme,
					striped: s,
					hoverable: T,
				},
				children: [
					e.jsx("div", { className: g(c.root.shadow, h) }),
					e.jsx("table", { ref: i, className: g(c.root.base, h), ...o }),
				],
			}),
		});
	});
E.displayName = "Table";
const W = m.createContext(void 0);
function _() {
	const a = m.useContext(W);
	if (!a)
		throw new Error(
			"useTableBodyContext should be used within the TableBodyContext provider!",
		);
	return a;
}
const S = m.forwardRef((a, i) => {
	var d, y, b;
	const { theme: t, clearTheme: c, applyTheme: h } = H(),
		s = w(),
		T = f(
			[
				N.body,
				(y = (d = s.theme) == null ? void 0 : d.table) == null
					? void 0
					: y.body,
				t == null ? void 0 : t.body,
				a.theme,
			],
			[r(s.clearTheme, "table.body"), r(c, "body"), a.clearTheme],
			[r(s.applyTheme, "table.body"), r(h, "body"), a.applyTheme],
		),
		{ className: o, ...n } = j(a, (b = s.props) == null ? void 0 : b.tableBody);
	return e.jsx(W.Provider, {
		value: {
			theme: a.theme,
			clearTheme: a.clearTheme,
			applyTheme: a.applyTheme,
		},
		children: e.jsx("tbody", { ref: i, className: g(T.base, o), ...n }),
	});
});
S.displayName = "TableBody";
const l = m.forwardRef((a, i) => {
	var x, p, k, v, P;
	const { theme: t, clearTheme: c, applyTheme: h } = H(),
		{ theme: s, clearTheme: T, applyTheme: o } = _(),
		n = w(),
		d = f(
			[
				N.body.cell,
				(k =
					(p = (x = n.theme) == null ? void 0 : x.table) == null
						? void 0
						: p.body) == null
					? void 0
					: k.cell,
				(v = t == null ? void 0 : t.body) == null ? void 0 : v.cell,
				s == null ? void 0 : s.cell,
				a.theme,
			],
			[
				r(n.clearTheme, "table.body.cell"),
				r(c, "body.cell"),
				r(T, "cell"),
				a.clearTheme,
			],
			[
				r(n.applyTheme, "table.body.cell"),
				r(h, "body.cell"),
				r(o, "cell"),
				a.applyTheme,
			],
		),
		{ className: y, ...b } = j(a, (P = n.props) == null ? void 0 : P.tableCell);
	return e.jsx("td", { ref: i, className: g(d.base, y), ...b });
});
l.displayName = "TableCell";
const G = m.createContext(void 0);
function z() {
	const a = m.useContext(G);
	if (!a)
		throw new Error(
			"useTableHeadContext should be used within the TableHeadContext provider!",
		);
	return a;
}
const L = m.forwardRef((a, i) => {
	var d, y, b;
	const { theme: t, clearTheme: c, applyTheme: h } = H(),
		s = w(),
		T = f(
			[
				N.head,
				(y = (d = s.theme) == null ? void 0 : d.table) == null
					? void 0
					: y.head,
				t == null ? void 0 : t.head,
				a.theme,
			],
			[r(s.clearTheme, "table.head"), r(c, "head"), a.clearTheme],
			[r(s.applyTheme, "table.head"), r(h, "head"), a.applyTheme],
		),
		{ className: o, ...n } = j(a, (b = s.props) == null ? void 0 : b.tableHead);
	return e.jsx(G.Provider, {
		value: {
			theme: a.theme,
			clearTheme: a.clearTheme,
			applyTheme: a.applyTheme,
		},
		children: e.jsx("thead", { ref: i, className: g(T.base, o), ...n }),
	});
});
L.displayName = "TableHead";
const C = m.forwardRef((a, i) => {
	var x, p, k, v, P;
	const { theme: t, clearTheme: c, applyTheme: h } = H(),
		{ theme: s, clearTheme: T, applyTheme: o } = z(),
		n = w(),
		d = f(
			[
				N.head.cell,
				(k =
					(p = (x = n.theme) == null ? void 0 : x.table) == null
						? void 0
						: p.head) == null
					? void 0
					: k.cell,
				(v = t == null ? void 0 : t.head) == null ? void 0 : v.cell,
				s == null ? void 0 : s.cell,
				a.theme,
			],
			[
				r(n.clearTheme, "table.head.cell"),
				r(c, "head.cell"),
				r(T, "cell"),
				a.clearTheme,
			],
			[
				r(n.applyTheme, "table.head.cell"),
				r(h, "head.cell"),
				r(o, "cell"),
				a.applyTheme,
			],
		),
		{ className: y, ...b } = j(
			a,
			(P = n.props) == null ? void 0 : P.tableHeadCell,
		);
	return e.jsx("th", { ref: i, className: g(d.base, y), ...b });
});
C.displayName = "TableHeadCell";
const u = m.forwardRef((a, i) => {
	var b, x, p;
	const {
			theme: t,
			clearTheme: c,
			applyTheme: h,
			hoverable: s,
			striped: T,
		} = H(),
		o = w(),
		n = f(
			[
				N.row,
				(x = (b = o.theme) == null ? void 0 : b.table) == null ? void 0 : x.row,
				t == null ? void 0 : t.row,
				a.theme,
			],
			[r(o.clearTheme, "table.row"), r(c, "row"), a.clearTheme],
			[r(o.applyTheme, "table.row"), r(h, "row"), a.applyTheme],
		),
		{ className: d, ...y } = j(a, (p = o.props) == null ? void 0 : p.tableRow);
	return e.jsx("tr", {
		ref: i,
		"data-testid": "table-row-element",
		className: g(n.base, T && n.striped, s && n.hovered, d),
		...y,
	});
});
u.displayName = "TableRow";
const J = { title: "Components/Tables", component: E },
	O = (a) =>
		e.jsxs(E, {
			...a,
			children: [
				e.jsx(L, {
					children: e.jsxs(u, {
						children: [
							e.jsx(C, { children: "Product name" }),
							e.jsx(C, { children: "Color" }),
							e.jsx(C, { children: "Category" }),
							e.jsx(C, { children: "Price" }),
							e.jsx(C, {
								children: e.jsx("span", {
									className: "sr-only",
									children: "Edit",
								}),
							}),
						],
					}),
				}),
				e.jsxs(S, {
					className: "divide-y",
					children: [
						e.jsxs(u, {
							className: "bg-white dark:border-gray-700 dark:bg-gray-800",
							children: [
								e.jsx(l, {
									className:
										"whitespace-nowrap font-medium text-gray-900 dark:text-white",
									children: 'Apple MacBook Pro 17"',
								}),
								e.jsx(l, { children: "Sliver" }),
								e.jsx(l, { children: "Laptop" }),
								e.jsx(l, { children: "$2999" }),
								e.jsx(l, {
									children: e.jsx("a", {
										href: "/tables",
										className:
											"font-medium text-cyan-600 hover:underline dark:text-cyan-500",
										children: "Edit",
									}),
								}),
							],
						}),
						e.jsxs(u, {
							className: "bg-white dark:border-gray-700 dark:bg-gray-800",
							children: [
								e.jsx(l, {
									className:
										"whitespace-nowrap font-medium text-gray-900 dark:text-white",
									children: "Microsoft Surface Pro",
								}),
								e.jsx(l, { children: "White" }),
								e.jsx(l, { children: "Laptop PC" }),
								e.jsx(l, { children: "$1999" }),
								e.jsx(l, {
									children: e.jsx("a", {
										href: "/tables",
										className:
											"font-medium text-cyan-600 hover:underline dark:text-cyan-500",
										children: "Edit",
									}),
								}),
							],
						}),
						e.jsxs(u, {
							className: "bg-white dark:border-gray-700 dark:bg-gray-800",
							children: [
								e.jsx(l, {
									className:
										"whitespace-nowrap font-medium text-gray-900 dark:text-white",
									children: "Magic Mouse 2",
								}),
								e.jsx(l, { children: "Black" }),
								e.jsx(l, { children: "Accessories" }),
								e.jsx(l, { children: "$99" }),
								e.jsx(l, {
									children: e.jsx("a", {
										href: "/tables",
										className:
											"font-medium text-cyan-600 hover:underline dark:text-cyan-500",
										children: "Edit",
									}),
								}),
							],
						}),
						e.jsxs(u, {
							className: "bg-white dark:border-gray-700 dark:bg-gray-800",
							children: [
								e.jsx(l, {
									className:
										"whitespace-nowrap font-medium text-gray-900 dark:text-white",
									children: "Google Pixel Phone",
								}),
								e.jsx(l, { children: "Gray" }),
								e.jsx(l, { children: "Phone" }),
								e.jsx(l, { children: "$799" }),
								e.jsx(l, {
									children: e.jsx("a", {
										href: "/tables",
										className:
											"font-medium text-cyan-600 hover:underline dark:text-cyan-500",
										children: "Edit",
									}),
								}),
							],
						}),
						e.jsxs(u, {
							className: "bg-white dark:border-gray-700 dark:bg-gray-800",
							children: [
								e.jsx(l, {
									className:
										"whitespace-nowrap font-medium text-gray-900 dark:text-white",
									children: "Apple Watch 5",
								}),
								e.jsx(l, { children: "Red" }),
								e.jsx(l, { children: "Wearables" }),
								e.jsx(l, { children: "$999" }),
								e.jsx(l, {
									children: e.jsx("a", {
										href: "/tables",
										className:
											"font-medium text-cyan-600 hover:underline dark:text-cyan-500",
										children: "Edit",
									}),
								}),
							],
						}),
					],
				}),
			],
		}),
	R = O.bind({});
R.storyName = "Default";
var A, B, $;
R.parameters = {
	...R.parameters,
	docs: {
		...((A = R.parameters) == null ? void 0 : A.docs),
		source: {
			originalSource: `args => <Table {...args}>\r
        <TableHead>\r
            <TableRow>\r
                <TableHeadCell>Product name</TableHeadCell>\r
                <TableHeadCell>Color</TableHeadCell>\r
                <TableHeadCell>Category</TableHeadCell>\r
                <TableHeadCell>Price</TableHeadCell>\r
                <TableHeadCell>\r
                    <span className="sr-only">Edit</span>\r
                </TableHeadCell>\r
            </TableRow>\r
        </TableHead>\r
        <TableBody className="divide-y">\r
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">\r
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">\r
                    Apple MacBook Pro 17"\r
                </TableCell>\r
                <TableCell>Sliver</TableCell>\r
                <TableCell>Laptop</TableCell>\r
                <TableCell>$2999</TableCell>\r
                <TableCell>\r
                    <a href="/tables" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Edit\r
                    </a>\r
                </TableCell>\r
            </TableRow>\r
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">\r
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">\r
                    Microsoft Surface Pro\r
                </TableCell>\r
                <TableCell>White</TableCell>\r
                <TableCell>Laptop PC</TableCell>\r
                <TableCell>$1999</TableCell>\r
                <TableCell>\r
                    <a href="/tables" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Edit\r
                    </a>\r
                </TableCell>\r
            </TableRow>\r
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">\r
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">\r
                    Magic Mouse 2\r
                </TableCell>\r
                <TableCell>Black</TableCell>\r
                <TableCell>Accessories</TableCell>\r
                <TableCell>$99</TableCell>\r
                <TableCell>\r
                    <a href="/tables" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Edit\r
                    </a>\r
                </TableCell>\r
            </TableRow>\r
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">\r
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">\r
                    Google Pixel Phone\r
                </TableCell>\r
                <TableCell>Gray</TableCell>\r
                <TableCell>Phone</TableCell>\r
                <TableCell>$799</TableCell>\r
                <TableCell>\r
                    <a href="/tables" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Edit\r
                    </a>\r
                </TableCell>\r
            </TableRow>\r
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">\r
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">\r
                    Apple Watch 5\r
                </TableCell>\r
                <TableCell>Red</TableCell>\r
                <TableCell>Wearables</TableCell>\r
                <TableCell>$999</TableCell>\r
                <TableCell>\r
                    <a href="/tables" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">\r
                        Edit\r
                    </a>\r
                </TableCell>\r
            </TableRow>\r
        </TableBody>\r
    </Table>`,
			...(($ = (B = R.parameters) == null ? void 0 : B.docs) == null
				? void 0
				: $.source),
		},
	},
};
const K = ["DefaultTable"];
export { R as DefaultTable, K as __namedExportsOrder, J as default };
