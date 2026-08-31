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

export type PriorOwnerIntent =
	| {
			kind: 'prior_owner';
			action: 'create';
			owner: {
				name: string;
				city?: string | null;
				state?: string | null;
				country?: string | null;
			};
	  }
	| {
			kind: 'prior_owner';
			action: 'update';
			previous_date_start: string;
			owner: {
				name: string;
				city?: string | null;
				state?: string | null;
				country?: string | null;
			};
	  }
	| {
			kind: 'prior_owner';
			action: 'delete';
			car_owner_date_start: string;
	  };

export function parsePriorOwnerIntent(
	information: string | null | undefined
): PriorOwnerIntent | null {
	if (!information) {
		return null;
	}

	try {
		const parsed = JSON.parse(information) as PriorOwnerIntent;

		if (parsed?.kind === 'prior_owner') {
			return parsed;
		}
	} catch {
		return null;
	}

	return null;
}
