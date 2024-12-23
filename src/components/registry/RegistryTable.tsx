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

import { Link, useNavigate } from 'react-router-dom';
import { Car } from '../../types/Car';
import { colorMap } from '../../utils/colorMap';

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
	const navigate = useNavigate();

	return (
		<div className="bg-white rounded-md overflow-hidden border border-brg-light text-brg">
			<table className="min-w-full">
				<thead className="bg-brg-light">
					<tr>
						{[
							'Year',
							'Gen.',
							'Edition',
							'Color',
							'Sequence #',
							'Owner',
							'Country',
						].map((header) => (
							<th
								key={header}
								className="px-4 py-3 text-left text-xs font-semibold text-brg cursor-pointer"
								onClick={() =>
									onSort(
										header
											.toLowerCase()
											.replace('Sequence #', 'sequence')
											.replace('Gen.', 'generation')
											.toLowerCase() as keyof Car
									)
								}
							>
								<div className="flex items-center">
									{header}

									<span
										className={`ml-1 ${
											sortColumn === header.toLowerCase()
												? 'opacity-100'
												: 'opacity-0'
										}`}
									>
										{sortDirection === 'asc' ? '↑' : '↓'}
									</span>
								</div>
							</th>
						))}
					</tr>
				</thead>

				<tbody className="divide-y divide-brg-light text-xs">
					{cars.map((car) => (
						<tr
							key={car.id}
							className="bg-white hover:bg-brg-light/25 transition-colors relative cursor-pointer"
							onClick={(e) => {
								if (!(e.target as HTMLElement).closest('a')) {
									if (e.metaKey || e.ctrlKey) {
										// Open in new tab
										window.open(`/car/${car.id}`, '_blank');
									} else {
										navigate(`/car/${car.id}`);
									}
								}
							}}
						>
							<td className="w-20 px-4 py-3 whitespace-nowrap font-mono">
								<div className="pointer-events-auto">
									{car.year}
								</div>
							</td>
							<td className="w-20 px-4 py-3 whitespace-nowrap">
								{car.generation}
							</td>
							<td className="w-52 px-4 py-3 whitespace-nowrap">
								{car.edition}
							</td>
							<td className="w-52 px-4 py-3 whitespace-nowrap">
								<div className="flex items-center gap-2">
									<span
										className="w-4 h-3 rounded-sm inline-block"
										style={{
											backgroundColor:
												colorMap[
													car.color.toLowerCase()
												] || '#DDD',
										}}
									/>
									{car.color}
								</div>
							</td>
							<td className="w-52 flex justify-between px-4 py-3 whitespace-nowrap font-mono max-w-40">
								{car.sequence && (
									<>
										{car.sequence.toLocaleString()}
										{car.totalProduced && (
											<span className="text-brg-border">
												of{' '}
												{car.totalProduced.toLocaleString()}
											</span>
										)}
									</>
								)}
							</td>
							<td className="px-4 py-3 whitespace-nowrap">
								{car.owner ? (
									<Link
										to={`/owner/${car.owner.id}`}
										className="hover:underline relative z-10"
									>
										{car.owner.name}
									</Link>
								) : (
									<Link
										to={`/claim/${car.id}`}
										className="text-brg-border hover:text-brg hover:underline relative z-10"
									>
										Claim
									</Link>
								)}
							</td>
							<td className="px-4 py-3 whitespace-nowrap">
								{car.location && (
									<span className="flex items-center gap-2">
										<img
											src={`https://flagcdn.com/16x12/${car.location.country.toLowerCase()}.png`}
											alt={`${car.location.country} flag`}
											className="w-4 h-3"
										/>
										{new Intl.DisplayNames(['en'], {
											type: 'region',
										}).of(car.location.country)}
									</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
