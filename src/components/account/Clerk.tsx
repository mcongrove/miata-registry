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
import { lazy, Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TOwner } from '../../types/Owner';
import { handleApiError } from '../../utils/common';
import { Button } from '../Button';

const ClerkMyCars = lazy(() =>
	import('./ClerkMyCars').then((module) => ({
		default: module.ClerkMyCars,
	}))
);

const ClerkProfile = lazy(() =>
	import('./ClerkProfile').then((module) => ({
		default: module.ClerkProfile,
	}))
);

const LoadingIndicator = () => (
	<p className="text-[#B6B6B6] text-[13px]">Loading...</p>
);

export function Clerk() {
	const location = useLocation();
	const { getToken, userId } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [ownerData, setOwnerData] = useState<{
		owner: TOwner;
		cars: Array<{
			id: string;
			year: number;
			edition: string;
			sequence: number | null;
			vin: string | null;
			destroyed: boolean;
		}>;
	}>({ owner: { id: '' }, cars: [] });

	const isHomePage = location.pathname === '/';

	const fetchOwnerData = async () => {
		if (!userId || ownerData.owner.id) return;

		try {
			const token = await getToken();

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners/${userId}`,
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			setOwnerData(data);
		} catch (error) {
			handleApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

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

			<div onClick={fetchOwnerData} className="h-9">
				<SignedIn>
					<UserButton
						appearance={{
							elements: { userButtonAvatarBox: 'size-9' },
						}}
					>
						<UserButton.MenuItems>
							<UserButton.Action
								label="Profile"
								labelIcon={
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 16 16"
									>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-2.585 2.894c.154.25.107.568-.083.792A5.675 5.675 0 0 1 8 13.688a5.675 5.675 0 0 1-4.332-2.002c-.19-.224-.237-.543-.083-.792.087-.14.189-.271.306-.392.46-.469 1.087-.986 1.703-1.102.514-.097.899.056 1.298.214.331.132.673.267 1.108.267.435 0 .777-.135 1.108-.267.4-.158.784-.31 1.298-.214.616.116 1.243.633 1.703 1.102.117.12.22.252.306.392ZM8 8.919c1.329 0 2.406-1.559 2.406-2.888a2.406 2.406 0 1 0-4.812 0C5.594 7.361 6.67 8.92 8 8.92Z"
											fill="currentColor"
										></path>
									</svg>
								}
								open="profile"
							/>

							<UserButton.Action
								label="My Cars"
								labelIcon={
									<i className="fa-solid fa-fw fa-car text-[#616161]"></i>
								}
								open="cars"
							/>
						</UserButton.MenuItems>

						<UserButton.UserProfilePage label="account" />

						<UserButton.UserProfilePage
							label="Profile"
							labelIcon={
								<i className="fa-solid fa-fw fa-user text-[#2F3037]"></i>
							}
							url="profile"
						>
							<>
								<h1 className="mb-4 text-[#212126] leading-6 text-[17px] font-bold">
									Profile Settings
								</h1>

								<div className="border-t border-black/[0.07] flex flex-col h-full">
									{isLoading ? (
										<LoadingIndicator />
									) : (
										<Suspense
											fallback={<LoadingIndicator />}
										>
											<ClerkProfile
												owner={ownerData.owner}
												onUpdate={fetchOwnerData}
											/>
										</Suspense>
									)}
								</div>
							</>
						</UserButton.UserProfilePage>

						<UserButton.UserProfilePage
							label="My Cars"
							labelIcon={
								<i className="fa-solid fa-fw fa-car text-[#2F3037]"></i>
							}
							url="cars"
						>
							<>
								<h1 className="mb-4 text-[#212126] leading-6 text-[17px] font-bold">
									My Cars
								</h1>

								<div className="border-t border-black/[0.07] py-4 flex flex-col">
									{isLoading ? (
										<LoadingIndicator />
									) : (
										<Suspense
											fallback={<LoadingIndicator />}
										>
											<ClerkMyCars
												cars={ownerData.cars}
											/>
										</Suspense>
									)}
								</div>
							</>
						</UserButton.UserProfilePage>

						<UserButton.UserProfilePage label="security" />
					</UserButton>
				</SignedIn>
			</div>
		</>
	);
}
