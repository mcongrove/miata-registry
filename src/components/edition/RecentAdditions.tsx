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
import { useModal } from '../../context/ModalContext';
import { hasSequence } from '../../utils/car';
import { getCountryDisplayName } from '../../utils/location';
import { Button } from '../Button';
import { Chip } from '../rarity/Chip';

export type RecentEditionCar = {
	id: string;
	sequence?: number | null;
	destroyed?: boolean | null;
	rarity_score?: number | null;
	vin?: string | null;
	current_owner?: {
		name?: string | null;
		country?: string | null;
	} | null;
};

type RecentAdditionsProps = {
	cars: RecentEditionCar[];
	editionLabel: string;
	totalProduced?: number | null;
	viewAllTo: string;
};

export const RecentAdditions = ({
	cars,
	editionLabel,
	totalProduced,
	viewAllTo,
}: RecentAdditionsProps) => {
	const navigate = useNavigate();
	const { openModal } = useModal();

	const openRegister = () => {
		openModal('register', {
			prefilledData: {
				edition_name: editionLabel,
			},
		});
	};

	if (cars.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-brg-light bg-brg-light/50 px-8 py-16 lg:min-h-[480px] text-center">
				<div className="flex flex-col gap-2 max-w-sm">
					<h2 className="text-xl font-bold text-brg">
						Be the first to add your {editionLabel}
					</h2>
					<p className="text-sm text-brg-mid">
						No cars from this edition are in the registry yet. Help
						document it for the community.
					</p>
				</div>
				<Button withArrow onClick={openRegister}>
					Add your Miata
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-sm font-semibold text-brg">
					Recent Additions
				</h2>
				<Link
					to={viewAllTo}
					className="group flex items-center gap-1 text-sm text-brg-mid hover:text-brg"
				>
					View All
					<span className="transition-transform group-hover:translate-x-0.5">
						→
					</span>
				</Link>
			</div>

			<div className="bg-white rounded-md border border-brg-light text-brg overflow-hidden max-h-[640px]">
				<div className="overflow-auto h-full">
					<table className="min-w-full border-collapse">
						<thead>
							<tr className="bg-brg-light sticky top-0 z-10">
								<th className="px-3 py-2 text-left text-xs font-semibold text-brg border-b border-brg-light whitespace-nowrap">
									Sequence #
								</th>
								<th className="px-3 py-2 text-left text-xs font-semibold text-brg border-b border-brg-light whitespace-nowrap">
									Rarity
								</th>
								<th className="px-3 py-2 text-left text-xs font-semibold text-brg border-b border-brg-light whitespace-nowrap">
									Owner
								</th>
								<th className="px-3 py-2 text-left text-xs font-semibold text-brg border-b border-brg-light whitespace-nowrap">
									Country
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-brg-light text-xs">
							{cars.map((car) => (
								<tr
									key={car.id}
									className="bg-white hover:bg-brg-light/25 transition-colors cursor-pointer"
									onClick={(e) => {
										if (
											!(e.target as HTMLElement).closest(
												'button'
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
									<td className="px-3 py-2 whitespace-nowrap font-mono">
										{hasSequence(car.sequence) ? (
											<div className="flex items-center gap-1.5">
												<span
													className={
														car.destroyed
															? 'line-through text-brg-mid'
															: undefined
													}
												>
													{car.sequence?.toLocaleString()}
												</span>
												{totalProduced != null && (
													<span className="text-brg-border">
														of{' '}
														{totalProduced.toLocaleString()}
													</span>
												)}
											</div>
										) : (
											<span className="text-brg-border">
												Unknown
											</span>
										)}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{car.destroyed ? (
											<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
												Destroyed
											</span>
										) : (
											<Chip
												score={car.rarity_score ?? 0}
											/>
										)}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{car.current_owner?.name ? (
											car.current_owner.name
										) : (
											<button
												type="button"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();

													openModal('register', {
														prefilledData: {
															edition_name:
																editionLabel,
															id: car.id,
															sequence:
																car.sequence?.toString() ||
																'',
															vin: car.vin || '',
														},
													});
												}}
												className="text-brg-border hover:text-brg hover:underline"
											>
												Claim
											</button>
										)}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										{car.current_owner?.country ? (
											<span className="flex items-center gap-2">
												<img
													src={`https://flagcdn.com/16x12/${car.current_owner.country.toLowerCase()}.png`}
													alt={
														car.current_owner
															.country
													}
													className="w-4 h-3"
												/>
												{getCountryDisplayName(
													car.current_owner.country
												)}
											</span>
										) : (
											<span className="text-brg-border">
												Unknown
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-brg-light bg-brg-light/50 px-4 py-3">
				<div>
					<p className="text-sm font-semibold text-brg">
						Add your {editionLabel}
					</p>
					<p className="text-xs text-brg-mid">
						Own one? Get it into the registry.
					</p>
				</div>
				<Button
					withArrow
					className="text-xs shrink-0"
					onClick={openRegister}
				>
					Add yours
				</Button>
			</div>
		</div>
	);
};
