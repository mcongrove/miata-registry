/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
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
import { twMerge } from 'tailwind-merge';
import { useModal } from '../../context/ModalContext';
import { Chip } from '../rarity/Chip';
import { TCar } from '../../types/Car';
import { colorMap, hasSequence } from '../../utils/car';
import { getCountryDisplayName } from '../../utils/location';

interface RegistryTableProps {
	cars: TCar[];
	fetchError?: string | null;
	isFiltered: boolean;
	isLoading: boolean;
	onSort: (column: string) => void;
	sortColumn: string;
	sortDirection: 'asc' | 'desc';
}

export const RegistryTable = ({
	cars,
	fetchError = null,
	isFiltered = false,
	isLoading = false,
	onSort,
	sortColumn,
	sortDirection,
}: RegistryTableProps) => {
	const navigate = useNavigate();
	const { openModal } = useModal();

	const columns = [
		{ header: 'Year', key: 'edition.year', width: 'w-20' },
		{ header: 'Gen.', key: 'edition.generation', width: 'w-20' },
		{ header: 'Edition', key: 'edition.name', width: 'w-44' },
		{
			header: 'Color',
			key: 'color',
			width: 'w-52',
			sortable: false,
		},
		{ header: 'Sequence #', key: 'sequence', width: 'w-36' },
		{ header: 'Rarity', key: 'rarity_score', width: 'w-40' },
		{ header: 'Owner', key: 'owner.name', width: 'w-44' },
		{ header: 'Country', key: 'owner.country', width: 'w-40' },
	];

	const handleSort = (key: string) => (e: React.MouseEvent) => {
		e.preventDefault();

		onSort(key);
	};

	return (
		<div
			className={twMerge(
				'bg-white rounded-md border border-brg-light text-brg overflow-hidden',
				isFiltered
					? 'lg:h-[calc(100vh_-_280px)]'
					: 'lg:h-[calc(100vh_-_236px)]'
			)}
		>
			<div className="overflow-auto h-full relative">
				<table className="min-w-full border-collapse">
					<thead>
						<tr className="bg-brg-light sticky top-0 z-10">
							{columns.map(
								({ header, key, width, sortable = true }) => (
									<th
										key={header}
										className={twMerge(
											width,
											'px-4 py-3 text-left text-xs font-semibold text-brg border-b border-brg-light bg-brg-light whitespace-nowrap',
											sortable
												? 'cursor-pointer'
												: 'cursor-default'
										)}
										onClick={
											sortable
												? handleSort(key)
												: undefined
										}
									>
										<div className="flex items-center">
											{header}
											{sortable ? (
												<span
													className={`ml-1 ${
														sortColumn &&
														sortColumn === key
															? 'opacity-100'
															: 'opacity-0'
													}`}
												>
													{sortDirection === 'asc'
														? '↑'
														: '↓'}
												</span>
											) : null}
										</div>
									</th>
								)
							)}
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
						) : fetchError ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-4 py-8 text-center"
								>
									<div className="flex flex-col items-center gap-2">
										<i className="fa-solid fa-exclamation-triangle text-2xl text-red-500" />
										<p className="text-red-700 text-sm">
											{fetchError}
										</p>
										<button
											type="button"
											onClick={() =>
												window.location.reload()
											}
											className="text-sm text-brg hover:underline"
										>
											Try again
										</button>
									</div>
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
							cars.map((car) => {
								const displayColor =
									car.color || car.edition?.color || '';
								const isVarious =
									displayColor.toLowerCase() === 'various';

								return (
									<tr
										key={car.id}
										className="bg-white hover:bg-brg-light/25 transition-colors cursor-pointer"
										onClick={(e) => {
											if (
												!(
													e.target as HTMLElement
												).closest('a')
											) {
												if (e.metaKey || e.ctrlKey) {
													window.open(
														`/registry/${car.id}`,
														'_blank'
													);
												} else {
													navigate(
														`/registry/${car.id}`
													);
												}
											}
										}}
									>
										<td className="px-4 py-3 whitespace-nowrap font-mono">
											<div className="pointer-events-auto">
												{car.edition?.year}
											</div>
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{car.edition?.generation}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<Link
												to={`/registry/${car.id}`}
												className="text-brg hover:underline"
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												{car.edition?.name}
											</Link>
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<span
													className={twMerge(
														'inline-block h-3 w-4 rounded-sm',
														isVarious
															? 'bg-gradient-to-r from-red-500 from-10% via-sky-500 via-50% to-purple-500 to-90%'
															: ''
													)}
													style={
														isVarious
															? undefined
															: {
																	backgroundColor:
																		colorMap[
																			displayColor.toLowerCase()
																		] ||
																		'#CCCCCC',
																}
													}
												/>
												{displayColor}
											</div>
										</td>
										{hasSequence(car.sequence) ? (
											<td className="px-4 py-3 whitespace-nowrap font-mono max-w-40">
												<div className="flex items-center justify-between gap-2">
													<span
														className={
															car.destroyed
																? 'line-through text-brg-mid'
																: undefined
														}
													>
														{car.sequence?.toLocaleString()}
													</span>
													{car.edition
														?.total_produced && (
														<span className="text-brg-border">
															of{' '}
															{car.edition.total_produced.toLocaleString()}
														</span>
													)}
												</div>
											</td>
										) : (
											<td className="px-4 py-3 whitespace-nowrap font-mono max-w-40 text-brg-border">
												<div className="flex items-center justify-between gap-2">
													<span
														className={
															car.destroyed
																? 'line-through'
																: undefined
														}
													>
														Unknown
													</span>
													{car.edition
														?.total_produced && (
														<span>
															of{' '}
															{car.edition.total_produced.toLocaleString()}
														</span>
													)}
												</div>
											</td>
										)}
										<td className="px-4 py-3 whitespace-nowrap">
											{car.destroyed ? (
												<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
													Destroyed
												</span>
											) : (
												<Chip
													score={
														car.rarity_score ?? 0
													}
												/>
											)}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{car.current_owner?.name ? (
												car.current_owner.name
											) : (
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();

														openModal('register', {
															prefilledData: {
																edition_name: `${car.edition?.year} ${car.edition?.name}`,
																id: car.id,
																sequence:
																	car.sequence?.toString() ||
																	'',
																vin:
																	car.vin ||
																	'',
															},
														});
													}}
													className="text-brg-border hover:text-brg hover:underline relative z-0"
												>
													Claim
												</button>
											)}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{car.current_owner?.country ? (
												<span className="flex items-center gap-2">
													<img
														src={`https://flagcdn.com/16x12/${car.current_owner?.country.toLowerCase()}.png`}
														alt={
															car.current_owner
																?.country
														}
														className="w-4 h-3"
													/>
													{getCountryDisplayName(
														car.current_owner
															?.country || ''
													)}
												</span>
											) : (
												<span className="text-brg-border">
													Unknown
												</span>
											)}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
