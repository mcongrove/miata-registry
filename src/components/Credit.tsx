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
import { twMerge } from 'tailwind-merge';
import { formatLocation } from '../utils/location';

interface CreditProps {
	className?: string;
	direction?: 'left' | 'right';
	id: string;
}

interface CarSummary {
	current_owner?: {
		country: string;
		name: string;
		state: string;
	};
	editionName: string;
	sequence?: number;
	year: number;
}

const CreditText = ({
	car,
	direction,
}: {
	car: CarSummary | null;
	direction: 'left' | 'right';
}) => (
	<div
		className={twMerge(
			'flex items-center overflow-hidden bg-white w-0 h-10 z-10 group-hover:w-auto',
			direction === 'left'
				? 'rounded-l-full -mr-5'
				: 'rounded-r-full -ml-5'
		)}
	>
		<div
			className={twMerge(
				'text-brg py-2',
				direction === 'left' ? 'pr-5 pl-4' : 'pl-5 pr-4',
				'whitespace-nowrap text-[10px]'
			)}
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

export const Credit = ({ className, direction = 'right', id }: CreditProps) => {
	const [car, setCar] = useState<CarSummary | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);

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

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			if (!target.closest(`[data-credit-id="${id}"]`)) {
				setIsExpanded(false);
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => document.removeEventListener('click', handleClickOutside);
	}, [id]);

	const handleClick = (e: React.MouseEvent) => {
		if (window.matchMedia('(hover: none)').matches) {
			if (!isExpanded) {
				e.preventDefault();

				setIsExpanded(true);
			}
		}
	};

	return (
		<Link
			to={`/registry/${id}`}
			onClick={handleClick}
			data-credit-id={id}
			className={twMerge(
				'group flex items-center h-10 opacity-60 hover:opacity-100',
				isExpanded ? 'opacity-100' : '',
				className
			)}
		>
			{direction === 'left' && (
				<CreditText car={car} direction={direction} />
			)}

			<div className="flex items-center justify-center bg-white size-10 rounded-full z-20 relative">
				<i className="fa-solid fa-car"></i>
			</div>

			{direction === 'right' && (
				<CreditText car={car} direction={direction} />
			)}
		</Link>
	);
};
