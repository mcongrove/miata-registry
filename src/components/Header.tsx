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

import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import Symbol from '../assets/symbol.svg?react';
import { useTipModal } from '../context/TipContext';
import { Button } from './Button';

interface DropdownProps {
	label: string;
	items: { label: string; to?: string; onClick?: () => void }[];
	isActive?: boolean;
}

const Dropdown = ({ label, items, isActive }: DropdownProps) => {
	const location = useLocation();

	return (
		<div className="relative group z-[60]">
			<button
				className={`text-sm ${
					isActive
						? 'text-brg font-medium'
						: 'text-brg-mid hover:text-brg'
				} transition-colors flex items-center gap-1`}
			>
				{label}

				<svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			<div className="absolute left-0 top-full invisible group-hover:visible">
				<div className="mt-2 p-2 w-48 bg-white rounded-lg shadow-lg border border-brg-border">
					{items.map((item, index) => {
						const className = `block px-3 py-2 text-sm rounded-md transition-colors ${
							item.to && location.pathname === item.to
								? 'text-brg font-medium'
								: 'text-brg-mid hover:text-brg hover:bg-brg-light'
						}`;

						return item.to ? (
							<Link
								key={item.to}
								to={item.to}
								className={className}
							>
								{item.label}
							</Link>
						) : (
							<button
								key={index}
								onClick={item.onClick}
								className={className}
							>
								{item.label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

const ConstructionBanner = () => (
	<div className="bg-amber-300 text-amber-700 text-xs py-2 px-4 rounded-full">
		🚧 &nbsp; This project is in early access. Features may be incomplete or
		change without notice.
	</div>
);

export const Header = () => {
	const location = useLocation();
	// const { user } = useUser();
	const { openTipModal } = useTipModal();
	const isHomePage = location.pathname === '/';

	// console.log(user);

	const isActive = (path: string) => {
		return location.pathname.startsWith(path);
	};

	const AuthSection = () => (
		<>
			<SignedOut>
				<SignInButton mode="modal">
					{isHomePage ? (
						<button className="block bg-brg text-sm h-11 text-white hover:bg-brg-dark rounded-lg transition-colors py-3 px-4 border-r border-brg-mid">
							Sign In
						</button>
					) : (
						<Button variant="tertiary" className="text-sm h-11">
							Sign In
						</Button>
					)}
				</SignInButton>
			</SignedOut>

			<SignedIn>
				<UserButton
					appearance={{
						elements: { userButtonAvatarBox: 'size-9' },
					}}
				/>
			</SignedIn>
		</>
	);

	const NavLinks = () => (
		<nav className="flex items-center justify-between w-full h-11">
			<div className="flex items-center gap-6">
				<Dropdown
					label="Registry"
					items={[
						{ label: 'Browse the cars', to: '/registry' },
						{
							label: 'Browse the editions',
							to: '/registry/editions',
						},
						// { label: 'Claim your Miata', to: '/register' },
						{ label: 'Submit a tip', onClick: openTipModal },
					]}
					isActive={isActive('/registry')}
				/>

				{/*
				<Link
					to="/resources/docs"
					className={`text-sm ${
						isActive('/resources')
							? 'text-brg'
							: 'text-brg-mid hover:text-brg'
					} transition-colors`}
				>
					Resources
				</Link>
				*/}

				<Dropdown
					label="About"
					items={[
						{ label: 'About the Registry', to: '/about' },
						// { label: 'News', to: '/news' },
						{ label: 'Contributing', to: '/about#contribute' },
						{ label: 'Contact us', to: '/about#contact' },
						// { label: 'Submit a tip', to: '/tip' },
					]}
					isActive={isActive('/about')}
				/>

				<ConstructionBanner />
			</div>

			<AuthSection />
		</nav>
	);

	if (isHomePage) {
		return (
			<>
				<header className="absolute top-0 left-0 right-0 z-50 h-20">
					<div className="mx-auto py-6 px-16">
						<div className="flex items-center">
							<NavLinks />
						</div>
					</div>
				</header>
			</>
		);
	}

	return (
		<>
			<header className="fixed top-0 left-0 right-0 bg-white border-b border-brg-light z-50 h-20">
				<div className="container mx-auto py-4 relative">
					<div className="flex items-center">
						<Link to="/" className="mr-12">
							<Symbol className="w-16 h-auto text-brg" />
						</Link>

						<NavLinks />
					</div>
				</div>
			</header>
		</>
	);
};
