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

import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useModal } from '../../context/ModalContext';
import { TCar } from '../../types/Car';
import { colorMap } from '../../utils/car';

interface RegistryTableProps {
	cars: TCar[];
	isFiltered: boolean;
	isLoading: boolean;
	onSort: (column: string) => void;
	sortColumn: string;
	sortDirection: 'asc' | 'desc';
}

export const RegistryTable = ({
	cars,
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
		{ header: 'Color', key: 'edition.color', width: 'w-52' },
		{ header: 'Sequence #', key: 'sequence', width: 'w-36' },
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
							{columns.map(({ header, key, width }) => (
								<th
									key={header}
									className={twMerge(
										width,
										'px-4 py-3 text-left text-xs font-semibold text-brg cursor-pointer border-b border-brg-light bg-brg-light whitespace-nowrap'
									)}
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
											{car.edition?.year}
										</div>
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										{car.edition?.generation}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										{car.edition?.name}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										<div className="flex items-center gap-2">
											<span
												className={twMerge(
													`w-4 h-3 rounded-sm inline-block`,
													car.edition?.color?.toLowerCase() ===
														'various'
														? 'bg-gradient-to-r from-red-500 from-10% via-sky-500 via-50% to-purple-500 to-90%'
														: ''
												)}
												style={{
													backgroundColor:
														car.edition?.color?.toLowerCase() !==
														'various'
															? colorMap[
																	car.edition?.color?.toLowerCase() ||
																		''
																] || '#CCCCCC'
															: undefined,
												}}
											/>
											{car.edition?.color}
										</div>
									</td>
									{car.sequence !== null ? (
										<td className="flex justify-between px-4 py-3 whitespace-nowrap font-mono max-w-40">
											{car.sequence?.toLocaleString()}
											{car.edition?.total_produced && (
												<span className="text-brg-border">
													of{' '}
													{car.edition.total_produced.toLocaleString()}
												</span>
											)}
										</td>
									) : (
										<td className="flex justify-between px-4 py-3 whitespace-nowrap font-mono max-w-40 text-brg-border">
											Unknown{' '}
											{car.edition?.total_produced && (
												<span>
													of{' '}
													{car.edition.total_produced.toLocaleString()}
												</span>
											)}
										</td>
									)}
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
															vin: car.vin || '',
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
												{new Intl.DisplayNames(['en'], {
													type: 'region',
												}).of(
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
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
