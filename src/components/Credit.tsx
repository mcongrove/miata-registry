/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
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
	showEdition?: boolean;
}

interface CarSummary {
	current_owner?: {
		country: string;
		name: string;
		state: string;
	};
	editionName?: string;
	year?: number;
}

/** Match rarity Chip: text-xs + py-1 + 1px border. */
const CREDIT_HEIGHT = 'h-[calc(1rem+0.5rem+2px)]';

function creditLabel(car: CarSummary, showEdition: boolean): string | null {
	const parts: string[] = [];

	if (showEdition && car.year != null && car.editionName) {
		parts.push(`${car.year} ${car.editionName}`);
	}

	if (car.current_owner?.name) {
		parts.push(car.current_owner.name);
	}

	if (car.current_owner?.country) {
		parts.push(
			formatLocation(
				{
					state: car.current_owner.state,
					country: car.current_owner.country,
				},
				true
			)
		);
	}

	if (parts.length === 0) return null;

	return parts.join(' • ');
}

const CreditText = ({
	car,
	direction,
	expanded,
	showEdition,
}: {
	car: CarSummary | null;
	direction: 'left' | 'right';
	expanded?: boolean;
	showEdition: boolean;
}) => {
	const label = car ? creditLabel(car, showEdition) : null;

	return (
		<div
			className={twMerge(
				'flex items-center overflow-hidden bg-white border border-white w-0 group-hover:w-auto z-10',
				expanded && 'w-auto',
				CREDIT_HEIGHT,
				direction === 'left'
					? 'rounded-l-full -mr-3 border-r-0'
					: 'rounded-r-full -ml-3 border-l-0'
			)}
		>
			{label && (
				<div
					className={twMerge(
						'text-brg text-xs font-medium whitespace-nowrap leading-4',
						direction === 'left' ? 'pr-3 pl-2.5' : 'pl-3 pr-2.5'
					)}
				>
					<p>{label}</p>
				</div>
			)}
		</div>
	);
};

export const Credit = ({
	className,
	direction = 'right',
	id,
	showEdition = false,
}: CreditProps) => {
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
				'group flex items-center',
				CREDIT_HEIGHT,
				className
			)}
		>
			{direction === 'left' && (
				<CreditText
					car={car}
					direction={direction}
					expanded={isExpanded}
					showEdition={showEdition}
				/>
			)}

			<div
				className={twMerge(
					'flex items-center justify-center bg-white rounded-full z-20 relative text-xs border border-white aspect-square',
					CREDIT_HEIGHT
				)}
			>
				<i className="fa-solid fa-car"></i>
			</div>

			{direction === 'right' && (
				<CreditText
					car={car}
					direction={direction}
					expanded={isExpanded}
					showEdition={showEdition}
				/>
			)}
		</Link>
	);
};
