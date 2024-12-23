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

import { FilterOption } from '../../types/Filters';
import { Select } from '../Select';
import { FilterRadioGroup } from './FilterRadioGroup';
import { FilterHeader } from './FilterHeader';

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
						onChange={(value: string) =>
							handleSelectChange(value, 'year')
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
				title="Limited Editions"
				type="edition"
				options={[
					'1991 British Racing Green',
					'1992 Sunburst Yellow',
					'1995 Mazdaspeed',
					'1999 10th Anniversary',
					'2001 British Racing Green',
				]}
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
						onChange={(value: string) =>
							handleSelectChange(value, 'country')
						}
						options={[
							{ value: 'United States', label: 'United States' },
							{ value: 'Japan', label: 'Japan' },
							{
								value: 'United Kingdom',
								label: 'United Kingdom',
							},
						]}
						placeholder="Select country"
					/>
				</div>
			</div>
		</div>
	);
};
