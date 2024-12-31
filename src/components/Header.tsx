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
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Symbol from '../assets/symbol.svg?react';
import { useModal } from '../context/ModalContext';
import { Button } from './Button';
import { Icon } from './Icon';

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

const CarsList = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [cars, setCars] = useState<
		Array<{
			id: string;
			year: number;
			edition: string;
			sequence: number | null;
			vin: string | null;
			destroyed: boolean;
		}>
	>([]);

	useEffect(() => {
		const fetchCars = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners/cars`,
					{
						credentials: 'include',
					}
				);

				if (!response.ok) throw new Error('Failed to fetch cars');

				const data = await response.json();

				setCars(data);
			} catch (error) {
				console.error('Error fetching cars:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCars();
	}, []);

	if (isLoading) {
		return <p className="text-[#B6B6B6] text-[13px]">Loading...</p>;
	}

	if (cars.length === 0) {
		return (
			<p className="text-[#B6B6B6] text-[13px]">
				You haven't claimed any cars yet.
			</p>
		);
	}

	return (
		<>
			{cars.map((car) => (
				<>
					<Link
						key={car.id}
						to={`/registry/${car.id}`}
						className={twMerge(
							'text-[13px] group flex flex-col cursor-pointer mb-1 py-1.5 px-2.5 -mx-2.5 rounded-md hover:bg-[#F7F7F7] transition-colors',
							car.destroyed ? 'text-[#EF4444]' : 'text-[#212126]'
						)}
					>
						<div className="flex items-center gap-1">
							<span
								className={twMerge(
									'whitespace-nowrap',
									car.destroyed ? 'line-through' : ''
								)}
							>
								{car.year} {car.edition}
								{car.sequence ? ` #${car.sequence}` : ''}
							</span>

							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								stroke="#2F3037"
								viewBox="0 0 20 20"
								className="size-4 group-hover:opacity-50 opacity-0 -translate-x-2 group-hover:translate-x-0 transition-all"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3.3 10h13.4m-5-5 5 5-5 5"
								></path>
							</svg>
						</div>

						<div
							className={twMerge(
								'w-fit',
								car.destroyed
									? 'text-[#747686]/50'
									: 'text-[#747686]'
							)}
						>
							{car.vin}
						</div>
					</Link>
				</>
			))}
		</>
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
	const { openModal } = useModal();

	const isHomePage = location.pathname === '/';

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
				>
					<UserButton.MenuItems>
						<UserButton.Action
							label="My Cars"
							labelIcon={
								<Icon
									name="car"
									className="size-3.5 text-[#616161]"
								/>
							}
							open="cars"
						/>
					</UserButton.MenuItems>

					<UserButton.UserProfilePage
						label="My Cars"
						labelIcon={
							<Icon
								name="car"
								className="size-3.5 text-[#2F3037]"
							/>
						}
						url="cars"
					>
						<>
							<h1 className="mb-4 text-[#212126] leading-6 text-[17px] font-bold">
								My Cars
							</h1>

							<div className="border-t border-black/[0.07] py-4 flex flex-col">
								<CarsList />
							</div>
						</>
					</UserButton.UserProfilePage>

					<UserButton.UserProfilePage label="security" />
				</UserButton>
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
						// { label: 'News', to: '/news' },
						{ label: 'Contributing', to: '/about#contribute' },
						{ label: 'Contact us', to: '/about#contact' },
						// { label: 'Submit a tip', to: '/tip' },
					]}
					isActive={isActive('/about')}
				/>

				<div className="hidden lg:block">
					<ConstructionBanner />
				</div>
			</div>

			<AuthSection />
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
