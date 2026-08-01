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

import type { TRarityLevel } from '../types/Car';

export type RarityAttestations = {
	rarity_original_paint: boolean;
	rarity_original_hardtop: boolean;
	rarity_original_softtop: boolean;
	rarity_original_wheels: boolean;
	rarity_window_sticker: boolean;
	rarity_sale_documents: boolean;
	rarity_service_records: boolean;
};

export const EMPTY_RARITY_ATTESTATIONS: RarityAttestations = {
	rarity_original_paint: false,
	rarity_original_hardtop: false,
	rarity_original_softtop: false,
	rarity_original_wheels: false,
	rarity_window_sticker: false,
	rarity_sale_documents: false,
	rarity_service_records: false,
};

export type RarityOwnerHistoryEntry = {
	date_end?: string | null;
	date_start?: string | null;
};

export type ComputeCarRarityInput = {
	attestations: RarityAttestations;
	destroyed?: boolean;
	editionYear: number;
	mileage: number | null;
	ownerHistory: RarityOwnerHistoryEntry[];
	now?: Date;
};

export type RarityScoreBreakdown = {
	age: number;
	attestations: RarityAttestations;
	carModifiers: number;
	documentation: number;
	editionBase: number;
	mileage: number;
	preservation: number;
	singleOwner: number;
	total: number;
};

export function getRarityLevelFromScore(score: number): TRarityLevel | null {
	if (!Number.isFinite(score) || score <= 0) return null;
	if (score >= 100) return 'historically-significant';
	if (score >= 80) return 'exceptionally-rare';
	if (score >= 60) return 'very-rare';
	if (score >= 40) return 'rare';
	return 'limited-edition';
}

/** Assumed complete original specimen (preservation + docs) for edition-only chips. */
export const EDITION_REFERENCE_SPECIMEN_POINTS = 21;

export function getEditionRarityLevelFromScore(
	score: number
): TRarityLevel | null {
	if (!Number.isFinite(score) || score <= 0) return null;

	return getRarityLevelFromScore(score + EDITION_REFERENCE_SPECIMEN_POINTS);
}

export function formatRarityLevelLabel(level: TRarityLevel): string {
	return level
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function yearsSinceEditionYear(
	editionYear: number,
	now: Date = new Date()
): number {
	return Math.max(0, now.getUTCFullYear() - editionYear);
}

/** Edition base + age (matches API edition cards; age is from edition year, not stored on cars). */
export function editionRarityWithAge(
	editionBase: number,
	editionYear: number,
	now: Date = new Date()
): number {
	return (editionBase ?? 0) + yearsSinceEditionYear(editionYear, now);
}

export function isOlderThanTenModelYears(
	editionYear: number,
	now: Date = new Date()
): boolean {
	return yearsSinceEditionYear(editionYear, now) > 10;
}

export function mileageRarityPoints(mileage: number | null): number {
	if (mileage == null || mileage < 0) return 0;
	if (mileage < 1_000) return 15;
	if (mileage < 5_000) return 10;
	if (mileage < 25_000) return 5;
	if (mileage < 50_000) return 2;
	return 0;
}

export function describeMileageRarityTier(
	mileage: number | null
): { detail: string; points: number } | null {
	const points = mileageRarityPoints(mileage);

	if (points === 0) return null;

	if (mileage == null || mileage < 0) return null;

	if (mileage < 1_000) {
		return { detail: 'Under 1,000 miles', points };
	}

	if (mileage < 5_000) {
		return { detail: 'Under 5,000 miles', points };
	}

	if (mileage < 25_000) {
		return { detail: 'Under 25,000 miles', points };
	}

	return { detail: 'Under 50,000 miles', points };
}

export type RarityBreakdownLine = {
	category?: string;
	detail: string;
	points: number;
};

export function buildOwnerRarityBreakdownLines(
	input: ComputeCarRarityInput
): RarityBreakdownLine[] {
	if (input.destroyed) return [];

	const now = input.now ?? new Date();
	const gated = isOlderThanTenModelYears(input.editionYear, now);
	const { attestations } = input;
	const lines: RarityBreakdownLine[] = [];

	const mileageTier = describeMileageRarityTier(input.mileage);

	if (mileageTier) {
		lines.push({
			category: 'Mileage',
			detail: mileageTier.detail,
			points: mileageTier.points,
		});
	}

	if (gated) {
		if (attestations.rarity_original_paint) {
			lines.push({
				category: 'Preservation',
				detail: 'Original Paint',
				points: 5,
			});
		}

		if (attestations.rarity_original_hardtop) {
			lines.push({
				category: 'Preservation',
				detail: 'Original Hard Top',
				points: 4,
			});
		}

		if (attestations.rarity_original_softtop) {
			lines.push({
				category: 'Preservation',
				detail: 'Original Soft Top',
				points: 3,
			});
		}

		if (attestations.rarity_original_wheels) {
			lines.push({
				category: 'Preservation',
				detail: 'Original Wheels',
				points: 3,
			});
		}

		if (attestations.rarity_window_sticker) {
			lines.push({
				category: 'Documentation',
				detail: 'Original Window Sticker',
				points: 2,
			});
		}

		if (attestations.rarity_sale_documents) {
			lines.push({
				category: 'Documentation',
				detail: 'Original Sales Documents',
				points: 2,
			});
		}

		if (attestations.rarity_service_records) {
			lines.push({
				category: 'Documentation',
				detail: 'Complete Service Records',
				points: 2,
			});
		}
	}

	if (
		gated &&
		qualifiesAsSingleOwnerSinceNew(input.editionYear, input.ownerHistory)
	) {
		lines.push({
			detail: 'Single Owner',
			points: 3,
		});
	}

	return lines;
}

export function qualifiesAsSingleOwnerSinceNew(
	editionYear: number,
	ownerHistory: RarityOwnerHistoryEntry[]
): boolean {
	if (ownerHistory.length !== 1) return false;

	const row = ownerHistory[0];

	if (row.date_end) return false;

	const dateStart = row.date_start;

	if (!dateStart) return false;

	const startYear = new Date(dateStart).getUTCFullYear();

	return startYear <= editionYear + 1;
}

export function computeCarRarityModifiers(
	input: ComputeCarRarityInput
): number {
	if (input.destroyed) return 0;

	const now = input.now ?? new Date();
	const mileage = mileageRarityPoints(input.mileage);
	const gated = isOlderThanTenModelYears(input.editionYear, now);
	const { attestations } = input;

	let preservation = 0;

	if (gated) {
		if (attestations.rarity_original_paint) preservation += 5;
		if (attestations.rarity_original_hardtop) preservation += 4;
		if (attestations.rarity_original_softtop) preservation += 3;
		if (attestations.rarity_original_wheels) preservation += 3;
	}

	let documentation = 0;

	if (gated) {
		if (attestations.rarity_window_sticker) documentation += 2;
		if (attestations.rarity_sale_documents) documentation += 2;
		if (attestations.rarity_service_records) documentation += 2;
	}

	const singleOwner =
		gated &&
		qualifiesAsSingleOwnerSinceNew(input.editionYear, input.ownerHistory)
			? 3
			: 0;

	return mileage + preservation + documentation + singleOwner;
}

export function computeDisplayRarityScore(input: {
	carModifiers: number;
	destroyed?: boolean;
	editionBase: number;
	editionYear: number;
	now?: Date;
}): RarityScoreBreakdown {
	const now = input.now ?? new Date();
	const editionBase = input.editionBase ?? 0;
	const age = input.destroyed
		? 0
		: yearsSinceEditionYear(input.editionYear, now);
	const carModifiers = input.destroyed ? 0 : input.carModifiers;
	const total = input.destroyed ? 0 : editionBase + age + carModifiers;

	return {
		age,
		attestations: EMPTY_RARITY_ATTESTATIONS,
		carModifiers,
		documentation: 0,
		editionBase,
		mileage: 0,
		preservation: 0,
		singleOwner: 0,
		total,
	};
}

export function computeFullRarityBreakdown(
	input: ComputeCarRarityInput & { editionBase: number }
): RarityScoreBreakdown {
	const now = input.now ?? new Date();
	const editionBase = input.editionBase ?? 0;

	if (input.destroyed) {
		return {
			age: 0,
			attestations: input.attestations,
			carModifiers: 0,
			documentation: 0,
			editionBase,
			mileage: 0,
			preservation: 0,
			singleOwner: 0,
			total: 0,
		};
	}

	const age = yearsSinceEditionYear(input.editionYear, now);
	const mileage = mileageRarityPoints(input.mileage);
	const gated = isOlderThanTenModelYears(input.editionYear, now);
	const { attestations } = input;

	let preservation = 0;

	if (gated) {
		if (attestations.rarity_original_paint) preservation += 5;
		if (attestations.rarity_original_hardtop) preservation += 4;
		if (attestations.rarity_original_softtop) preservation += 3;
		if (attestations.rarity_original_wheels) preservation += 3;
	}

	let documentation = 0;

	if (gated) {
		if (attestations.rarity_window_sticker) documentation += 2;
		if (attestations.rarity_sale_documents) documentation += 2;
		if (attestations.rarity_service_records) documentation += 2;
	}

	const singleOwner =
		gated &&
		qualifiesAsSingleOwnerSinceNew(input.editionYear, input.ownerHistory)
			? 3
			: 0;

	const carModifiers = mileage + preservation + documentation + singleOwner;

	return {
		age,
		attestations,
		carModifiers,
		documentation,
		editionBase,
		mileage,
		preservation,
		singleOwner,
		total: editionBase + age + carModifiers,
	};
}

export function parseAttestationsFromBody(
	body: Record<string, unknown>
): RarityAttestations {
	return {
		rarity_original_paint: body.rarity_original_paint === true,
		rarity_original_hardtop: body.rarity_original_hardtop === true,
		rarity_original_softtop: body.rarity_original_softtop === true,
		rarity_original_wheels: body.rarity_original_wheels === true,
		rarity_window_sticker: body.rarity_window_sticker === true,
		rarity_sale_documents: body.rarity_sale_documents === true,
		rarity_service_records: body.rarity_service_records === true,
	};
}

export function attestationsFromCar(
	car: Partial<RarityAttestations>
): RarityAttestations {
	return {
		rarity_original_paint: Boolean(car.rarity_original_paint),
		rarity_original_hardtop: Boolean(car.rarity_original_hardtop),
		rarity_original_softtop: Boolean(car.rarity_original_softtop),
		rarity_original_wheels: Boolean(car.rarity_original_wheels),
		rarity_window_sticker: Boolean(car.rarity_window_sticker),
		rarity_sale_documents: Boolean(car.rarity_sale_documents),
		rarity_service_records: Boolean(car.rarity_service_records),
	};
}

export function attestationsFromFormData(
	formData: FormData
): RarityAttestations {
	return {
		rarity_original_paint: formData.get('rarity_original_paint') === 'on',
		rarity_original_hardtop:
			formData.get('rarity_original_hardtop') === 'on',
		rarity_original_softtop:
			formData.get('rarity_original_softtop') === 'on',
		rarity_original_wheels: formData.get('rarity_original_wheels') === 'on',
		rarity_window_sticker: formData.get('rarity_window_sticker') === 'on',
		rarity_sale_documents: formData.get('rarity_sale_documents') === 'on',
		rarity_service_records: formData.get('rarity_service_records') === 'on',
	};
}
