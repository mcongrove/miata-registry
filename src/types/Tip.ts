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

export const TipStatus = {
	CONFIRMED: 'confirmed',
	PENDING: 'pending',
} as const;

export type TTipStatus = (typeof TipStatus)[keyof typeof TipStatus];

export type TTip = {
	created_at: number;
	edition: string;
	id: string;
	information?: string;
	owner_location?: string;
	owner_name?: string;
	sequence?: string;
	status: TTipStatus;
	updated_at?: number;
	vin?: string;
};
