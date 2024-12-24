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

import { getAuth, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';

interface UserMenuProps {
	user: User;
}

export const UserMenu = ({ user }: UserMenuProps) => {
	const handleSignOut = async () => {
		const auth = getAuth();

		try {
			await signOut(auth);
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	return (
		<div className="relative group z-[60]">
			<button className="flex items-center">
				{user.photoURL ? (
					<img
						src={user.photoURL}
						alt={user.displayName ?? 'User'}
						className="size-11 rounded-full"
					/>
				) : (
					<div className="size-11 rounded-full bg-brg flex items-center justify-center">
						<svg
							className="w-6 h-6 text-brg-border"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
						</svg>
					</div>
				)}
			</button>

			<div className="absolute right-0 top-full invisible group-hover:visible">
				<div className="mt-2 p-2 w-48 bg-white rounded-lg shadow-lg border border-brg-border text-sm text-brg font-medium">
					<div className="px-3 py-2">
						{user.displayName || user.email || 'Unknown User'}
					</div>

					<button
						onClick={handleSignOut}
						className="block w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-brg-mid hover:text-brg hover:bg-brg-light"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
};
