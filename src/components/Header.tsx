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

import { Link, useLocation } from 'react-router-dom';
import Symbol from '../assets/symbol.svg?react';
import { Button } from './Button.tsx';

export const Header = () => {
	const location = useLocation();
	const isHomePage = location.pathname === '/';

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	const NavLinks = () => (
		<nav className="flex items-center justify-between w-full">
			<div className="flex items-center gap-6">
				<Link
					to="/registry"
					className={`text-sm ${
						isActive('/registry')
							? 'text-brg font-medium'
							: 'text-brg-mid hover:text-brg'
					} transition-colors`}
				>
					Browse Cars
				</Link>

				<Link
					to="/models"
					className={`text-sm ${
						isActive('/models')
							? 'text-brg font-medium'
							: 'text-brg-mid hover:text-brg'
					} transition-colors`}
				>
					Browse Models
				</Link>

				<Link
					to="/resources"
					className={`text-sm ${
						isActive('/resources')
							? 'text-brg font-medium'
							: 'text-brg-mid hover:text-brg'
					} transition-colors`}
				>
					Resources
				</Link>
			</div>

			<div className="flex items-center text-sm text-white">
				<a
					href="#"
					className="block bg-brg hover:bg-brg-dark rounded-l-lg transition-colors py-3 px-4 border-r border-brg-mid"
				>
					Sign In
				</a>

				<a
					href="#"
					className="bg-brg hover:bg-brg-dark rounded-r-lg transition-colors py-3 px-4"
				>
					Register
				</a>
			</div>
		</nav>
	);

	if (!isHomePage) {
		return (
			<header className="absolute top-0 left-0 right-0 z-50">
				<div className=" mx-auto py-6 px-16">
					<div className="flex items-center">
						{!isHomePage && (
							<Link to="/" className="mr-12">
								<Symbol className="w-8 h-auto text-brg" />
							</Link>
						)}

						<NavLinks />
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="bg-white border-b border-brg-border">
			<div className="container mx-auto py-4">
				<div className="flex items-center">
					<Link to="/" className="mr-12">
						<Symbol className="w-8 h-auto text-brg" />
					</Link>

					<NavLinks />
				</div>
			</div>
		</header>
	);
};
