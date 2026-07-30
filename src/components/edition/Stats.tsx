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

import { TEdition } from '../../types/Edition';

type StatsProps = {
	edition: TEdition;
	showText?: boolean;
};

export const Stats = ({ edition, showText = true }: StatsProps) => {
	const produced = edition.total_produced ?? 0;
	const claimed = edition.claimed ?? 0;
	const inRegistry = edition.in_registry ?? 0;

	const claimedPercentage = produced > 0 ? (claimed / produced) * 100 : 0;
	const inRegistryPercentage =
		produced > 0 ? (inRegistry / produced) * 100 : 0;

	return (
		<div className="w-full">
			<div className="text-sm text-brg-mid space-y-2">
				{showText && (
					<div className="flex justify-between text-xs">
						<span>
							<span className="font-bold">
								{claimed.toLocaleString()}
							</span>{' '}
							Claimed
						</span>

						<span>
							<span className="font-bold">
								{inRegistry.toLocaleString()}
							</span>{' '}
							in Registry
						</span>

						<span>
							<span className="font-bold">
								{produced.toLocaleString()}
							</span>{' '}
							Produced
						</span>
					</div>
				)}

				<div className="w-full h-2 bg-brg-light rounded-full overflow-hidden">
					<div className="relative h-full flex">
						<div
							className="absolute top-0 left-0 bg-brg h-full z-20 min-w-2 rounded-full"
							style={{ width: `${claimedPercentage}%` }}
						/>

						<div
							className="absolute top-0 left-0 bg-brg-mid/50 h-full z-10 min-w-2 rounded-full"
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
