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
	dateRange?: string | React.ReactNode;
	isActive?: boolean;
	isDestroyed?: boolean;
	location?: string;
	name?: string | React.ReactNode;
	showConnector?: boolean;
}

export const TimelineItem = ({
	dateRange,
	isActive = false,
	isDestroyed = false,
	location,
	name,
	showConnector = true,
}: TimelineItemProps) => {
	return (
		<div className="relative flex gap-6">
			<div className="relative">
				<div
					className={twMerge(
						'size-3 rounded-full mt-1.5 relative z-10',
						isActive ? 'bg-brg' : 'bg-brg-border'
					)}
				/>
				<div
					className={twMerge(
						'absolute w-0.5 bg-brg-light top-3 left-[5px]',
						showConnector ? 'h-full' : 'h-0'
					)}
				/>
			</div>

			<div
				className={twMerge(
					'space-y-0.5 flex-1',
					showConnector ? 'pb-3 lg:pb-6' : ''
				)}
			>
				<p
					className={twMerge(
						'font-medium text-brg-mid',
						!name && 'text-brg-border',
						isActive && 'text-brg',
						isDestroyed && 'text-red-700'
					)}
				>
					{name || 'Unknown'}
				</p>

				{dateRange && (
					<p className="text-xs text-brg-mid">{dateRange}</p>
				)}

				{location && <p className="text-xs text-brg-mid">{location}</p>}
			</div>
		</div>
	);
};

export default TimelineItem;
