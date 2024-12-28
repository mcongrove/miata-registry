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

import { TFilterOption, TFilterType } from '../../types/Filters';
import { FilterHeader } from './FilterHeader';
import { FilterLabel } from './FilterLabel';

interface FilterRadioGroupProps {
	title: string;
	type: TFilterType;
	options: string[];
	activeValue: string | undefined;
	onClear: (type: TFilterType) => void;
	onChange: (option: TFilterOption) => void;
}

export const FilterRadioGroup = ({
	title,
	type,
	options,
	activeValue,
	onClear,
	onChange,
}: FilterRadioGroupProps) => (
	<div>
		<FilterHeader
			title={title}
			onClear={() => onClear(type)}
			hasActiveFilter={!!activeValue}
		/>

		<div className="space-y-2 max-h-44 overflow-y-auto p-4 pt-0 text-xs font-light">
			{options.map((value) => (
				<FilterLabel
					key={value}
					value={value}
					type={type}
					isSelected={activeValue === value}
					onChange={onChange}
				/>
			))}
		</div>
	</div>
);
