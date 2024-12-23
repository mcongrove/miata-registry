export type FilterType = 'year' | 'generation' | 'edition' | 'country';

export type FilterOption = {
	type: FilterType;
	value: string;
};
