interface ImportMeta {
	glob: (
		patterns: string[] | string,
		options?: { eager?: boolean },
	) => Record<string, unknown>;
}

declare var import_meta: ImportMeta;
