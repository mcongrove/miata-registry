export type TFilterType = 'year' | 'generation' | 'edition' | 'country';

export type TFilterOption = {
	type: TFilterType;
	value: string;
};
