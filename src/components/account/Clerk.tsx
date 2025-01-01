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
	useAuth,
	UserButton,
} from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
// import { formatLocation } from '../../utils/geo';
import { Button } from '../Button';
import { Icon } from '../Icon';
// import { Location } from '../form/Location';

// const ProfileSettings = ({
// 	location,
// 	onLocationSelect,
// }: {
// 	location: { city: string; state: string; country: string } | null;
// 	onLocationSelect: (location: any) => void;
// }) => {
// 	return (
// 		<div className="flex gap-6 py-4 h-full">
// 			<div className="w-44 py-1.5 shrink-0">
// 				<p className="text-[#212126] font-medium text-[13px] py-2">
// 					Location
// 				</p>
// 			</div>

// 			<div className="h-full w-full pt-1.5 pb-1.5">
// 				<Location
// 					id="location"
// 					name="location"
// 					placeholder="Enter a location"
// 					className="text-[#212126] md:!text-[13px] border-[#E1E1E1] focus:border-[#A2A2A2] focus:ring-[3px] focus:ring-[#E3E3E3] transition-all"
// 					value={location ? formatLocation(location) : ''}
// 					onLocationSelect={onLocationSelect}
// 				/>
// 			</div>
// 		</div>
// 	);
// };

const CarsList = ({
	cars,
	isLoading,
}: {
	cars: Array<{
		id: string;
		year: number;
		edition: string;
		sequence: number | null;
		vin: string | null;
		destroyed: boolean;
	}>;
	isLoading: boolean;
}) => {
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
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
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
			))}
		</>
	);
};

export function Clerk() {
	const location = useLocation();
	const { userId } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [ownerData, setOwnerData] = useState<{
		location: { city: string; state: string; country: string } | null;
		cars: Array<{
			id: string;
			year: number;
			edition: string;
			sequence: number | null;
			vin: string | null;
			destroyed: boolean;
		}>;
	}>({ location: null, cars: [] });

	const isHomePage = location.pathname === '/';

	useEffect(() => {
		const fetchOwnerData = async () => {
			if (!userId) return;

			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners/${userId}`,
					{
						credentials: 'include',
					}
				);

				if (!response.ok) throw new Error('Failed to fetch owner data');

				const data = await response.json();

				setOwnerData(data);
			} catch (error) {
				console.error('Error fetching owner data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOwnerData();
	}, [userId]);

	return (
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
						{/* <UserButton.Action
							label="Profile Settings"
							labelIcon={
								<Icon
									name="user"
									className="size-3.5 text-[#616161]"
								/>
							}
							open="profile"
						/> */}

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

					<UserButton.UserProfilePage label="account" />

					{/* <UserButton.UserProfilePage
						label="Profile"
						labelIcon={
							<Icon
								name="user"
								className="size-3.5 text-[#2F3037]"
							/>
						}
						url="profile"
					>
						<>
							<h1 className="mb-4 text-[#212126] leading-6 text-[17px] font-bold">
								Profile Settings
							</h1>

							<div className="border-t border-black/[0.07] flex flex-col h-full">
								<ProfileSettings
									location={ownerData.location}
									onLocationSelect={(location) =>
										console.log(location)
									}
								/>
							</div>
						</>
					</UserButton.UserProfilePage> */}

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
								<CarsList
									cars={ownerData.cars}
									isLoading={isLoading}
								/>
							</div>
						</>
					</UserButton.UserProfilePage>

					<UserButton.UserProfilePage label="security" />
				</UserButton>
			</SignedIn>
		</>
	);
}
