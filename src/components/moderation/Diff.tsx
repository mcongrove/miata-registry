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

export const Diff = ({
	label,
	oldValue,
	newValue,
}: {
	label: string;
	oldValue?: string | number | null;
	newValue?: string | number | null;
}) => {
	if (oldValue === newValue || (!oldValue && !newValue)) return null;

	return (
		<div className="flex items-center gap-4">
			<span className="w-1/5 text-sm font-medium text-brg-mid">
				{label}
			</span>

			<span className="w-2/5 line-through text-sm text-brg-border">
				{oldValue || 'None'}
			</span>

			<span className="w-2/5 text-sm text-brg">{newValue || 'None'}</span>
		</div>
	);
};
