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

import { useUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Symbol from '../assets/symbol.svg?react';
import { Clerk } from '../components/account/Clerk';
import { useModal } from '../context/ModalContext';

interface DropdownProps {
	label: string;
	items: { label: React.ReactNode; to?: string; onClick?: () => void }[];
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

				<i className="fa-solid fa-fw fa-chevron-down text-[10px]" />
			</button>

			<div className="absolute left-0 top-full invisible group-hover:visible">
				<div className="mt-2 p-2 w-48 bg-white rounded-lg shadow-lg border border-brg-border">
					{items.map((item, index) => {
						const className = `block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
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
	<div className="flex gap-1.5 items-center bg-amber-100 border border-amber-300 text-amber-700 text-xs py-2 px-4 rounded-full">
		<i className="fa-solid fa-person-digging text-sm"></i> This project is
		in early access.
	</div>
);

export const Header = () => {
	const { user } = useUser();
	const location = useLocation();
	const { openModal } = useModal();

	const isHomePage = location.pathname === '/';

	const isActive = (path: string) => {
		return location.pathname.startsWith(path);
	};

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
						{
							label: 'Register your Miata',
							onClick: () => openModal('register'),
						},
						{
							label: 'Submit a tip',
							onClick: () => openModal('tip'),
						},
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
						{
							label: (
								<span className="flex items-center gap-1.5">
									Rarity Scores{' '}
									<i className="fa-solid fa-crown text-sm -mt-0.5" />
								</span>
							),
							to: '/rarity',
						},
						{ label: 'Contributing', to: '/about#contribute' },
						{ label: 'Contact us', to: '/about#contact' },
					]}
					isActive={isActive('/about')}
				/>

				<div className="hidden lg:block">
					<ConstructionBanner />
				</div>
			</div>

			<div className="flex items-center">
				{user?.publicMetadata?.moderator ? (
					<Link
						to="/moderation"
						className={twMerge(
							'hidden lg:flex text-sm text-brg-mid hover:text-brg transition-colors items-center gap-1 mr-6',
							isActive('/moderation')
								? 'text-brg font-medium'
								: 'text-brg-mid hover:text-brg',
							isHomePage && 'bg-white rounded-lg py-2 px-3'
						)}
					>
						Moderation
					</Link>
				) : null}

				<Clerk />
			</div>
		</nav>
	);

	if (isHomePage) {
		return (
			<>
				<header className="absolute top-0 left-0 right-0 z-50 h-20">
					<div className="mx-auto py-6 px-8 lg:px-16">
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
				<div className="container mx-auto px-8 lg:px-0 py-4 relative">
					<div className="flex items-center">
						<Link to="/" className="mr-8 lg:mr-12">
							<Symbol className="w-16 h-auto text-brg" />

							<span className="sr-only">Miata Registry</span>
						</Link>

						<NavLinks />
					</div>
				</div>
			</header>
		</>
	);
};
