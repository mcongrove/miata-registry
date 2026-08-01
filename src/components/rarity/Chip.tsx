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

import type { TRarityLevel } from '../../types/Car';
import { Link } from 'react-router-dom';
import {
	formatRarityLevelLabel,
	getEditionRarityLevelFromScore,
	getRarityLevelFromScore,
} from '../../utils/rarityScore';

const rarityColors: Record<
	TRarityLevel,
	{ bg: string; border: string; text: string }
> = {
	'historically-significant': {
		bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
		text: '!text-yellow-800',
		border: 'border-yellow-300',
	},
	'exceptionally-rare': {
		bg: 'bg-gradient-to-r from-neutral-200 to-zinc-100',
		text: '!text-neutral-800',
		border: 'border-neutral-300',
	},
	'very-rare': {
		bg: 'bg-gradient-to-r from-orange-100 to-amber-50',
		text: '!text-orange-800',
		border: 'border-orange-200',
	},
	rare: {
		bg: 'bg-gradient-to-r from-emerald-100 to-green-50',
		text: '!text-emerald-800',
		border: 'border-emerald-200',
	},
	'limited-edition': {
		bg: 'bg-brg-light',
		text: '!text-brg',
		border: 'border-brg-border',
	},
};

type ChipProps = {
	score: number;
	/** Edition chips classify with a +11 original-specimen offset. */
	scope?: 'car' | 'edition';
};

export const Chip = ({ score, scope = 'car' }: ChipProps) => {
	const numericScore = Number(score);
	const level =
		scope === 'edition'
			? getEditionRarityLevelFromScore(numericScore)
			: getRarityLevelFromScore(numericScore);

	if (!level) return null;
	const colors = rarityColors[level];

	return (
		<Link
			to={`/rarity`}
			className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
		>
			{formatRarityLevelLabel(level)}
		</Link>
	);
};
