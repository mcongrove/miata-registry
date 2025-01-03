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

import { twMerge } from 'tailwind-merge';
import { TModerationStats } from '../../types/Common';

type StatsProps = {
	stats: TModerationStats;
};

export const Stats = ({ stats }: StatsProps) => {
	const total = stats.pending + stats.approved + stats.rejected;
	const pendingPercentage = (stats.pending / total) * 100;
	const approvedPercentage = (stats.approved / total) * 100;

	return (
		<div className="w-full">
			<div className="w-full h-2 bg-brg-light rounded-full overflow-hidden">
				<div className="relative h-full flex">
					<div
						className="absolute top-0 left-0 bg-yellow-400 h-full z-20 rounded-full"
						style={{ width: `${pendingPercentage}%` }}
					/>

					<div
						className="absolute top-0 left-0 bg-green-500 h-full z-10 rounded-full"
						style={{
							width: `${pendingPercentage + approvedPercentage}%`,
						}}
					/>

					<div
						className={twMerge(
							'absolute top-0 left-0 bg-red-500 w-full h-full z-0 rounded-full',
							total > 0 ? 'bg-red-500' : 'bg-brg-light'
						)}
					/>
				</div>
			</div>
		</div>
	);
};
