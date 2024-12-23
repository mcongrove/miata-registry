export type FilterType = 'year' | 'generation' | 'edition' | 'country';

export interface FilterOption {
	type: FilterType;
	value: string;
}
