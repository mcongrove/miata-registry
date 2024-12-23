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

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Symbol from '../assets/symbol.svg?react';
import { Button } from './Button';

interface DropdownProps {
	label: string;
	items: { label: string; to: string }[];
	isActive?: boolean;
}

const Dropdown = ({ label, items, isActive }: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative" onMouseLeave={() => setIsOpen(false)}>
			<button
				className={`text-sm ${
					isActive
						? 'text-brg font-medium'
						: 'text-brg-mid hover:text-brg'
				} transition-colors flex items-center gap-1`}
				onMouseEnter={() => setIsOpen(true)}
			>
				{label}
				<svg
					className="w-4 h-4"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute left-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-lg border border-brg-border">
					{items.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="block px-4 py-2 text-sm text-brg-mid hover:text-brg hover:bg-brg-light transition-colors"
						>
							{item.label}
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export const Header = () => {
	const location = useLocation();
	const isHomePage = location.pathname === '/';

	const isActive = (path: string) => {
		return location.pathname.startsWith(path);
	};

	const NavLinks = () => (
		<nav className="flex items-center justify-between w-full">
			<div className="flex items-center gap-6">
				<Dropdown
					label="Registry"
					items={[
						{ label: 'Browse/Search All Cars', to: '/registry' },
						{ label: 'Limited Edition Models', to: '/models' },
						{ label: 'Register Your Car', to: '/register' },
					]}
					isActive={isActive('/registry')}
				/>

				<Dropdown
					label="Resources"
					items={[
						{
							label: 'Documentation Library',
							to: '/resources/docs',
						},
					]}
					isActive={isActive('/resources')}
				/>

				<Dropdown
					label="News"
					items={[{ label: 'Latest Updates', to: '/news' }]}
					isActive={isActive('/news')}
				/>

				<Dropdown
					label="About"
					items={[
						{ label: 'About', to: '/about' },
						{ label: 'Contributing', to: '/contributing' },
						{ label: 'Partners', to: '/partners' },
					]}
					isActive={isActive('/about')}
				/>

				<Dropdown
					label="Support"
					items={[
						{ label: 'Contact', to: '/contact' },
						{ label: 'FAQ', to: '/faq' },
					]}
					isActive={isActive('/support')}
				/>
			</div>

			{isHomePage ? (
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
			) : (
				<div className="flex items-center text-sm gap-2">
					<Button variant="tertiary">Sign In</Button>

					<Button>Register</Button>
				</div>
			)}
		</nav>
	);

	if (isHomePage) {
		return (
			<header className="absolute top-0 left-0 right-0 z-50">
				<div className="mx-auto py-6 px-16">
					<div className="flex items-center">
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
						<Symbol className="w-16 h-auto text-brg" />
					</Link>

					<NavLinks />
				</div>
			</div>
		</header>
	);
};
