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

import { Edition } from '../../types/Edition';
import { Link } from 'react-router-dom';
import { Credit } from '../Credit';

export type EditionStats = {
	totalInRegistry: number;
	totalClaimed: number;
};

type EditionCardProps = {
	edition: Edition;
	stats: EditionStats;
};

export const EditionCard = ({ edition, stats }: EditionCardProps) => {
	const registryPercentage = edition.totalProduced
		? (stats.totalInRegistry / edition.totalProduced) * 100
		: 0;
	const claimedPercentage = edition.totalProduced
		? (stats.totalClaimed / edition.totalProduced) * 100
		: 0;

	console.log(edition);

	return (
		<Link
			to={`/registry?filter=edition:${encodeURIComponent(edition.name)}`}
			className="block bg-white hover:bg-brg-light/25 rounded-lg overflow-hidden border border-brg-light"
		>
			{edition.image && (
				<div className="aspect-video w-full overflow-hidden bg-brg-light relative">
					<img
						src={edition.image}
						alt={edition.name}
						className="w-full h-full object-cover"
						loading="lazy"
					/>

					{edition.imageCredit && (
						<div className="absolute bottom-4 right-4">
							<Credit
								car={edition.imageCredit.car}
								number={edition.imageCredit.number}
								owner={edition.imageCredit.owner}
								id={edition.imageCredit.id}
								direction="left"
							/>
						</div>
					)}
				</div>
			)}

			<div className="p-4">
				<div className="flex flex-col">
					<p className="text-xs text-brg-mid">
						{edition.year} {edition.generation}
					</p>

					<h3 className="text-lg font-semibold text-brg">
						{edition.name}
					</h3>

					<p className="text-xs text-brg-mid">{edition.color}</p>
				</div>

				<div className="mt-4">
					<div className="text-sm text-brg-mid space-y-1">
						<div className="flex justify-between text-xs">
							<span>
								<span className="font-bold">
									{stats.totalClaimed.toLocaleString()}
								</span>{' '}
								Claimed
							</span>

							<span>
								<span className="font-bold">
									{(
										stats.totalInRegistry -
										stats.totalClaimed
									).toLocaleString()}
								</span>{' '}
								In Registry
							</span>

							<span>
								<span className="font-bold">
									{edition.totalProduced?.toLocaleString()}
								</span>{' '}
								Produced
							</span>
						</div>

						<div className="w-full h-2 bg-brg-light rounded-full overflow-hidden">
							<div className="h-full flex">
								<div
									className="bg-brg-mid h-full"
									style={{ width: `${claimedPercentage}%` }}
								/>

								<div
									className="bg-brg-border h-full"
									style={{
										width: `${registryPercentage - claimedPercentage}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
