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

import { FilterOption } from '../../types/filters';

interface FilterSidebarProps {
	activeFilters: FilterOption[];
	onFiltersChange: (filters: FilterOption[]) => void;
}

const FilterLabel = ({
	value,
	type,
	isSelected,
	onChange,
}: FilterOption & {
	isSelected: boolean;
	onChange: (option: FilterOption) => void;
}) => (
	<label className="flex items-center">
		<input
			type="radio"
			className="mr-2 size-4"
			checked={isSelected}
			onChange={() => onChange({ type, value })}
			name={type}
		/>
		<span>{value}</span>
	</label>
);

interface FilterHeaderProps {
	title: string;
	onClear: () => void;
	hasActiveFilter?: boolean;
}

const FilterHeader = ({
	title,
	onClear,
	hasActiveFilter,
}: FilterHeaderProps) => (
	<div className="flex justify-between items-center p-4 pb-3">
		<h3 className="text-sm">{title}</h3>

		{hasActiveFilter && (
			<button
				onClick={onClear}
				className="text-xs text-brg-mid hover:text-brg"
			>
				Clear
			</button>
		)}
	</div>
);

export const FilterSidebar = ({
	activeFilters,
	onFiltersChange,
}: FilterSidebarProps) => {
	const currentYear = new Date().getFullYear();
	const years = Array.from(
		{ length: currentYear - 1989 + 1 },
		(_, i) => currentYear - i
	).reverse();

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

	const getActiveValue = (type: FilterOption['type']) =>
		activeFilters.find((f) => f.type === type)?.value;

	return (
		<div className="flex flex-col w-64 h-full divide-y divide-brg-light border rounded-lg border-brg-light">
			<div>
				<FilterHeader
					title="Year"
					onClear={() => handleClear('year')}
					hasActiveFilter={!!getActiveValue('year')}
				/>

				<div className="p-4 pt-0">
					<div className="relative">
						<select
							className={`w-full p-2 text-xs bg-white border border-brg-border rounded-md focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat ${getActiveValue('year') ? 'text-brg' : 'text-brg-border'}`}
							onChange={(e) =>
								handleOptionChange({
									type: 'year',
									value: e.target.value,
								})
							}
							value={getActiveValue('year') || ''}
						>
							<option value="">Select year</option>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div>
				<FilterHeader
					title="Generation"
					onClear={() => handleClear('generation')}
					hasActiveFilter={!!getActiveValue('generation')}
				/>

				<div className="space-y-2 max-h-56 overflow-y-auto p-4 pt-0 text-xs font-light">
					{['NA', 'NB', 'NC', 'ND'].map((gen) => (
						<FilterLabel
							key={gen}
							value={gen}
							type="generation"
							isSelected={getActiveValue('generation') === gen}
							onChange={handleOptionChange}
						/>
					))}
				</div>
			</div>

			<div>
				<FilterHeader
					title="Edition"
					onClear={() => handleClear('edition')}
					hasActiveFilter={!!getActiveValue('edition')}
				/>

				<div className="space-y-2 max-h-60 overflow-y-auto p-4 pt-0 text-xs font-light">
					{[
						'British Racing Green',
						'10th Anniversary',
						'Mazdaspeed',
						'British Racing Green',
						'10th Anniversary',
						'Mazdaspeed',
						'British Racing Green',
						'10th Anniversary',
						'Mazdaspeed',
						'British Racing Green',
						'10th Anniversary',
						'Mazdaspeed',
						'British Racing Green',
						'10th Anniversary',
						'Mazdaspeed',
					].map((edition) => (
						<FilterLabel
							key={edition}
							value={edition}
							type="edition"
							isSelected={getActiveValue('edition') === edition}
							onChange={handleOptionChange}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
