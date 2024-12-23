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

import { useState } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { FilterSidebar } from '../components/registry/FilterSidebar';
import { PaginationControls } from '../components/registry/PaginationControls';
import { RegistryTable } from '../components/registry/RegistryTable';
import { Car } from '../types/Car';
import { FilterOption, FilterType } from '../types/Filters';
import { Chip } from '../components/common/Chip';
import sampleCars from '../data/sampleCars.json';
import { useSearchParams } from 'react-router-dom';

export const Registry = () => {
	const parseFiltersFromURL = (filterParams: string[]): FilterOption[] => {
		return filterParams.map((param) => {
			const [type, value] = param.split(':') as [FilterType, string];
			return { type, value };
		});
	};

	const [searchParams, setSearchParams] = useSearchParams();
	const [search, setSearch] = useState(searchParams.get('search') || '');
	const [activeFilters, setActiveFilters] = useState<FilterOption[]>(
		parseFiltersFromURL(searchParams.getAll('filter'))
	);
	const [currentPage, setCurrentPage] = useState(
		parseInt(searchParams.get('page') || '1')
	);
	const [sortColumn, setSortColumn] = useState<keyof Car>(
		(searchParams.get('sortColumn') as keyof Car) || 'year'
	);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
		(searchParams.get('sortDir') as 'asc' | 'desc') || 'desc'
	);

	const updateSearchParams = (
		updates: Record<string, string | string[] | null>
	) => {
		const newParams = new URLSearchParams(searchParams);

		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) {
				newParams.delete(key);
			} else if (Array.isArray(value)) {
				newParams.delete(key);

				value.forEach((v) => newParams.append(key, v));
			} else {
				newParams.set(key, value);
			}
		});

		setSearchParams(newParams);
	};

	// Update handlers to persist state in URL
	const handleSort = (column: keyof Car) => {
		const newDirection =
			sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';

		setSortColumn(column);

		setSortDirection(newDirection);

		updateSearchParams({
			sortColumn: column,
			sortDir: newDirection,
		});
	};

	const handleFiltersChange = (newFilters: FilterOption[]) => {
		setActiveFilters(newFilters);

		updateSearchParams({
			filter: newFilters.map((f) => `${f.type}:${f.value}`),
		});
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className="flex-1 flex">
				<div className="flex gap-8 flex-1 container mx-auto pt-8 pb-16">
					<FilterSidebar
						activeFilters={activeFilters}
						onFiltersChange={handleFiltersChange}
					/>

					<div className="flex-1">
						<div className="relative max-w-80">
							<input
								type="text"
								placeholder="Search..."
								className="w-full px-3 py-2 rounded-md border border-brg-light text-sm mb-3 focus:outline-none placeholder:text-brg-mid/70 pr-8"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									updateSearchParams({
										search: e.target.value || null,
									});
								}}
							/>

							{search && (
								<button
									onClick={() => setSearch('')}
									className="absolute right-0 pr-3 pl-1 top-[calc(50%-8px)] -translate-y-1/2 text-brg-mid/70 hover:text-red-700"
									aria-label="Clear search"
								>
									×
								</button>
							)}
						</div>

						{activeFilters.length > 0 && (
							<div className="mb-3 flex gap-2 flex-wrap">
								{activeFilters.map((filter) => (
									<Chip
										key={`${filter.type}:${filter.value}`}
										label={
											filter.type
												.charAt(0)
												.toUpperCase() +
											filter.type.slice(1)
										}
										value={filter.value}
										onRemove={() => {
											const newFilters =
												activeFilters.filter(
													(f) =>
														f.type !== filter.type
												);

											setActiveFilters(newFilters);

											updateSearchParams({
												filter: newFilters.map(
													(f) =>
														`${f.type}:${f.value}`
												),
											});
										}}
									/>
								))}
								<button
									onClick={() => {
										setActiveFilters([]);
										updateSearchParams({ filter: null });
									}}
									className="text-brg px-2 py-1 text-xs hover:text-red-700"
								>
									Clear All
								</button>
							</div>
						)}

						<PaginationControls
							currentPage={currentPage}
							totalPages={10}
							onPageChange={(page) => {
								setCurrentPage(page);
								updateSearchParams({ page: page.toString() });
							}}
							totalItems={50}
							itemsPerPage={5}
						/>

						<div className="my-3">
							<RegistryTable
								cars={sampleCars}
								sortColumn={sortColumn}
								sortDirection={sortDirection}
								onSort={handleSort}
							/>
						</div>

						<PaginationControls
							currentPage={currentPage}
							totalPages={10}
							onPageChange={(page) => {
								setCurrentPage(page);
								updateSearchParams({ page: page.toString() });
							}}
							totalItems={50}
							itemsPerPage={5}
						/>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};
