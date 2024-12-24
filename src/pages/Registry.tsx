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

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Chip } from '../components/Chip';
import { FilterSidebar } from '../components/registry/FilterSidebar';
import { PaginationControls } from '../components/registry/PaginationControls';
import { RegistryTable } from '../components/registry/RegistryTable';
import sampleCars from '../data/sampleCars.json';
import { Car } from '../types/Car';
import { FilterOption, FilterType } from '../types/Filters';

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
	const [sortColumn, setSortColumn] = useState<string>(
		searchParams.get('sortColumn') || 'edition.year'
	);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
		const urlSortDir = searchParams.get('sortDir') as 'asc' | 'desc';

		// If there's a sort direction in the URL, use it
		if (urlSortDir) return urlSortDir;

		// Otherwise, always use 'asc' since we're defaulting to year
		return 'asc';
	});

	const [searchInputRef, setSearchInputRef] =
		useState<HTMLInputElement | null>(null);

	useEffect(() => {
		if (window.location.hash === '#search' && searchInputRef) {
			setTimeout(() => {
				searchInputRef.focus();

				history.pushState(
					'',
					document.title,
					window.location.pathname + window.location.search
				);
			}, 0);
		}
	}, [searchInputRef]);

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
	const handleSort = (column: string) => {
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
		setCurrentPage(1); // Reset to first page when filters change

		updateSearchParams({
			filter: newFilters.map((f) => `${f.type}:${f.value}`),
			page: '1',
		});
	};

	// Add function to get filtered and sorted cars
	const getProcessedCars = (cars: Car[]) => {
		let filtered = [...cars];

		// Apply search
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(car) =>
					car.edition.name.toLowerCase().includes(searchLower) ||
					car.vin?.toLowerCase().includes(searchLower) ||
					(car.owner?.name ?? '')
						.toLowerCase()
						.includes(searchLower) ||
					(car.location?.city ?? '')
						.toLowerCase()
						.includes(searchLower)
			);
		}

		// Apply filters
		activeFilters.forEach((filter) => {
			filtered = filtered.filter((car) => {
				switch (filter.type) {
					case 'generation':
						return car.edition.generation === filter.value;
					case 'year':
						return car.edition.year.toString() === filter.value;
					default:
						return true;
				}
			});
		});

		// Apply sorting
		filtered.sort((a, b) => {
			const getValue = (car: Car, path: string) => {
				return (
					path
						.split('.')
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						.reduce((obj: any, key) => obj?.[key], car)
				);
			};

			const aVal = getValue(a, sortColumn) ?? '';
			const bVal = getValue(b, sortColumn) ?? '';

			if (typeof aVal === 'string') {
				return sortDirection === 'asc'
					? aVal.localeCompare(bVal)
					: bVal.localeCompare(aVal);
			}

			return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
		});

		return filtered;
	};

	const itemsPerPage = 50;
	const processedCars = getProcessedCars(sampleCars);
	const totalItems = processedCars.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const currentCars = processedCars.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 flex pt-20">
				<div className="flex gap-8 flex-1 container mx-auto pt-8 pb-16">
					<FilterSidebar
						activeFilters={activeFilters}
						onFiltersChange={handleFiltersChange}
					/>

					<div className="flex-1 flex flex-col">
						<div className="relative max-w-80">
							<input
								ref={setSearchInputRef}
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
										updateSearchParams({
											filter: null,
										});
									}}
									className="text-brg px-2 py-1 text-xs hover:text-red-700"
								>
									Clear All
								</button>
							</div>
						)}

						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page) => {
								setCurrentPage(page);
								updateSearchParams({ page: page.toString() });
							}}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							hasFilters={
								activeFilters.length > 0 || search.length > 0
							}
						/>

						<div className="flex-1 my-3">
							<RegistryTable
								cars={currentCars}
								sortColumn={sortColumn}
								sortDirection={sortDirection}
								onSort={handleSort}
							/>
						</div>

						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page) => {
								setCurrentPage(page);
								updateSearchParams({ page: page.toString() });
							}}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							hasFilters={
								activeFilters.length > 0 || search.length > 0
							}
						/>
					</div>
				</div>
			</main>
		</div>
	);
};
