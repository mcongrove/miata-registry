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

import { useClerk } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export const ClerkMyCars = ({
	cars,
}: {
	cars: Array<{
		id: string;
		year: number;
		edition: string;
		sequence: number | null;
		vin: string | null;
		destroyed: boolean;
	}>;
}) => {
	const { closeUserProfile } = useClerk();

	if (cars.length === 0) {
		return (
			<p className="text-[#B6B6B6] text-[13px]">
				You haven't claimed any cars yet.
			</p>
		);
	}

	return (
		<>
			{cars.map((car) => (
				<Link
					key={car.id}
					to={`/registry/${car.id}`}
					className={twMerge(
						'text-[13px] group flex flex-col cursor-pointer mb-1 py-1.5 px-2.5 -mx-2.5 rounded-md hover:bg-[#F7F7F7] transition-colors',
						car.destroyed ? 'text-[#EF4444]' : 'text-[#212126]'
					)}
					onClick={() => closeUserProfile()}
				>
					<div className="flex items-center gap-1">
						<span
							className={twMerge(
								'whitespace-nowrap',
								car.destroyed ? 'line-through' : ''
							)}
						>
							{car.year} {car.edition}
							{car.sequence ? ` #${car.sequence}` : ''}
						</span>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							stroke="#2F3037"
							viewBox="0 0 20 20"
							className="size-4 group-hover:opacity-50 opacity-0 -translate-x-2 group-hover:translate-x-0 transition-all"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3.3 10h13.4m-5-5 5 5-5 5"
							></path>
						</svg>
					</div>

					<div
						className={twMerge(
							'w-fit',
							car.destroyed
								? 'text-[#747686]/50'
								: 'text-[#747686]'
						)}
					>
						{car.vin}
					</div>
				</Link>
			))}
		</>
	);
};
