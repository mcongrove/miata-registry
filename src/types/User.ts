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

import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
	// Firebase
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;

	// Custom
	location?: string;
	cars?: string[];
	createdAt?: Date;
	lastLoginAt?: Date;
}

export interface UserProfile {
	uid: string;
	email: string;
	displayName: string;
	location?: string;
	cars?: string[];
	createdAt: Date;
	lastLoginAt: Date;
}
