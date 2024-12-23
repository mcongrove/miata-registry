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

import { Car } from '../../types/Car';

interface RegistryTableProps {
	cars: Car[];
	sortColumn: keyof Car;
	sortDirection: 'asc' | 'desc';
	onSort: (column: keyof Car) => void;
}

export const RegistryTable = ({
	cars,
	sortColumn,
	sortDirection,
	onSort,
}: RegistryTableProps) => {
	return (
		<div className="bg-white rounded-md shadow overflow-hidden">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						{[
							'Year',
							'Model',
							'Edition',
							'Color',
							'VIN',
							'Owner',
						].map((header) => (
							<th
								key={header}
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
								onClick={() =>
									onSort(header.toLowerCase() as keyof Car)
								}
							>
								<div className="flex items-center">
									{header}
									{sortColumn === header.toLowerCase() && (
										<span className="ml-1">
											{sortDirection === 'asc'
												? '↑'
												: '↓'}
										</span>
									)}
								</div>
							</th>
						))}
					</tr>
				</thead>

				<tbody className="bg-white divide-y divide-gray-200">
					{cars.map((car) => (
						<tr key={car.id} className="hover:bg-gray-50">
							<td className="px-6 py-4 whitespace-nowrap">
								{car.year}
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								{car.model}
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								{car.edition}
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								{car.color}
							</td>
							<td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
								{car.vin}
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								{car.owner}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
