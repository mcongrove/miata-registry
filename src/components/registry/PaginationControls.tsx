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

import { Select } from '../Select';

interface PaginationControlsProps {
	currentPage: number;
	hasFilters: boolean;
	totalPages: number;
	onPageChange: (page: number) => void;
	totalItems: number;
	itemsPerPage: number;
}

export const PaginationControls = ({
	currentPage,
	hasFilters = false,
	totalPages,
	onPageChange,
	totalItems,
	itemsPerPage,
}: PaginationControlsProps) => {
	const start = (currentPage - 1) * itemsPerPage + 1;
	const end = Math.min(currentPage * itemsPerPage, totalItems);

	const pageOptions = [...Array(totalPages)].map((_, i) => ({
		value: i + 1,
		label: String(i + 1),
	}));

	return (
		<div className="flex justify-between items-center text-sm">
			<div className="text-brg-mid text-xs">
				Showing{' '}
				<span className="font-semibold">{start.toLocaleString()}</span>-
				<span className="font-semibold">{end.toLocaleString()}</span> of{' '}
				<span className="font-semibold">
					{totalItems.toLocaleString()}
				</span>
				{hasFilters ? ' matches' : ' total cars'}
			</div>

			<div className="flex gap-1 items-stretch">
				<button
					className="w-8 flex items-center justify-center border border-brg-border rounded-md hover:bg-brg-light disabled:opacity-30 disabled:cursor-not-allowed"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#666666"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="rotate-90"
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>

				<div className="w-16">
					<Select
						value={currentPage}
						disabled={totalPages === 1}
						className="disabled:opacity-30 disabled:cursor-not-allowed"
						onChange={(value) => {
							const newPage = Number(value);

							if (newPage !== currentPage) {
								onPageChange(newPage);
							}
						}}
						options={pageOptions}
					/>
				</div>

				<button
					className="w-8 flex items-center justify-center border border-brg-border rounded-md hover:bg-brg-light disabled:opacity-30 disabled:cursor-not-allowed"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#666666"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="-rotate-90"
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>
			</div>
		</div>
	);
};
