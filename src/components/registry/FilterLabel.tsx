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

import { twMerge } from 'tailwind-merge';
import { TFilterOption, TFilterType } from '../../types/Filters';

interface FilterLabelProps {
	id: string;
	isSelected: boolean;
	onChange: (option: TFilterOption) => void;
	type: TFilterType;
	value: string;
}

export const FilterLabel = ({
	id,
	isSelected,
	onChange,
	type,
	value,
}: FilterLabelProps) => (
	<label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
		<input
			id={id}
			type="radio"
			name={type}
			className="hidden"
			checked={isSelected}
			onChange={() => {
				onChange({
					type,
					value: isSelected ? '' : value,
				});
			}}
		/>

		<div
			className={twMerge(
				'size-3 rounded-full border',
				isSelected ? 'bg-brg border-brg' : 'bg-white border-brg-border'
			)}
		/>

		<span>{value}</span>
	</label>
);
