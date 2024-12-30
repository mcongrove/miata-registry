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

interface TimelineItemProps {
	year: string;
	title: string;
	units: string;
	position: 'left' | 'right';
}

export function TimelineItem({
	year,
	title,
	units,
	position,
}: TimelineItemProps) {
	const content = (
		<>
			<p className="text-sm text-brg-mid">{year}</p>
			<div className="text-2xl font-medium text-brg">{title}</div>
			<p className="text-brg-mid">{units} units</p>
		</>
	);

	return (
		<div className="relative flex items-center">
			<div
				className={twMerge(
					'w-1/2',
					position === 'left' ? 'pr-16 text-right' : ''
				)}
			>
				{position === 'left' && content}
			</div>

			<div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-brg rounded-full" />

			<div className={`w-1/2 ${position === 'right' ? 'pl-16' : ''}`}>
				{position === 'right' && content}
			</div>
		</div>
	);
}
