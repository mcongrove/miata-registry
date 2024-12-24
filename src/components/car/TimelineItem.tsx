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

interface TimelineItemProps {
	name?: string | React.ReactNode;
	dateRange?: string;
	location?: string;
	isActive?: boolean;
	showConnector?: boolean;
}

export const TimelineItem = ({
	name,
	dateRange,
	location,
	isActive = false,
	showConnector = true,
}: TimelineItemProps) => {
	return (
		<div className="relative flex gap-6">
			<div className="relative">
				<div
					className={`w-3 h-3 ${isActive ? 'bg-brg' : 'bg-brg-border'} rounded-full mt-1.5 relative z-10`}
				/>
				<div
					className={`
						absolute w-0.5 bg-brg-light top-3 left-[5px]
						${showConnector ? 'h-full' : 'h-0'}
					`}
				/>
			</div>

			<div
				className={`space-y-0.5 flex-1 ${showConnector ? 'pb-6' : ''}`}
			>
				<p className={`font-medium ${!name ? 'text-brg-border' : ''}`}>
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
