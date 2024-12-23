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
	sortColumn: string;
	sortDirection: 'asc' | 'desc';
	onSort: (column: string) => void;
	isLoading: boolean;
}

export const RegistryTable = ({
	cars,
	sortColumn,
	sortDirection,
	onSort,
	isLoading = false,
}: RegistryTableProps) => {
	const navigate = useNavigate();

	const columns = [
		{ header: 'Year', key: 'edition.year', width: 'w-20' },
		{ header: 'Gen.', key: 'edition.generation', width: 'w-20' },
		{ header: 'Edition', key: 'edition.name', width: 'w-44' },
		{ header: 'Color', key: 'color', width: 'w-52' },
		{ header: 'Sequence #', key: 'sequence', width: 'w-36' },
		{ header: 'Owner', key: 'owner.name', width: 'w-44' },
		{ header: 'Country', key: 'location.country', width: 'w-40' },
	];

	const handleSort = (key: string) => (e: React.MouseEvent) => {
		e.preventDefault();
		onSort(key);
	};

	return (
		<div className="bg-white rounded-md border border-brg-light text-brg overflow-hidden h-full">
			<div className="overflow-auto h-[calc(100vh-332px)] relative">
				<table className="min-w-full border-collapse">
					<thead>
						<tr className="bg-brg-light sticky top-0 z-10">
							{columns.map(({ header, key, width }) => (
								<th
									key={header}
									className={`${width} px-4 py-3 text-left text-xs font-semibold text-brg cursor-pointer border-b border-brg-light bg-brg-light`}
									onClick={handleSort(key)}
								>
									<div className="flex items-center">
										{header}
										<span
											className={`ml-1 ${
												sortColumn === key
													? 'opacity-100'
													: 'opacity-0'
											}`}
										>
											{sortDirection === 'asc'
												? '↑'
												: '↓'}
										</span>
									</div>
								</th>
							))}
						</tr>
					</thead>

					<tbody className="divide-y divide-brg-light text-xs">
						{isLoading ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-4 py-3 text-xs text-brg-border"
								>
									Loading...
								</td>
							</tr>
						) : cars.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-4 py-3 text-xs text-brg-mid"
								>
									No matches found
								</td>
							</tr>
						) : (
							cars.map((car) => (
								<tr
									key={car.id}
									className="bg-white hover:bg-brg-light/25 transition-colors cursor-pointer"
									onClick={(e) => {
										if (
											!(e.target as HTMLElement).closest(
												'a'
											)
										) {
											if (e.metaKey || e.ctrlKey) {
												window.open(
													`/registry/${car.id}`,
													'_blank'
												);
											} else {
												navigate(`/registry/${car.id}`);
											}
										}
									}}
								>
									<td className="px-4 py-3 whitespace-nowrap font-mono">
										<div className="pointer-events-auto">
											{car.edition.year}
										</div>
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										{car.edition.generation}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										{car.edition.name}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										<div className="flex items-center gap-2">
											<span
												className="w-4 h-3 rounded-sm inline-block"
												style={{
													backgroundColor:
														colorMap[
															car.edition.color?.toLowerCase() ||
																''
														] || '#DDD',
												}}
											/>
											{car.edition.color}
										</div>
									</td>
									<td className="flex justify-between px-4 py-3 whitespace-nowrap font-mono max-w-40">
										{car.sequence && (
											<>
												{car.sequence.toLocaleString()}
												{car.edition.totalProduced && (
													<span className="text-brg-border">
														of{' '}
														{car.edition.totalProduced.toLocaleString()}
													</span>
												)}
											</>
										)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										{car.owner ? (
											<Link
												to={`/owner/${car.owner.id}`}
												className="hover:underline relative z-0"
											>
												{car.owner.name}
											</Link>
										) : (
											<Link
												to={`/claim/${car.id}`}
												className="text-brg-border hover:text-brg hover:underline relative z-0"
											>
												Claim
											</Link>
										)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										{car.owner.location && (
											<span className="flex items-center gap-2">
												<img
													src={`https://flagcdn.com/16x12/${car.owner.location.country.toLowerCase()}.png`}
													alt={`${car.owner.location.country} flag`}
													className="w-4 h-3"
												/>
												{new Intl.DisplayNames(['en'], {
													type: 'region',
												}).of(
													car.owner.location.country
												)}
											</span>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
