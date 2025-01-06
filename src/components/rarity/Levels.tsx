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
			'Museum-worthy with exceptional provenance and preservation',
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
		icon: 'fa-star-half-stroke',
		level: 'limited-edition',
		points: 'Below 40 points',
	},
] as const;

const levelColors = {
	'historically-significant':
		'bg-yellow-100 text-yellow-800 border-yellow-300',
	'exceptionally-rare': 'bg-neutral-100 text-neutral-600 border-neutral-300',
	'very-rare': 'bg-orange-50 text-amber-700 border-orange-200',
	rare: 'bg-emerald-50 text-emerald-700 border-emerald-200',
	'limited-edition': 'bg-white text-slate-500 border-slate-300',
} as const;

const iconColors = {
	'historically-significant': 'text-yellow-500',
	'exceptionally-rare': 'text-neutral-400',
	'very-rare': 'text-amber-700',
	rare: 'text-emerald-700',
	'limited-edition': 'text-slate-400',
} as const;

export const Levels = () => {
	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-8">
			{levels.map((level, index) => (
				<div
					key={level.level}
					className={twMerge(
						levelColors[level.level],
						'rounded-lg p-6 text-center border flex flex-col items-center gap-4',
						index === levels.length - 1 &&
							'col-span-2 md:col-span-1 justify-self-center w-1/2 md:w-full'
					)}
				>
					<i
						className={twMerge(
							'fa-solid text-3xl',
							level.icon,
							iconColors[level.level]
						)}
					/>

					<div className="flex flex-col items-center gap-2 lg:gap-1">
						<h3 className="font-bold capitalize leading-tight lg:whitespace-nowrap">
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
