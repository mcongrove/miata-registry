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

type ScoreRow = {
	condition: React.ReactNode;
	points: string;
};

type ScoreCardProps = {
	className?: string;
	rows: ScoreRow[];
	title: React.ReactNode;
};

export const ScoreCard = ({ className, rows, title }: ScoreCardProps) => {
	return (
		<div
			className={twMerge(
				'flex flex-col rounded-lg border border-brg-light overflow-hidden',
				className
			)}
		>
			<h3 className="bg-brg-light py-3 px-4 text-base font-bold text-brg">
				{title}
			</h3>

			<div className="divide-y divide-brg-light">
				{rows.map((row, index) => (
					<div
						key={index}
						className="flex justify-between items-center py-3 px-4 text-xs hover:bg-brg-light/20"
					>
						<div className="text-brg-mid">{row.condition}</div>

						<div className="text-brg">{row.points}</div>
					</div>
				))}
			</div>
		</div>
	);
};
