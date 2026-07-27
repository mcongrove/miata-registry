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

export function userCanEditCar(
	_carId: string,
	ownerClerkUserId: string | null | undefined,
	signedInUserId: string | null | undefined
): boolean {
	if (!signedInUserId) {
		return false;
	}

	if (ownerClerkUserId === signedInUserId) {
		return true;
	}

	/* LOCAL DEV — uncomment for one-car testing (see AGENTS.md).
	import { LOCAL_DEV_EDIT_CAR_ID } from '../constants/local';

	const devCarId =
		(import.meta.env.VITE_LOCAL_DEV_EDIT_CAR_ID as string | undefined)?.trim() ||
		LOCAL_DEV_EDIT_CAR_ID;

	if (import.meta.env.DEV && carId === devCarId) {
		return true;
	}
	*/

	return false;
}
