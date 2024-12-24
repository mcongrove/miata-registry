/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ChangeEvent, useEffect, useState } from 'react';
import { FilterOption } from '../../types/Filters';
import { Select } from '../Select';
import { FilterHeader } from './FilterHeader';
import { FilterRadioGroup } from './FilterRadioGroup';
import { getEditions } from '../../api/Edition';
import { getCountries } from '../../api/Owner';

interface FilterSidebarProps {
	activeFilters: FilterOption[];
	onFiltersChange: (filters: FilterOption[]) => void;
}

export const FilterSidebar = ({
	activeFilters,
	onFiltersChange,
}: FilterSidebarProps) => {
	const currentYear = new Date().getFullYear();
	const years = Array.from(
		{ length: currentYear - 1989 + 1 },
		(_, i) => currentYear - i
	).reverse();

	const [editionOptions, setEditionOptions] = useState<string[]>([]);
	const [countries, setCountries] = useState<
		Array<{ value: string; label: string }>
	>([]);

	useEffect(() => {
		const loadEditions = async () => {
			const editions = await getEditions();
			const formattedOptions = editions.map(
				(edition) => `${edition.year} ${edition.name}`
			);
			setEditionOptions(formattedOptions.sort());
		};

		loadEditions();
	}, []);

	useEffect(() => {
		const loadCountries = async () => {
			const countryList = await getCountries();
			const formattedCountries = countryList.map((code) => ({
				value: code,
				label:
					new Intl.DisplayNames(['en'], { type: 'region' }).of(
						code
					) || code,
			}));
			setCountries(
				formattedCountries.sort((a, b) =>
					a.label.localeCompare(b.label)
				)
			);
		};

		loadCountries();
	}, []);

	const getActiveValue = (type: FilterOption['type']) =>
		activeFilters.find((f) => f.type === type)?.value;

	const handleOptionChange = (newOption: FilterOption) => {
		const otherTypeFilters = activeFilters.filter(
			(f) => f.type !== newOption.type
		);
		if (newOption.value !== '') {
			onFiltersChange([...otherTypeFilters, newOption]);
		} else {
			onFiltersChange(otherTypeFilters);
		}
	};

	const handleClear = (filterType: string) => {
		onFiltersChange(activeFilters.filter((f) => f.type !== filterType));
	};

	const handleSelectChange = (value: string, type: FilterOption['type']) => {
		handleOptionChange({ type, value });
	};

	return (
		<div className="flex flex-col w-64 h-full divide-y divide-brg-light border rounded-md border-brg-light sticky top-4">
			<div>
				<FilterHeader
					title="Year"
					onClear={() => handleClear('year')}
					hasActiveFilter={!!getActiveValue('year')}
				/>

				<div className="p-4 pt-0">
					<Select
						value={getActiveValue('year') || ''}
						onChange={(e: ChangeEvent<HTMLSelectElement>) =>
							handleSelectChange(e.target.value, 'year')
						}
						options={years.map((year) => ({
							value: String(year),
							label: String(year),
						}))}
						placeholder="Select year"
					/>
				</div>
			</div>

			<FilterRadioGroup
				title="Generation"
				type="generation"
				options={['NA', 'NB', 'NC', 'ND']}
				activeValue={getActiveValue('generation')}
				onClear={handleClear}
				onChange={handleOptionChange}
			/>

			<FilterRadioGroup
				title="Edition"
				type="edition"
				options={editionOptions}
				activeValue={getActiveValue('edition')}
				onClear={handleClear}
				onChange={handleOptionChange}
			/>

			<div>
				<FilterHeader
					title="Country"
					onClear={() => handleClear('country')}
					hasActiveFilter={!!getActiveValue('country')}
				/>

				<div className="p-4 pt-0">
					<Select
						value={getActiveValue('country') || ''}
						onChange={(e: ChangeEvent<HTMLSelectElement>) =>
							handleSelectChange(e.target.value, 'country')
						}
						options={countries}
						placeholder="Select country"
					/>
				</div>
			</div>
		</div>
	);
};
