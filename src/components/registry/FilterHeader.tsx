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

interface FilterHeaderProps {
	title: string;
	onClear: () => void;
	hasActiveFilter?: boolean;
	id?: string;
}

export const FilterHeader = ({
	title,
	onClear,
	hasActiveFilter,
	id,
}: FilterHeaderProps) => (
	<div className="flex justify-between items-center p-3">
		<label htmlFor={id} className="text-sm">
			{title}
		</label>

		{hasActiveFilter && (
			<button
				onClick={onClear}
				className="text-xs text-brg-mid hover:text-red-700"
			>
				Clear
			</button>
		)}
	</div>
);
