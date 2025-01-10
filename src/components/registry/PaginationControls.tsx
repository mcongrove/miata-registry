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
import { Select } from '../form/Select';

interface PaginationControlsProps {
	className?: string;
	currentPage: number;
	hasFilters: boolean;
	isLoading?: boolean;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	totalItems: number;
	totalPages: number;
}

export const PaginationControls = ({
	className = '',
	currentPage,
	hasFilters = false,
	isLoading = false,
	itemsPerPage,
	onPageChange,
	totalItems,
	totalPages,
}: PaginationControlsProps) => {
	const start = (currentPage - 1) * itemsPerPage + 1;
	const end = Math.min(currentPage * itemsPerPage, totalItems);

	const pageOptions =
		totalPages === 0
			? [{ value: 1, label: '1' }]
			: [...Array(totalPages)].map((_, i) => ({
					value: i + 1,
					label: String(i + 1),
				}));

	return (
		<div
			className={twMerge(
				'flex justify-between items-center gap-2 text-sm',
				isLoading ? 'opacity-50 pointer-events-none' : '',
				className
			)}
		>
			<div className="text-brg-mid text-xs">
				{totalItems > 0 ? (
					<>
						Showing{' '}
						<span className="font-semibold">
							{start.toLocaleString()}
						</span>
						-
						<span className="font-semibold">
							{end.toLocaleString()}
						</span>{' '}
						of{' '}
						<span className="font-semibold">
							{totalItems.toLocaleString()}
						</span>
						{hasFilters ? ' matches' : ' total cars'}
					</>
				) : (
					'Showing 0 matches'
				)}
			</div>

			<div className="flex gap-1 items-stretch">
				<button
					className="w-8 flex items-center justify-center border border-brg-light rounded-md hover:bg-brg-light disabled:opacity-20 disabled:cursor-not-allowed"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					<i className="fa-solid fa-fw fa-chevron-left text-brg-mid text-xs" />

					<span className="sr-only">Previous page</span>
				</button>

				<div className="w-16">
					<Select
						id="pagination-select"
						value={currentPage}
						disabled={totalPages <= 1}
						className="md:!text-xs disabled:opacity-30 disabled:cursor-not-allowed"
						onChange={(event) => {
							const newPage = Number(event.target.value);

							if (newPage !== currentPage) {
								onPageChange(newPage);
							}
						}}
						options={pageOptions}
					/>
				</div>

				<button
					className="w-8 flex items-center justify-center border border-brg-light rounded-md hover:bg-brg-light disabled:opacity-20 disabled:cursor-not-allowed"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages || totalPages <= 1}
				>
					<i className="fa-solid fa-fw fa-chevron-right text-brg-mid text-xs" />

					<span className="sr-only">Next page</span>
				</button>
			</div>
		</div>
	);
};
