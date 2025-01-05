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

const levels = [
	{
		description:
			'Historically significant with exceptional provenance and preservation',
		icon: 'fa-crown',
		level: 'historically-significant',
		points: '100+ points',
	},
	{
		description:
			'Exceptionally preserved with documented limited production history',
		icon: 'fa-trophy',
		level: 'exceptionally-rare',
		points: '80 – 99 points',
	},
	{
		description:
			'Well-preserved with verified limited production credentials',
		icon: 'fa-medal',
		level: 'very-rare',
		points: '60 – 79 points',
	},
	{
		description:
			'Notable examples with documented limited production specifications',
		icon: 'fa-award',
		level: 'rare',
		points: '40 – 59 points',
	},
	{
		description:
			'Verified limited edition with typical features and documentation',
		icon: 'fa-star',
		level: 'limited-edition',
		points: 'Below 40 points',
	},
] as const;

const levelColors = {
	'historically-significant':
		'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300',
	'exceptionally-rare':
		'bg-gradient-to-r from-neutral-200 to-zinc-100 text-neutral-800 border-neutral-300',
	'very-rare':
		'bg-gradient-to-r from-orange-100 to-amber-50 text-orange-800 border-orange-200',
	rare: 'bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-800 border-emerald-200',
	'limited-edition': 'bg-brg-light text-brg border-brg-border',
} as const;

const iconColors = {
	'historically-significant': 'text-yellow-600',
	'exceptionally-rare': 'text-neutral-600',
	'very-rare': 'text-orange-600',
	rare: 'text-emerald-600',
	'limited-edition': 'text-brg',
} as const;

export const RarityLevels = () => {
	return (
		<div className="grid grid-cols-5 gap-8">
			{levels.map((level) => (
				<div
					key={level.level}
					className={`${levelColors[level.level]} rounded-lg p-6 text-center border flex flex-col items-center gap-4`}
				>
					<i
						className={twMerge(
							'fa-solid text-3xl',
							level.icon,
							iconColors[level.level]
						)}
					/>

					<div className="flex flex-col items-center gap-1">
						<h3 className="font-bold capitalize whitespace-nowrap">
							{level.level.replace(/-/g, ' ')}
						</h3>

						<div className="text-sm font-medium">
							{level.points}
						</div>

						<p className="text-xs opacity-75">
							{level.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};
