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
import { Link } from 'react-router-dom';
import { formatLocation } from '../utils/geo';

interface CreditProps {
	className?: string;
	id: string;
	direction?: 'left' | 'right';
}

interface CarSummary {
	year: number;
	editionName: string;
	sequence?: number;
	current_owner?: {
		name: string;
		state: string;
		country: string;
	};
}

const CreditText = ({
	car,
	direction,
}: {
	car: CarSummary | null;
	direction: 'left' | 'right';
}) => (
	<div
		className={`flex items-center overflow-hidden bg-white w-0 h-10 z-10 group-hover:w-auto ${direction === 'left' ? 'rounded-l-full -mr-5' : 'rounded-r-full -ml-5'}`}
	>
		<div
			className={`text-brg py-2 ${direction === 'left' ? 'pr-5 pl-4' : 'pl-5 pr-4'} whitespace-nowrap text-[10px]`}
		>
			<p>
				{car?.year} {car?.editionName}
				{car?.sequence && ` #${car.sequence}`}
			</p>

			{car?.current_owner && (
				<p>
					{car.current_owner.name}
					{car.current_owner.country &&
						` • ${formatLocation(
							{
								state: car.current_owner.state,
								country: car.current_owner.country,
							},
							true
						)}`}
				</p>
			)}
		</div>
	</div>
);

export const Credit = ({ className, id, direction = 'right' }: CreditProps) => {
	const [car, setCar] = useState<CarSummary | null>(null);

	useEffect(() => {
		const loadCar = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${id}/summary`
				);

				if (!response.ok) {
					if (response.status === 404) {
						setCar(null);

						return;
					}
					throw new Error('Failed to fetch car summary');
				}

				const data = await response.json();

				setCar(data);
			} catch (error) {
				console.error('Error loading car summary:', error);
				setCar(null);
			}
		};

		loadCar();
	}, [id]);

	return (
		<Link
			to={`/registry/${id}`}
			className={`group flex items-center h-10 opacity-60 hover:opacity-100 ${className}`}
		>
			{direction === 'left' && (
				<CreditText car={car} direction={direction} />
			)}

			<div className="bg-white p-3 rounded-full z-20 relative">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="size-4 text-brg"
					viewBox="0 0 512 512"
				>
					<path d="M135.2 117.4L109.1 192l293.8 0-26.1-74.6C372.3 104.6 360.2 96 346.6 96L165.4 96c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32l181.2 0c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2l0 144 0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L96 400l0 48c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-48L0 256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
				</svg>
			</div>

			{direction === 'right' && (
				<CreditText car={car} direction={direction} />
			)}
		</Link>
	);
};
