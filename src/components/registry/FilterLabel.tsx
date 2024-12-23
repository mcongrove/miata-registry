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

import { FilterType, FilterOption } from '../../types/Filters';

interface FilterLabelProps {
	value: string;
	type: FilterType;
	isSelected: boolean;
	onChange: (option: FilterOption) => void;
}

export const FilterLabel = ({
	value,
	type,
	isSelected,
	onChange,
}: FilterLabelProps) => (
	<label className="flex items-center space-x-2 cursor-pointer">
		<input
			type="radio"
			className="hidden"
			checked={isSelected}
			onChange={() =>
				onChange({
					type: type as 'year' | 'edition' | 'generation',
					value: isSelected ? '' : value,
				})
			}
		/>

		<div
			className={`w-3 h-3 rounded-full border ${
				isSelected ? 'bg-brg border-brg' : 'bg-white border-brg-border'
			}`}
		/>

		<span>{value}</span>
	</label>
);
