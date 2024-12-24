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

import { useMemo } from 'react';

type EditionStatsProps = {
	totalProduced?: number;
	showText?: boolean;
};

export const EditionStats = ({
	totalProduced = 0,
	showText = true,
}: EditionStatsProps) => {
	const stats = useMemo(() => {
		const totalInRegistry = Math.floor(totalProduced * 0.6);
		const totalClaimed = Math.floor(totalInRegistry * 0.4);

		return {
			totalClaimed,
			totalInRegistry,
			registeredPercentage: (totalInRegistry / totalProduced) * 100,
			claimedPercentage: (totalClaimed / totalInRegistry) * 100,
		};
	}, [totalProduced]);

	return (
		<div className="w-full">
			<div className="text-sm text-brg-mid space-y-2">
				{showText && (
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
									stats.totalInRegistry - stats.totalClaimed
								).toLocaleString()}
							</span>{' '}
							in Registry
						</span>

						<span>
							<span className="font-bold">
								{totalProduced.toLocaleString()}
							</span>{' '}
							Produced
						</span>
					</div>
				)}

				<div className="w-full h-2 bg-brg-light rounded-full overflow-hidden">
					<div className="h-full flex">
						<div
							className="bg-brg-mid h-full"
							style={{ width: `${stats.claimedPercentage}%` }}
						/>
						<div
							className="bg-brg-border h-full"
							style={{
								width: `${stats.registeredPercentage - stats.claimedPercentage}%`,
							}}
						/>
						<div
							className="bg-brg-light h-full"
							style={{
								width: `${100 - stats.registeredPercentage}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
