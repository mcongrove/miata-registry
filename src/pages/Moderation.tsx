/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diff, vinValidateLink } from '../components/moderation/Diff';
import {
	PackagePendingItem,
	type PackageApproveOverrides,
	type TPackage,
} from '../components/moderation/PackagePendingItem';
import { PendingItem } from '../components/moderation/PendingItem';
import { usePageMeta } from '../hooks/usePageMeta';
import { TCar, TCarPending } from '../types/Car';
import {
	TCarOwner,
	TCarOwnerPending,
	TOwner,
	TOwnerPending,
} from '../types/Owner';
import { handleApiError } from '../utils/common';

const CAR_DIFF_FIELD_ORDER = ['vin', 'edition_id'] as const;

const sortByFieldOrder = (keys: string[], order: readonly string[]) => {
	const priority = new Map(order.map((field, index) => [field, index]));

	return keys.sort((a, b) => {
		const aRank = priority.get(a) ?? order.length;
		const bRank = priority.get(b) ?? order.length;

		if (aRank !== bRank) return aRank - bRank;

		return a.localeCompare(b);
	});
};

const orderedCarDiffFields = (pending: {
	current: TCar | null;
	proposed: TCar;
}) =>
	sortByFieldOrder(
		Object.keys(pending.proposed).filter(
			(field) =>
				field !== 'id' &&
				pending.proposed[field as keyof TCar] !==
					pending.current?.[field as keyof TCar]
		),
		CAR_DIFF_FIELD_ORDER
	);

type TPendingCar = TCarPending & {
	current: TCar | null;
	proposed: TCar;
};

type TPendingCarOwner = TCarOwnerPending & {
	car_current_owner_id?: string | null;
	current: TCarOwner | null;
	proposed: TCarOwner;
};

type TPendingOwner = TOwnerPending & {
	proposed: TOwner;
};

export const Moderation = () => {
	const { user, isLoaded } = useUser();
	const { getToken } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [pendingCars, setPendingCars] = useState<TPendingCar[]>([]);
	const [pendingCarOwners, setPendingCarOwners] = useState<
		TPendingCarOwner[]
	>([]);
	const [pendingOwners, setPendingOwners] = useState<TPendingOwner[]>([]);
	const [pendingPhotos, setPendingPhotos] = useState<
		{
			id: string;
			uploadedAt: number;
		}[]
	>([]);
	const [resolvedItems, setResolvedItems] = useState<
		Record<string, 'approved' | 'rejected'>
	>({});

	const markResolved = (
		type: 'car' | 'package' | 'photo',
		id: string,
		status: 'approved' | 'rejected'
	) => {
		setResolvedItems((prev) => ({
			...prev,
			[`${type}:${id}`]: status,
		}));
	};

	const pendingPackages = useMemo<TPackage[]>(
		() =>
			pendingCarOwners.map((carOwner) => ({
				car:
					pendingCars.find(
						(car) => car.proposed.id === carOwner.proposed.car_id
					) ?? null,
				carOwner,
				owner:
					pendingOwners.find(
						(owner) =>
							owner.proposed.id === carOwner.proposed.owner_id
					) ?? null,
			})),
		[pendingCarOwners, pendingCars, pendingOwners]
	);

	const queueItems = useMemo(() => {
		const packagedCarIds = new Set(
			pendingPackages
				.map((pkg) => pkg.car?.id)
				.filter((id): id is string => Boolean(id))
		);

		const packages = pendingPackages.map((pkg) => ({
			kind: 'package' as const,
			id: pkg.carOwner!.id,
			createdAt: Math.max(
				pkg.carOwner!.created_at,
				pkg.car?.created_at ?? 0,
				pkg.owner?.created_at ?? 0
			),
			pkg,
		}));

		const cars = pendingCars
			.filter((car) => !packagedCarIds.has(car.id))
			.map((car) => ({
				kind: 'car' as const,
				id: car.id,
				createdAt: car.created_at,
				car,
			}));

		const photos = pendingPhotos.map((photo) => ({
			kind: 'photo' as const,
			id: photo.id,
			createdAt: photo.uploadedAt,
			photo,
		}));

		return [...packages, ...cars, ...photos].sort(
			(a, b) => b.createdAt - a.createdAt
		);
	}, [pendingPackages, pendingCars, pendingPhotos]);

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
		noindex: true,
	});

	useEffect(() => {
		const loadPendingChanges = async () => {
			try {
				const token = await getToken();

				if (!token) return;

				const [
					carsResponse,
					carOwnersResponse,
					ownersResponse,
					photosResponse,
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
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/owners`,
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
				]);

				const [carsData, carOwnersData, ownersData, photosData] =
					await Promise.all([
						carsResponse.json(),
						carOwnersResponse.json(),
						ownersResponse.json(),
						photosResponse.json(),
					]);

				setPendingCars(carsData);
				setPendingCarOwners(carOwnersData);
				setPendingOwners(ownersData);
				setPendingPhotos(photosData);
			} catch (error) {
				handleApiError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPendingChanges();
	}, [getToken]);

	const handleApprove = async (
		type: 'car' | 'package' | 'photo',
		id: string,
		skipEmail: boolean = false,
		overrides?: PackageApproveOverrides
	) => {
		if (resolvedItems[`${type}:${id}`]) return;

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
					body: JSON.stringify({ skipEmail, overrides }),
				}
			);

			if (!response.ok) {
				const error = await response.json();

				throw new Error(error.details || `Failed to update ${type}`);
			}

			markResolved(type, id, 'approved');
		} catch (error) {
			handleApiError(error);
		}
	};

	const handleReject = async (
		type: 'car' | 'package' | 'photo',
		id: string
	) => {
		if (resolvedItems[`${type}:${id}`]) return;

		try {
			const token = await getToken();

			if (!token) return;

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/moderation/${type}/${id}/reject`,
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

				throw new Error(error.details || `Failed to reject ${type}`);
			}

			markResolved(type, id, 'rejected');
		} catch (error) {
			handleApiError(error);
		}
	};

	const renderCarDiffs = (pending: TPendingCar) =>
		orderedCarDiffFields(pending).map((field) => {
			if (field === 'edition_id') {
				const editionId = pending.proposed.edition_id;

				return (
					<Diff
						key={`car-${field}`}
						label={field}
						oldValue={pending.current?.edition_id}
						newValue={pending.edition ?? editionId}
						subText={pending.edition ? editionId : undefined}
						copyValue={editionId}
					/>
				);
			}

			return (
				<Diff
					key={`car-${field}`}
					label={field as keyof TCar}
					oldValue={pending.current?.[field as keyof TCar]}
					newValue={pending.proposed[field as keyof TCar]}
					subText={
						field === 'vin' && pending.proposed.vin
							? vinValidateLink(pending.proposed.vin)
							: undefined
					}
				/>
			);
		});

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto p-8 lg:p-0 lg:py-8 min-h-[calc(100vh_-_80px)]">
				<h1 className="mb-8 shrink-0 text-2xl lg:text-3xl font-bold">
					Moderation Panel
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
					<div className="space-y-4">
						{queueItems.length === 0 ? (
							<p className="text-brg-border">
								No pending changes
							</p>
						) : (
							queueItems.map((item) => {
								if (item.kind === 'package') {
									return (
										<PackagePendingItem
											key={`package-${item.id}`}
											pkg={item.pkg}
											createdAt={item.createdAt}
											status={
												resolvedItems[
													`package:${item.id}`
												]
											}
											onApprove={(overrides) =>
												handleApprove(
													'package',
													item.id,
													false,
													overrides
												)
											}
											onApproveSkipEmail={(overrides) =>
												handleApprove(
													'package',
													item.id,
													true,
													overrides
												)
											}
											onReject={() =>
												handleReject('package', item.id)
											}
										/>
									);
								}

								if (item.kind === 'photo') {
									return (
										<PendingItem
											key={`photo-${item.id}`}
											carId={item.photo.id}
											createdAt={item.photo.uploadedAt}
											status={
												resolvedItems[
													`photo:${item.photo.id}`
												]
											}
											onApprove={() =>
												handleApprove(
													'photo',
													item.photo.id
												)
											}
											onApproveSkipEmail={() =>
												handleApprove(
													'photo',
													item.photo.id,
													true
												)
											}
											onReject={() =>
												handleReject(
													'photo',
													item.photo.id
												)
											}
										>
											<img
												src={`https://store.miataregistry.com/car-pending/${item.photo.id}.jpg`}
												alt={`Pending photo for car ${item.photo.id}`}
												className="w-full max-w-md rounded-lg"
											/>
										</PendingItem>
									);
								}

								return (
									<PendingItem
										key={`car-${item.id}`}
										carId={item.car.proposed?.id}
										createdAt={item.car.created_at}
										status={
											resolvedItems[`car:${item.car.id}`]
										}
										onApprove={() =>
											handleApprove('car', item.car.id)
										}
										onApproveSkipEmail={() =>
											handleApprove(
												'car',
												item.car.id,
												true
											)
										}
										onReject={() =>
											handleReject('car', item.car.id)
										}
									>
										{renderCarDiffs(item.car)}
									</PendingItem>
								);
							})
						)}
					</div>
				)}
			</div>
		</main>
	);
};
