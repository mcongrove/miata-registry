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

import { useEffect, useState } from 'react';
import { getEditionStats } from '../../api/Edition';

type EditionStatsProps = {
	produced?: number;
	id: string;
	showText?: boolean;
};

export const EditionStats = ({
	produced = 0,
	id,
	showText = true,
}: EditionStatsProps) => {
	const [stats, setStats] = useState({
		claimed: 0,
		inRegistry: 0,
		registeredPercentage: 0,
		claimedPercentage: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const editionStats = await getEditionStats(id);

				setStats({
					claimed: editionStats.claimed,
					inRegistry: editionStats.inRegistry,
					registeredPercentage:
						(editionStats.inRegistry / produced) * 100,
					claimedPercentage:
						(editionStats.claimed / editionStats.inRegistry) * 100,
				});
			} catch (error) {
				console.error('Error loading edition stats:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			loadStats();
		}
	}, [id, produced]);

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="text-sm text-brg-mid space-y-2">
					<div className="w-full h-2 bg-brg-light rounded-full animate-pulse" />
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="text-sm text-brg-mid space-y-2">
				{showText && (
					<div className="flex justify-between text-xs">
						<span>
							<span className="font-bold">
								{stats.claimed.toLocaleString()}
							</span>{' '}
							Claimed
						</span>

						<span>
							<span className="font-bold">
								{stats.inRegistry.toLocaleString()}
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
