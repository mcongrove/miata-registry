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
import { TCar } from '../types/Car';
import { TFilterOption, TFilterType } from '../types/Filters';
import { usePageTitle } from '../hooks/usePageTitle';

export const Registry = () => {
	const parseFiltersFromURL = (filterParams: string[]): TFilterOption[] => {
		return filterParams.map((param) => {
			const [type, value] = param.split(':') as [TFilterType, string];

			if (type === 'year') {
				return {
					type,
					value: parseInt(value).toString(),
				};
			}

			return { type, value };
		});
	};

	const [searchParams, setSearchParams] = useSearchParams();
	const [activeFilters, setActiveFilters] = useState<TFilterOption[]>(
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
	const [isLoading, setIsLoading] = useState(true);
	const [cars, setCars] = useState<TCar[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	usePageTitle('Cars');

	useEffect(() => {
		const loadCars = async () => {
			setIsLoading(true);

			try {
				// Build query parameters
				const params = new URLSearchParams({
					page: currentPage.toString(),
					pageSize: itemsPerPage.toString(),
					sortColumn,
					sortDirection,
				});

				// Add filters if present
				if (activeFilters.length > 0) {
					params.set('filters', JSON.stringify(activeFilters));
				}

				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars?${params}`
				);

				if (!response.ok) {
					throw new Error('Failed to fetch cars');
				}

				const data = await response.json();
				setCars(data.cars);
				setTotalItems(data.total);
				setTotalPages(data.totalPages);
			} catch (error) {
				console.error('Error loading cars:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadCars();
	}, [activeFilters, sortColumn, sortDirection, currentPage]);

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
		if (column !== sortColumn) {
			setSortColumn(column);
			setSortDirection('asc');

			updateSearchParams({
				sortColumn: column,
				sortDir: 'asc',
			});

			return;
		}

		if (sortDirection === 'asc') {
			setSortDirection('desc');

			updateSearchParams({
				sortColumn: column,
				sortDir: 'desc',
			});

			return;
		}

		setSortColumn('edition.year');
		setSortDirection('asc');

		updateSearchParams({
			sortColumn: 'edition.year',
			sortDir: 'asc',
		});
	};

	const handleFiltersChange = (newFilters: TFilterOption[]) => {
		setActiveFilters(newFilters);
		setCurrentPage(1);

		updateSearchParams({
			filter: newFilters.map((f) => {
				const value =
					typeof f.value === 'object'
						? JSON.stringify(f.value)
						: f.value;
				return `${f.type}:${value}`;
			}),
			page: '1',
		});
	};

	const itemsPerPage = 50;

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 flex pt-20">
				<div className="flex gap-8 flex-1 container mx-auto pt-8 pb-16">
					<FilterSidebar
						activeFilters={activeFilters}
						onFiltersChange={handleFiltersChange}
					/>

					<div className="flex-1 flex flex-col">
						{activeFilters.length > 0 && (
							<div className="mb-3 flex gap-2 flex-wrap">
								{activeFilters.map((filter) => {
									// Format the filter value for display
									const displayValue = filter.value;

									return (
										<Chip
											key={`${filter.type}:${filter.value}`}
											label={
												filter.type
													.charAt(0)
													.toUpperCase() +
												filter.type.slice(1)
											}
											value={displayValue}
											onRemove={() => {
												const newFilters =
													activeFilters.filter(
														(f) =>
															f.type !==
																filter.type ||
															f.value !==
																filter.value
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
									);
								})}
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
							hasFilters={activeFilters.length > 0}
							isLoading={isLoading}
						/>

						<div className="flex-1 my-3">
							<RegistryTable
								cars={isLoading ? [] : cars}
								sortColumn={sortColumn}
								sortDirection={sortDirection}
								onSort={handleSort}
								isLoading={isLoading}
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
							hasFilters={activeFilters.length > 0}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</main>
		</div>
	);
};
