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
import { FilterOption } from '../types/filters';

const SAMPLE_CARS: Car[] = [
	{
		id: '1',
		year: 1991,
		model: 'NA',
		edition: 'British Racing Green',
		color: 'Green',
		vin: 'JM1NA3512M1234567',
		owner: 'John Doe',
	},
	{
		id: '2',
		year: 1993,
		model: 'NA',
		edition: 'LE Black & Red',
		color: 'Black',
		vin: 'JM1NA3512P1234568',
		owner: 'Jane Smith',
	},
	{
		id: '3',
		year: 1999,
		model: 'NB',
		edition: '10th Anniversary',
		color: 'Sapphire Blue',
		vin: 'JM1NB3512X1234569',
		owner: 'Bob Wilson',
	},
	{
		id: '4',
		year: 2004,
		model: 'NB',
		edition: 'Mazdaspeed',
		color: 'Velocity Red',
		vin: 'JM1NB3512Y1234570',
		owner: 'Alice Brown',
	},
	{
		id: '5',
		year: 2005,
		model: 'NC',
		edition: 'PRHT Launch Edition',
		color: 'Copper Red',
		vin: 'JM1NC3512Z1234571',
		owner: 'Charlie Davis',
	},
];

export const Registry = () => {
	const [search, setSearch] = useState('');
	const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortColumn, setSortColumn] = useState<keyof Car>('year');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	const handleSort = (column: keyof Car) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	const handleFiltersChange = (newFilters: FilterOption[]) => {
		setActiveFilters(newFilters);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className="flex-1 flex">
				<div className="flex gap-8 flex-1 p-16">
					<FilterSidebar
						activeFilters={activeFilters}
						onFiltersChange={handleFiltersChange}
					/>

					<div className="flex-1">
						<div className="mb-6">
							<input
								type="text"
								placeholder="Search registry..."
								className="w-full px-4 py-2 rounded-lg border border-gray-300"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{activeFilters.length > 0 && (
							<div className="mb-4 flex gap-2 flex-wrap">
								{activeFilters.map((filter) => (
									<span
										key={`${filter.type}:${filter.value}`}
										className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
									>
										{filter.type}: {filter.value}
									</span>
								))}
							</div>
						)}

						<div className="mb-4">
							<PaginationControls
								currentPage={currentPage}
								totalPages={10}
								onPageChange={setCurrentPage}
								totalItems={50}
								itemsPerPage={5}
							/>
						</div>

						<RegistryTable
							cars={SAMPLE_CARS}
							sortColumn={sortColumn}
							sortDirection={sortDirection}
							onSort={handleSort}
						/>

						<div className="mt-4">
							<PaginationControls
								currentPage={currentPage}
								totalPages={10}
								onPageChange={setCurrentPage}
								totalItems={50}
								itemsPerPage={5}
							/>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};
