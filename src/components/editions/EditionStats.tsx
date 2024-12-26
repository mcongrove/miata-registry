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

import { TEdition } from '../../types/Edition';

type EditionStatsProps = {
	edition: TEdition;
	showText?: boolean;
};

export const EditionStats = ({
	edition,
	showText = true,
}: EditionStatsProps) => {
	const inRegistryPercentage = Math.max(
		(edition.in_registry ?? 0 / (edition.total_produced ?? 0)) * 100,
		3
	);
	const claimedPercentage = Math.max(
		(edition.claimed ?? 0 / (edition.total_produced ?? 0)) * 100,
		3
	);

	return (
		<div className="w-full">
			<div className="text-sm text-brg-mid space-y-2">
				{showText && (
					<div className="flex justify-between text-xs">
						<span>
							<span className="font-bold">
								{edition.claimed?.toLocaleString()}
							</span>{' '}
							Claimed
						</span>

						<span>
							<span className="font-bold">
								{edition.in_registry?.toLocaleString()}
							</span>{' '}
							in Registry
						</span>

						<span>
							<span className="font-bold">
								{edition.total_produced?.toLocaleString()}
							</span>{' '}
							Produced
						</span>
					</div>
				)}

				<div className="w-full h-2 bg-brg-light rounded-full overflow-hidden">
					<div className="relative h-full flex">
						<div
							className="absolute top-0 left-0 bg-brg-mid h-full z-20 rounded-r-full"
							style={{ width: `${claimedPercentage}%` }}
						/>

						<div
							className="absolute top-0 left-0 bg-brg-border h-full z-10 rounded-r-full"
							style={{
								width: `${inRegistryPercentage}%`,
							}}
						/>

						<div className="absolute top-0 left-0 bg-brg-light w-full h-full z-0" />
					</div>
				</div>
			</div>
		</div>
	);
};
