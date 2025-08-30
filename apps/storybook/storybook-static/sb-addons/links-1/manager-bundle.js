try {
	(() => {
		var c = __STORYBOOK_API__,
			{
				ActiveTabs: y,
				Consumer: P,
				ManagerContext: k,
				Provider: T,
				RequestResponseError: f,
				addons: n,
				combineParameters: v,
				controlOrMetaKey: g,
				controlOrMetaSymbol: C,
				eventMatchesShortcut: E,
				eventToShortcut: O,
				experimental_MockUniversalStore: A,
				experimental_UniversalStore: h,
				experimental_getStatusStore: x,
				experimental_getTestProviderStore: R,
				experimental_requestResponse: j,
				experimental_useStatusStore: I,
				experimental_useTestProviderStore: M,
				experimental_useUniversalStore: U,
				internal_fullStatusStore: D,
				internal_fullTestProviderStore: N,
				internal_universalStatusStore: B,
				internal_universalTestProviderStore: K,
				isMacLike: V,
				isShortcutTaken: q,
				keyToSymbol: G,
				merge: L,
				mockChannel: Y,
				optionOrAltSymbol: $,
				shortcutMatchesShortcut: H,
				shortcutToHumanString: Q,
				types: w,
				useAddonState: z,
				useArgTypes: F,
				useArgs: J,
				useChannel: W,
				useGlobalTypes: X,
				useGlobals: Z,
				useParameter: ee,
				useSharedState: oe,
				useStoryPrepared: te,
				useStorybookApi: se,
				useStorybookState: re,
			} = __STORYBOOK_API__;
		var e = "storybook/links",
			l = {
				NAVIGATE: `${e}/navigate`,
				REQUEST: `${e}/request`,
				RECEIVE: `${e}/receive`,
			};
		n.register(e, (o) => {
			o.on(l.REQUEST, ({ kind: d, name: a }) => {
				const u = o.storyId(d, a);
				o.emit(l.RECEIVE, u);
			});
		});
	})();
} catch (e) {
	console.error(
		"[Storybook] One of your manager-entries failed: " + import.meta.url,
		e,
	);
}
