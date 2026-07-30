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

import { TLocation } from '../types/Location';
import { TCarOwner } from '../types/Owner';
import { formatLocation, normalizeLocation } from './location';

export type TPriorOwnerFormRow = {
	key: string;
	owner_id?: string;
	name: string;
	location: TLocation;
	date_start: string;
	date_end: string;
};

export type TPriorOwnerSubmitRow = {
	owner_id?: string;
	name: string;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	date_start: string | null;
	date_end: string | null;
};

export function dateToFormValue(date?: string | null): string {
	if (!date) {
		return '';
	}

	return date.toString().split('T')[0];
}

export function isoDateFromForm(
	value: string | null | undefined
): string | null {
	if (!value?.trim()) {
		return null;
	}

	return `${value.trim()}T00:00:00.000Z`;
}

export function priorOwnersFromCarHistory(
	ownerHistory: TCarOwner[] | undefined
): TPriorOwnerFormRow[] {
	const prior = (ownerHistory ?? []).slice(1);

	return prior.map((row) => ({
		key: row.owner_id ?? row.id,
		owner_id: row.owner_id ?? row.id,
		name: row.name ?? '',
		location: normalizeLocation({
			city: row.city,
			state: row.state,
			country: row.country || '',
		}),
		date_start: dateToFormValue(row.date_start),
		date_end: dateToFormValue(row.date_end),
	}));
}

export function newPriorOwnerRow(): TPriorOwnerFormRow {
	return {
		key: `new-${crypto.randomUUID()}`,
		name: '',
		location: { city: '', state: '', country: '' },
		date_start: '',
		date_end: '',
	};
}

function snapshotRow(row: TPriorOwnerFormRow) {
	return {
		owner_id: row.owner_id ?? null,
		name: row.name.trim(),
		location: formatLocation(normalizeLocation(row.location)),
		date_start: row.date_start.trim(),
		date_end: row.date_end.trim(),
	};
}

export function sortPriorOwnersByStartDate(
	rows: TPriorOwnerFormRow[]
): TPriorOwnerFormRow[] {
	return [...rows].sort((a, b) => {
		const aStart = a.date_start.trim();
		const bStart = b.date_start.trim();

		if (!aStart && !bStart) {
			return 0;
		}

		if (!aStart) {
			return 1;
		}

		if (!bStart) {
			return -1;
		}

		return aStart.localeCompare(bStart);
	});
}

export function sortPriorOwnersForDisplay(
	rows: TPriorOwnerFormRow[]
): TPriorOwnerFormRow[] {
	return sortPriorOwnersByStartDate(rows).reverse();
}

export function utcYearFromFormDate(value: string): number | null {
	if (!value.trim()) {
		return null;
	}

	const year = new Date(value).getUTCFullYear();

	return Number.isNaN(year) ? null : year;
}

export function jan1FormDate(year: number): string {
	return `${year}-01-01`;
}

function formDateOrJan1(
	value: string | null | undefined,
	year: number | null
): string {
	if (value?.trim()) {
		return dateToFormValue(value);
	}

	if (year != null) {
		return jan1FormDate(year);
	}

	return jan1FormDate(new Date().getUTCFullYear());
}

export function hasOwnershipYearGap(
	olderOwnedUntil: string | null | undefined,
	newerOwnedFrom: string | null | undefined
): boolean {
	const endYear = olderOwnedUntil
		? utcYearFromFormDate(olderOwnedUntil)
		: null;
	const startYear = newerOwnedFrom
		? utcYearFromFormDate(newerOwnedFrom)
		: null;

	if (endYear == null || startYear == null) {
		return false;
	}

	return startYear - endYear > 1;
}

export type TOwnershipGapPlaceholder = {
	date_end: string;
	date_start: string;
	displayYearEnd: number;
	displayYearStart: number;
	key: string;
};

export function ownershipGapPlaceholder(
	olderOwnedUntil: string | null | undefined,
	newerOwnedFrom: string | null | undefined,
	slotKey: string
): TOwnershipGapPlaceholder | null {
	if (!hasOwnershipYearGap(olderOwnedUntil, newerOwnedFrom)) {
		return null;
	}

	const endYear = utcYearFromFormDate(olderOwnedUntil!);
	const startYear = utcYearFromFormDate(newerOwnedFrom!);

	if (endYear == null || startYear == null) {
		return null;
	}

	return {
		key: slotKey,
		date_start: jan1FormDate(endYear),
		date_end: jan1FormDate(startYear),
		displayYearStart: endYear,
		displayYearEnd: startYear,
	};
}

export function suggestPriorOwnerDatesBetween(args: {
	currentOwnerPurchaseStart?: string | null;
	editionYear?: number | null;
	insertIndex?: number;
	newerOwnedFrom: string | null | undefined;
	olderOwnedUntil: string | null | undefined;
}): Pick<TPriorOwnerFormRow, 'date_end' | 'date_start'> {
	const {
		currentOwnerPurchaseStart,
		editionYear,
		insertIndex,
		newerOwnedFrom,
		olderOwnedUntil,
	} = args;

	const purchaseEnd = currentOwnerPurchaseStart?.trim()
		? dateToFormValue(currentOwnerPurchaseStart)
		: '';

	const untilBridgingToCurrent =
		insertIndex === 0 && purchaseEnd ? purchaseEnd : null;

	const newerYear = newerOwnedFrom
		? utcYearFromFormDate(newerOwnedFrom)
		: null;
	const olderYear = olderOwnedUntil
		? utcYearFromFormDate(olderOwnedUntil)
		: null;

	if (!olderOwnedUntil?.trim()) {
		const edition =
			editionYear ??
			utcYearFromFormDate(purchaseEnd || newerOwnedFrom || '') ??
			new Date().getUTCFullYear();

		return {
			date_start: jan1FormDate(edition),
			date_end:
				untilBridgingToCurrent ??
				formDateOrJan1(newerOwnedFrom, newerYear),
		};
	}

	if (olderYear != null && newerYear != null) {
		if (newerYear - olderYear > 1) {
			const startYear = olderYear + 1;
			const endYear = newerYear - 1;

			if (startYear <= endYear) {
				return {
					date_start: jan1FormDate(startYear),
					date_end: jan1FormDate(endYear),
				};
			}
		}

		return {
			date_start: formDateOrJan1(olderOwnedUntil, olderYear),
			date_end:
				untilBridgingToCurrent ??
				formDateOrJan1(newerOwnedFrom, newerYear),
		};
	}

	if (olderYear != null) {
		const day = formDateOrJan1(olderOwnedUntil, olderYear);

		return {
			date_start: day,
			date_end: day,
		};
	}

	if (newerYear != null) {
		const day = formDateOrJan1(newerOwnedFrom, newerYear);

		return {
			date_start: day,
			date_end: day,
		};
	}

	const y = editionYear ?? new Date().getUTCFullYear();

	return {
		date_start: jan1FormDate(y),
		date_end: jan1FormDate(y),
	};
}

export function datesForGapPlaceholder(
	placeholder: TOwnershipGapPlaceholder
): Pick<TPriorOwnerFormRow, 'date_end' | 'date_start'> {
	return {
		date_start: jan1FormDate(placeholder.displayYearStart),
		date_end: jan1FormDate(placeholder.displayYearEnd),
	};
}

export function insertPriorOwnerAt(
	rows: TPriorOwnerFormRow[],
	insertIndex: number,
	dates: Pick<TPriorOwnerFormRow, 'date_end' | 'date_start'>
): TPriorOwnerFormRow[] {
	const row: TPriorOwnerFormRow = {
		...newPriorOwnerRow(),
		...dates,
	};

	return [...rows.slice(0, insertIndex), row, ...rows.slice(insertIndex)];
}

export function priorOwnersSnapshotEqual(
	a: TPriorOwnerFormRow[],
	b: TPriorOwnerFormRow[]
): boolean {
	const normalize = (rows: TPriorOwnerFormRow[]) =>
		[...rows].map(snapshotRow).sort((x, y) => {
			const id = (x.owner_id ?? '').localeCompare(y.owner_id ?? '');

			if (id !== 0) {
				return id;
			}

			return x.date_start.localeCompare(y.date_start);
		});

	return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

export function priorOwnersToSubmitPayload(
	rows: TPriorOwnerFormRow[]
): TPriorOwnerSubmitRow[] {
	return rows.map((row) => {
		const location = normalizeLocation(row.location);

		return {
			owner_id: row.owner_id,
			name: row.name.trim(),
			city: location.city || null,
			state: location.state || null,
			country: location.country || null,
			date_start: row.date_start.trim() || null,
			date_end: row.date_end.trim() || null,
		};
	});
}

function priorRowHasAnyData(row: TPriorOwnerFormRow): boolean {
	return Boolean(
		row.name.trim() ||
		row.date_start.trim() ||
		row.date_end.trim() ||
		formatLocation(normalizeLocation(row.location)).trim()
	);
}

export function validateOwnershipTimeline(
	priorOwners: TPriorOwnerFormRow[],
	currentOwnerDateStart: string | null | undefined,
	currentOwnerDateEnd: string | null | undefined
): string | null {
	const activeRows = priorOwners.filter(priorRowHasAnyData);

	for (const row of activeRows) {
		const start = row.date_start.trim();
		const end = row.date_end.trim();
		const label = row.name.trim() || 'Prior owner';

		if ((start && !end) || (!start && end)) {
			return `${label}: enter both owned-from and owned-until.`;
		}

		if (start && end && start > end) {
			return `${label}: owned-from must be on or before owned-until.`;
		}
	}

	const currentStart = currentOwnerDateStart?.trim() || '';
	const currentEnd = currentOwnerDateEnd?.trim() || '';

	if (currentStart && currentEnd && currentStart > currentEnd) {
		return 'Your purchase date must be on or before your date sold.';
	}

	return null;
}
