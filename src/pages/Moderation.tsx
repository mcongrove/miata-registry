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

				const [carsResponse, carOwnersResponse, statsResponse] =
					await Promise.all([
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
							`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/stats`,
							{
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${token}`,
								},
							}
						),
					]);

				const [carsData, carOwnersData, statsData] = await Promise.all([
					carsResponse.json(),
					carOwnersResponse.json(),
					statsResponse.json(),
				]);

				setPendingCars(carsData);
				setPendingCarOwners(carOwnersData);
				setStats(statsData);
			} catch (error) {
				handleApiError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPendingChanges();
	}, []);

	const handleApprove = async (type: 'car' | 'carOwner', id: string) => {
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
			} else {
				setPendingCarOwners((owners) =>
					owners.filter((owner) => owner.id !== id)
				);
			}
		} catch (error) {
			handleApiError(error);
		}
	};

	const handleReject = async (type: 'car' | 'carOwner', id: string) => {
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
			} else {
				setPendingCarOwners((owners) =>
					owners.filter((owner) => owner.id !== id)
				);
			}
		} catch (error) {
			handleApiError(error);
		}
	};

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto p-8 lg:p-0 lg:py-8">
				<h1 className="flex justify-between items-center text-2xl lg:text-3xl font-bold">
					Moderation Panel{' '}
					<div className="w-60">
						<Stats stats={stats} />
					</div>
				</h1>

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
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<section className="pr-4">
							<h2 className="text-xl font-bold my-2 sticky top-0 bg-white z-10 py-2">
								Cars{' '}
								<span className="text-brg-border font-normal">
									{pendingCars.length}
								</span>
							</h2>

							{pendingCars.length === 0 ? (
								<p className="text-brg-border">
									No pending changes
								</p>
							) : (
								<div className="max-h-[calc(100vh_-_240px)] overflow-y-auto space-y-4">
									{pendingCars.map((pending) => (
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
									))}
								</div>
							)}
						</section>

						<section className="overflow-y-auto pr-4">
							<h2 className="text-xl font-bold my-2 sticky top-0 bg-white z-10 py-2">
								Car Owners{' '}
								<span className="text-brg-border font-normal">
									{pendingCarOwners.length}
								</span>
							</h2>

							{pendingCarOwners.length === 0 ? (
								<p className="text-brg-border">
									No pending changes
								</p>
							) : (
								<div className="max-h-[calc(100vh_-_240px)] overflow-y-auto space-y-4">
									{pendingCarOwners.map((pending) => (
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
									))}
								</div>
							)}
						</section>
					</div>
				)}
			</div>
		</main>
	);
};
