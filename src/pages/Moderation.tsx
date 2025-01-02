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

import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diff } from '../components/moderation/Diff';
import { PendingItem } from '../components/moderation/PendingItem';
import { Stats } from '../components/moderation/Stats';
import { usePageMeta } from '../hooks/usePageMeta';
import { TCar, TCarPending } from '../types/Car';
import { TModerationStats } from '../types/Global';
import { TCarOwner, TCarOwnerPending } from '../types/Owner';
import { handleApiError } from '../utils/global';

export const Moderation = () => {
	const { user, isLoaded } = useUser();
	const { getToken } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<string>('cars');
	const [pendingCars, setPendingCars] = useState<
		(TCarPending & { current: TCar | null; proposed: TCar })[]
	>([]);
	const [pendingCarOwners, setPendingCarOwners] = useState<
		(TCarOwnerPending & {
			current: TCarOwner | null;
			proposed: TCarOwner;
		})[]
	>([]);
	const [stats, setStats] = useState<TModerationStats>({
		pending: 0,
		approved: 0,
		rejected: 0,
	});
	const [pendingPhotos, setPendingPhotos] = useState<
		{
			id: string;
			carId: string;
			uploadedAt: string;
		}[]
	>([]);

	useEffect(() => {
		if (isLoaded && !user?.publicMetadata?.moderator) {
			navigate('/', {
				replace: true,
				state: { status: 403 },
			});
		}
	}, [isLoaded, user, navigate]);

	usePageMeta({
		path: '/moderation',
		title: 'Moderation',
		description: 'Review and action pending changes to the registry.',
	});

	useEffect(() => {
		const loadPendingChanges = async () => {
			try {
				const token = await getToken();

				if (!token) return;

				const [
					carsResponse,
					carOwnersResponse,
					photosResponse,
					statsResponse,
				] = await Promise.all([
					fetch(
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/cars`,
						{
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
						}
					),
					fetch(
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/carOwners`,
						{
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
						}
					),
					fetch(
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/photo`,
						{
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
						}
					),
					fetch(
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/stats`,
						{
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
						}
					),
				]);

				const [carsData, carOwnersData, photosData, statsData] =
					await Promise.all([
						carsResponse.json(),
						carOwnersResponse.json(),
						photosResponse.json(),
						statsResponse.json(),
					]);

				setPendingCars(carsData);
				setPendingCarOwners(carOwnersData);
				setPendingPhotos(photosData);
				setStats(statsData);
			} catch (error) {
				handleApiError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPendingChanges();
	}, []);

	const handleApprove = async (
		type: 'car' | 'carOwner' | 'photo',
		id: string
	) => {
		try {
			const token = await getToken();

			if (!token) return;

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/${type}/${id}/approve`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const error = await response.json();

				throw new Error(error.details || `Failed to update ${type}`);
			}

			if (type === 'car') {
				setPendingCars((cars) => cars.filter((car) => car.id !== id));
			} else if (type === 'carOwner') {
				setPendingCarOwners((owners) =>
					owners.filter((owner) => owner.id !== id)
				);
			} else if (type === 'photo') {
				setPendingPhotos((photos) =>
					photos.filter((photo) => photo.id !== id)
				);
			}
		} catch (error) {
			handleApiError(error);
		}
	};

	const handleReject = async (
		type: 'car' | 'carOwner' | 'photo',
		id: string
	) => {
		try {
			const token = await getToken();

			if (!token) return;

			await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/${type}/${id}/reject`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (type === 'car') {
				setPendingCars((cars) => cars.filter((car) => car.id !== id));
			} else if (type === 'carOwner') {
				setPendingCarOwners((owners) =>
					owners.filter((owner) => owner.id !== id)
				);
			} else if (type === 'photo') {
				setPendingPhotos((photos) =>
					photos.filter((photo) => photo.id !== id)
				);
			}
		} catch (error) {
			handleApiError(error);
		}
	};

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto p-8 lg:p-0 lg:py-8 min-h-[calc(100vh_-_80px)]">
				<h1 className="flex justify-between items-center text-2xl lg:text-3xl font-bold mb-4">
					Moderation Panel{' '}
					<div className="w-60">
						<Stats stats={stats} />
					</div>
				</h1>

				<div className="w-80 flex mb-8 overflow-x-auto">
					<div className="flex gap-2 p-1 bg-brg-light rounded-lg w-full relative">
						<div
							className="absolute transition-all w-[calc(33.33%_-_2px)] duration-200 ease-in-out h-[calc(100%-8px)] bg-white rounded-md shadow-sm"
							style={{
								transform: `translateX(${['cars', 'owners', 'photos'].indexOf(activeTab) * 100}%)`,
							}}
						/>

						{['cars', 'owners', 'photos'].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`relative flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
									activeTab === tab
										? 'text-brg'
										: 'text-brg-mid hover:text-brg'
								} disabled:text-brg-border/70`}
								disabled={
									tab === 'cars'
										? !pendingCars.length
										: tab === 'owners'
											? !pendingCarOwners.length
											: !pendingPhotos.length
								}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}{' '}
								<span className="text-brg-border">
									{tab === 'cars'
										? pendingCars.length
										: tab === 'owners'
											? pendingCarOwners.length
											: pendingPhotos.length}
								</span>
							</button>
						))}
					</div>
				</div>

				{isLoading ? (
					<div className="pt-4 space-y-4">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="h-32 bg-brg-light animate-pulse rounded-lg"
							/>
						))}
					</div>
				) : (
					<div className="space-y-4">
						{activeTab === 'cars' && (
							<div className="space-y-4">
								{pendingCars.length === 0 ? (
									<p className="text-brg-border">
										No pending changes
									</p>
								) : (
									pendingCars.map((pending) => (
										<PendingItem
											key={pending.id}
											carId={pending.current?.id}
											createdAt={pending.created_at}
											onApprove={() =>
												handleApprove('car', pending.id)
											}
											onReject={() =>
												handleReject('car', pending.id)
											}
										>
											{Object.keys(pending.proposed)
												.filter(
													(field) =>
														pending.proposed[
															field as keyof TCar
														] !==
														pending.current?.[
															field as keyof TCar
														]
												)
												.map((field) => (
													<Diff
														key={field}
														label={
															field as keyof TCar
														}
														oldValue={
															pending.current?.[
																field as keyof TCar
															] as any
														}
														newValue={
															pending.proposed[
																field as keyof TCar
															] as any
														}
													/>
												))}
										</PendingItem>
									))
								)}
							</div>
						)}

						{activeTab === 'owners' && (
							<div className="space-y-4">
								{pendingCarOwners.length === 0 ? (
									<p className="text-brg-border">
										No pending changes
									</p>
								) : (
									pendingCarOwners.map((pending) => (
										<PendingItem
											key={pending.id}
											carId={pending.current?.car_id}
											ownerId={pending.current?.owner_id}
											createdAt={pending.created_at}
											onApprove={() =>
												handleApprove(
													'carOwner',
													pending.id
												)
											}
											onReject={() =>
												handleReject(
													'carOwner',
													pending.id
												)
											}
										>
											{Object.keys(pending.proposed)
												.filter(
													(field) =>
														pending.proposed[
															field as keyof TCarOwner
														] !==
														pending.current?.[
															field as keyof TCarOwner
														]
												)
												.map((field) => (
													<Diff
														key={field}
														label={
															field as keyof TCar
														}
														oldValue={
															pending.current?.[
																field as keyof TCarOwner
															] as any
														}
														newValue={
															pending.proposed[
																field as keyof TCarOwner
															] as any
														}
													/>
												))}
										</PendingItem>
									))
								)}
							</div>
						)}

						{activeTab === 'photos' && (
							<div className="space-y-4">
								{pendingPhotos.length === 0 ? (
									<p className="text-brg-border">
										No pending photos
									</p>
								) : (
									pendingPhotos.map((photo) => (
										<PendingItem
											key={photo.id}
											carId={photo.id}
											createdAt={new Date(
												photo.uploadedAt
											).getTime()}
											onApprove={() =>
												handleApprove('photo', photo.id)
											}
											onReject={() =>
												handleReject('photo', photo.id)
											}
										>
											<img
												src={`https://store.miataregistry.com/car-pending/${photo.id}.jpg`}
												alt={`Pending photo for car ${photo.carId}`}
												className="w-full max-w-md rounded-lg"
											/>
										</PendingItem>
									))
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</main>
	);
};
