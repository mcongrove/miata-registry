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

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	totalItems: number;
	itemsPerPage: number;
}

export const PaginationControls = ({
	currentPage,
	totalPages,
	onPageChange,
	totalItems,
	itemsPerPage,
}: PaginationControlsProps) => {
	const start = (currentPage - 1) * itemsPerPage + 1;
	const end = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className="flex justify-between items-center">
			<div className="text-sm text-gray-600">
				Showing {start}-{end} of {totalItems} cars
			</div>
			<div className="flex gap-2">
				<button
					className="px-3 py-1 border rounded hover:bg-gray-50"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					&lt;
				</button>
				{[...Array(totalPages)].map((_, i) => (
					<button
						key={i + 1}
						className={`px-3 py-1 rounded ${
							currentPage === i + 1
								? 'bg-blue-600 text-white'
								: 'border hover:bg-gray-50'
						}`}
						onClick={() => onPageChange(i + 1)}
					>
						{i + 1}
					</button>
				))}
				<button
					className="px-3 py-1 border rounded hover:bg-gray-50"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					&gt;
				</button>
			</div>
		</div>
	);
};
