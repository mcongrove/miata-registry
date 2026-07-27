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

import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from '../Tooltip';
import { TCar } from '../../types/Car';
import {
	attestationsFromCar,
	buildOwnerRarityBreakdownLines,
	computeFullRarityBreakdown,
} from '../../utils/rarityScore';

type RarityScoreBreakdownTooltipProps = {
	car: TCar;
	children: ReactNode;
};

function ItemRow({
	label,
	points,
	striped,
	leading,
}: {
	label: string;
	points: number;
	striped?: boolean;
	leading?: boolean;
}) {
	return (
		<div
			className={twMerge(
				'-mx-3 flex justify-between gap-4 px-3 py-2',
				leading && 'pt-0',
				striped && 'bg-brg-light/50'
			)}
		>
			<span className="text-brg min-w-0">{label}</span>
			<span className="text-brg-mid shrink-0">+{points}</span>
		</div>
	);
}

export function RarityScoreBreakdownTooltip({
	car,
	children,
}: RarityScoreBreakdownTooltipProps) {
	const breakdown = useMemo(() => {
		const editionYear = car.edition?.year;

		if (editionYear == null || car.destroyed) return null;

		const attestations = attestationsFromCar(car);
		const input = {
			attestations,
			destroyed: car.destroyed,
			editionBase: car.edition?.rarity_score ?? 0,
			editionYear,
			mileage: car.mileage ?? null,
			ownerHistory: car.owner_history ?? [],
		};

		return {
			...computeFullRarityBreakdown(input),
			ownerLines: buildOwnerRarityBreakdownLines(input),
		};
	}, [car]);

	if (!breakdown || breakdown.total <= 0) {
		return <>{children}</>;
	}

	const ageLabel =
		breakdown.age === 1 ? '1 year' : `${breakdown.age} years`;

	const lineRows: { key: string; label: string; points: number }[] = [];

	if (breakdown.editionBase > 0) {
		lineRows.push({
			key: 'edition',
			label: car.edition?.name
				? `${car.edition.year} ${car.edition.name}`
				: 'Edition Base',
			points: breakdown.editionBase,
		});
	}

	if (breakdown.age > 0) {
		lineRows.push({
			key: 'age',
			label: `Age (${ageLabel})`,
			points: breakdown.age,
		});
	}

	for (const line of breakdown.ownerLines) {
		lineRows.push({
			key: `${line.category ?? ''}-${line.detail}`,
			label: line.detail,
			points: line.points,
		});
	}

	const content = (
		<div className="flex flex-col text-xs font-normal normal-case tracking-normal">
			<div className="flex flex-col">
				{lineRows.map((row, index) => (
					<ItemRow
						key={row.key}
						label={row.label}
						points={row.points}
						striped={index % 2 === 1}
						leading={index === 0}
					/>
				))}

				<div className="-mx-3 flex justify-between gap-4 px-3 pt-2 pb-0 font-medium text-brg">
					<span>Total</span>
					<span>{breakdown.total} points</span>
				</div>
			</div>

			<hr className="-mx-3 my-2 border-0 border-t border-brg-light" />

			<Link to="/rarity" className="text-brg-mid underline hover:text-brg">
				How scoring works
			</Link>
		</div>
	);

	return (
		<Tooltip
			variant="light"
			interactive
			showArrow={false}
			placement="bottom-start"
			className="px-3 pt-2.5 pb-2.5 max-w-[17rem] text-left"
			content={content}
		>
			{children}
		</Tooltip>
	);
}
