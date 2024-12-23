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

interface ChipProps {
	label: string;
	value: string;
	onRemove: () => void;
}

export const Chip = ({ label, value, onRemove }: ChipProps) => {
	return (
		<span className="bg-brg text-brg-light pl-3 pr-0 py-1 rounded-md text-xs flex gap-2 items-center">
			<span className="text-brg-light/60">{label}</span>

			{value}

			<button
				onClick={onRemove}
				className="hover:text-red-300 transition-colors pl-0 pr-3 py-1"
				aria-label={`Remove ${label} filter`}
			>
				×
			</button>
		</span>
	);
};
