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
import { twMerge } from 'tailwind-merge';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { Field } from '../components/form/Field';
import { TextField } from '../components/form/TextField';
import { Modal } from '../components/Modal';
import { Diff } from '../components/moderation/Diff';
import { PendingItem } from '../components/moderation/PendingItem';
import { Stats } from '../components/moderation/Stats';
import { usePageMeta } from '../hooks/usePageMeta';
import { TCar, TCarPending } from '../types/Car';
import { TModerationStats } from '../types/Common';
import {
	TCarOwner,
	TCarOwnerPending,
	TOwner,
	TOwnerPending,
} from '../types/Owner';
import { handleApiError } from '../utils/common';

export const Moderation = () => {
	const { user, isLoaded } = useUser();
	const { getToken } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<string>('packages');
	const [pendingCars, setPendingCars] = useState<
		(TCarPending & { current: TCar | null; proposed: TCar })[]
	>([]);
	const [pendingCarOwners, setPendingCarOwners] = useState<
		(TCarOwnerPending & {
			current: TCarOwner | null;
			proposed: TCarOwner;
		})[]
	>([]);
	const [pendingOwners, setPendingOwners] = useState<
		(TOwnerPending & {
			proposed: TOwner;
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
	const [showEmailModal, setShowEmailModal] = useState(false);
	const [emailLoading, setEmailLoading] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [pendingPackages, setPendingPackages] = useState<
		{
			car:
				| (TCarPending & { current: TCar | null; proposed: TCar })
				| null;
			carOwner:
				| (TCarOwnerPending & {
						current: TCarOwner | null;
						proposed: TCarOwner;
				  })
				| null;
			owner:
				| (TOwnerPending & {
						proposed: TOwner;
				  })
				| null;
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
					ownersResponse,
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

				const [
					carsData,
					carOwnersData,
					ownersData,
					photosData,
					statsData,
				] = await Promise.all([
					carsResponse.json(),
					carOwnersResponse.json(),
					ownersResponse.json(),
					photosResponse.json(),
					statsResponse.json(),
				]);

				setPendingCars(carsData);
				setPendingCarOwners(carOwnersData);
				setPendingOwners(ownersData);
				setPendingPhotos(photosData);
				setStats(statsData);

				const packages: typeof pendingPackages = [];

				carOwnersData.forEach((carOwner) => {
					const relatedCar = carsData.find(
						(car) => car.proposed.id === carOwner.proposed.car_id
					);
					const relatedOwner = ownersData.find(
						(owner) =>
							owner.proposed.id === carOwner.proposed.owner_id
					);

					if (relatedCar || relatedOwner) {
						packages.push({
							car: relatedCar || null,
							carOwner: carOwner,
							owner: relatedOwner || null,
						});
					}
				});

				setPendingPackages(packages);
			} catch (error) {
				handleApiError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPendingChanges();
	}, []);

	const handleApprove = async (
		type: 'car' | 'carOwner' | 'owner' | 'photo',
		id: string,
		skipEmail: boolean = false
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
					body: JSON.stringify({ skipEmail }),
				}
			);

			if (!response.ok) {
				const error = await response.json();

				throw new Error(error.details || `Failed to update ${type}`);
			}

			if (type === 'car') {
				setPendingCars((cars) => cars.filter((car) => car.id !== id));
			} else if (type === 'carOwner') {
				setPendingCarOwners((carOwners) =>
					carOwners.filter((carOwner) => carOwner.id !== id)
				);
			} else if (type === 'owner') {
				setPendingOwners((owners) =>
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
		type: 'car' | 'carOwner' | 'owner' | 'photo',
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
				setPendingCarOwners((carOwners) =>
					carOwners.filter((carOwner) => carOwner.id !== id)
				);
			} else if (type === 'owner') {
				setPendingOwners((owners) =>
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

	const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setEmailLoading(true);
		setEmailError(null);

		try {
			const token = await getToken();

			if (!token) return;

			const form = document.getElementById('emailForm');

			if (!form) {
				throw new Error('Form not found');
			}

			const formData = new FormData(form as HTMLFormElement);

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/email/send`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						to: formData.get('to'),
						subject: formData.get('subject'),
						message: formData.get('message'),
					}),
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.details || 'Failed to send email');
			}

			setShowEmailModal(false);
		} catch (error) {
			handleApiError(error);
			setEmailError('Failed to send email. Please try again.');
		} finally {
			setEmailLoading(false);
		}
	};

	const openEmailModal = (type?: 'rejection') => {
		setShowEmailModal(true);

		if (type === 'rejection') {
			setTimeout(() => {
				const form = document.getElementById(
					'emailForm'
				) as HTMLFormElement;

				if (form) {
					const subjectField = form.querySelector(
						'[name="subject"]'
					) as HTMLInputElement;

					const messageField = form.querySelector(
						'[name="message"]'
					) as HTMLTextAreaElement;

					if (subjectField) subjectField.value = 'Your Submission';

					if (messageField)
						messageField.value =
							"Thank you for your submission to the Miata Registry. We truly appreciate your interest and the time you took to share your Miata with us.\n\nAt present, our registry is focused specifically on Miatas that were produced by Mazda in capped quantities during their original production runs. While your Miata is certainly special, it doesn't fall into this specific category of limited edition vehicles.\n\nWe are keeping record of all submissions, as we hope to expand the scope of our registry in the future to include other Miatas. When that time comes, we would be delighted to revisit your submission. Please continue to enjoy and preserve your Miata, and don't hesitate to submit again if you acquire a limited edition model in the future.\n\nIf you think this decision was made in error, please reply to this email and we will be happy to review your submission again; sending documentation such as photos or original sales paperwork to support your claim is helpful.";
				}
			}, 100);
		}
	};

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto p-8 lg:p-0 lg:py-8 min-h-[calc(100vh_-_80px)]">
				<h1 className="flex justify-between items-center text-2xl lg:text-3xl font-bold mb-4">
					<div className="flex flex-col gap-3">
						Moderation Panel{' '}
						<div className="w-60">
							<Stats stats={stats} />
						</div>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={() => openEmailModal()}
							variant="secondary"
							className="lg:px-2.5 lg:py-2"
						>
							<i className="fa-solid fa-fw fa-envelope text-white text-xl"></i>
						</Button>

						<Button
							onClick={() => openEmailModal('rejection')}
							variant="secondary"
							className="lg:px-2.5 lg:py-2 bg-red-800"
						>
							<i className="fa-solid fa-fw fa-envelope text-white text-xl" />
						</Button>
					</div>
				</h1>

				<div className="w-fit flex mb-8 overflow-x-auto">
					<div className="flex gap-2 p-1 bg-brg-light rounded-lg w-full relative">
						{(() => {
							const tabs = {
								packages: 'Packages',
								cars: 'Cars',
								carOwners: 'Car Owners',
								owners: 'Owners',
								photos: 'Photos',
							};

							return (
								<>
									<div
										className="absolute transition-all w-[calc(20%_-_2px)] duration-200 ease-in-out h-[calc(100%-8px)] bg-white rounded-md shadow-sm"
										style={{
											transform: `translateX(${Object.keys(tabs).indexOf(activeTab) * 100}%)`,
										}}
									/>

									{Object.entries(tabs).map(
										([key, label]) => (
											<button
												key={key}
												onClick={() =>
													setActiveTab(key)
												}
												className={twMerge(
													`w-32 relative flex-1 px-4 py-2 text-sm rounded-md transition-colors disabled:text-brg-border/70 whitespace-nowrap`,
													activeTab === key
														? 'text-brg'
														: 'text-brg-mid hover:text-brg'
												)}
												disabled={
													key === 'packages'
														? !pendingPackages.length
														: key === 'cars'
															? !pendingCars.filter(
																	(car) =>
																		!pendingPackages.some(
																			(
																				pkg
																			) =>
																				pkg
																					.car
																					?.id ===
																				car.id
																		)
																).length
															: key ===
																  'carOwners'
																? !pendingCarOwners.filter(
																		(
																			carOwner
																		) =>
																			!pendingPackages.some(
																				(
																					pkg
																				) =>
																					pkg
																						.carOwner
																						?.id ===
																					carOwner.id
																			)
																	).length
																: key ===
																	  'owners'
																	? !pendingOwners.filter(
																			(
																				owner
																			) =>
																				!pendingPackages.some(
																					(
																						pkg
																					) =>
																						pkg
																							.owner
																							?.id ===
																						owner.id
																				)
																		).length
																	: !pendingPhotos.length
												}
											>
												{label}{' '}
												<span className="text-brg-border">
													{key === 'packages'
														? pendingPackages.length
														: key === 'cars'
															? pendingCars.filter(
																	(car) =>
																		!pendingPackages.some(
																			(
																				pkg
																			) =>
																				pkg
																					.car
																					?.id ===
																				car.id
																		)
																).length
															: key ===
																  'carOwners'
																? pendingCarOwners.filter(
																		(
																			carOwner
																		) =>
																			!pendingPackages.some(
																				(
																					pkg
																				) =>
																					pkg
																						.carOwner
																						?.id ===
																					carOwner.id
																			)
																	).length
																: key ===
																	  'owners'
																	? pendingOwners.filter(
																			(
																				owner
																			) =>
																				!pendingPackages.some(
																					(
																						pkg
																					) =>
																						pkg
																							.owner
																							?.id ===
																						owner.id
																				)
																		).length
																	: pendingPhotos.length}
												</span>
											</button>
										)
									)}
								</>
							);
						})()}
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
						{activeTab === 'packages' && (
							<div className="space-y-4">
								{pendingPackages.length === 0 ? (
									<p className="text-brg-border">
										No pending packages
									</p>
								) : (
									pendingPackages.map((pkg, index) => (
										<div
											key={index}
											className="space-y-2 p-2 bg-brg-light rounded-lg"
										>
											{pkg.owner && (
												<PendingItem
													ownerId={
														pkg.owner.proposed?.id
													}
													createdAt={
														pkg.owner.created_at
													}
													onApprove={() =>
														handleApprove(
															'owner',
															pkg.owner.id
														)
													}
													onReject={() =>
														handleReject(
															'owner',
															pkg.owner.id
														)
													}
												>
													{Object.keys(
														pkg.owner.proposed
													).map((field) => (
														<Diff
															key={field}
															label={
																field as keyof TOwner
															}
															oldValue={undefined}
															newValue={
																pkg.owner
																	.proposed[
																	field as keyof TOwner
																] as any
															}
														/>
													))}
												</PendingItem>
											)}

											{pkg.car && (
												<PendingItem
													carId={pkg.car.proposed?.id}
													createdAt={
														pkg.car.created_at
													}
													onApproveSkipEmail={() =>
														handleApprove(
															'car',
															pkg.car!.id,
															true
														)
													}
													onReject={() =>
														handleReject(
															'car',
															pkg.car!.id
														)
													}
												>
													{Object.keys(
														pkg.car.proposed
													)
														.filter(
															(field) =>
																pkg.car!
																	.proposed[
																	field as keyof TCar
																] !==
																pkg.car!
																	.current?.[
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
																	pkg.car!
																		.current?.[
																		field as keyof TCar
																	] as any
																}
																newValue={
																	pkg.car!
																		.proposed[
																		field as keyof TCar
																	] as any
																}
															/>
														))}
												</PendingItem>
											)}

											{pkg.carOwner && (
												<PendingItem
													carId={
														pkg.carOwner.proposed
															?.car_id
													}
													ownerId={
														pkg.carOwner.proposed
															?.owner_id
													}
													createdAt={
														pkg.carOwner.created_at
													}
													onApprove={() =>
														handleApprove(
															'carOwner',
															pkg.carOwner.id
														)
													}
													onReject={() =>
														handleReject(
															'carOwner',
															pkg.carOwner.id
														)
													}
												>
													{Object.keys(
														pkg.carOwner.proposed
													)
														.filter(
															(field) =>
																pkg.carOwner
																	.proposed[
																	field as keyof TCarOwner
																] !==
																pkg.carOwner
																	.current?.[
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
																	pkg.carOwner
																		.current?.[
																		field as keyof TCarOwner
																	] as any
																}
																newValue={
																	pkg.carOwner
																		.proposed[
																		field as keyof TCarOwner
																	] as any
																}
															/>
														))}
												</PendingItem>
											)}
										</div>
									))
								)}
							</div>
						)}

						{activeTab === 'cars' && (
							<div className="space-y-4">
								{pendingCars.filter(
									(car) =>
										!pendingPackages.some(
											(pkg) => pkg.car?.id === car.id
										)
								).length === 0 ? (
									<p className="text-brg-border">
										No pending changes
									</p>
								) : (
									pendingCars
										.filter(
											(car) =>
												!pendingPackages.some(
													(pkg) =>
														pkg.car?.id === car.id
												)
										)
										.map((pending) => (
											<PendingItem
												key={pending.id}
												carId={pending.proposed?.id}
												createdAt={pending.created_at}
												onApprove={() =>
													handleApprove(
														'car',
														pending.id
													)
												}
												onApproveSkipEmail={() =>
													handleApprove(
														'car',
														pending.id,
														true
													)
												}
												onReject={() =>
													handleReject(
														'car',
														pending.id
													)
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
																pending
																	.current?.[
																	field as keyof TCar
																] as any
															}
															newValue={
																pending
																	.proposed[
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

						{activeTab === 'carOwners' && (
							<div className="space-y-4">
								{pendingCarOwners.filter(
									(carOwner) =>
										!pendingPackages.some(
											(pkg) =>
												pkg.carOwner?.id === carOwner.id
										)
								).length === 0 ? (
									<p className="text-brg-border">
										No pending changes
									</p>
								) : (
									pendingCarOwners
										.filter(
											(carOwner) =>
												!pendingPackages.some(
													(pkg) =>
														pkg.carOwner?.id ===
														carOwner.id
												)
										)
										.map((pending) => (
											<PendingItem
												key={pending.id}
												carId={pending.proposed?.car_id}
												ownerId={
													pending.proposed?.owner_id
												}
												createdAt={pending.created_at}
												onApprove={() =>
													handleApprove(
														'carOwner',
														pending.id
													)
												}
												onApproveSkipEmail={() =>
													handleApprove(
														'carOwner',
														pending.id,
														true
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
																pending
																	.current?.[
																	field as keyof TCarOwner
																] as any
															}
															newValue={
																pending
																	.proposed[
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

						{activeTab === 'owners' && (
							<div className="space-y-4">
								{pendingOwners.filter(
									(owner) =>
										!pendingPackages.some(
											(pkg) => pkg.owner?.id === owner.id
										)
								).length === 0 ? (
									<p className="text-brg-border">
										No pending changes
									</p>
								) : (
									pendingOwners
										.filter(
											(owner) =>
												!pendingPackages.some(
													(pkg) =>
														pkg.owner?.id ===
														owner.id
												)
										)
										.map((pending) => (
											<PendingItem
												key={pending.id}
												ownerId={pending.proposed?.id}
												createdAt={pending.created_at}
												onApprove={() =>
													handleApprove(
														'owner',
														pending.id
													)
												}
												onReject={() =>
													handleReject(
														'owner',
														pending.id
													)
												}
											>
												{Object.keys(
													pending.proposed
												).map((field) => (
													<Diff
														key={field}
														label={
															field as keyof TOwner
														}
														oldValue={undefined}
														newValue={
															pending.proposed[
																field as keyof TOwner
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

			{showEmailModal && (
				<Modal
					isOpen={showEmailModal}
					onClose={() => setShowEmailModal(false)}
					title="Send Email"
					action={{
						text: 'Send',
						onClick: () => {
							const form = document.getElementById(
								'emailForm'
							) as HTMLFormElement;
							form?.requestSubmit();
						},
						loading: emailLoading,
					}}
				>
					<div className="flex flex-col gap-4">
						<ErrorBanner
							error={emailError}
							onDismiss={() => setEmailError(null)}
						/>

						<form
							id="emailForm"
							onSubmit={handleSendEmail}
							className="flex flex-col gap-4"
						>
							<Field id="to" label="To" required>
								<TextField
									id="to"
									name="to"
									type="email"
									placeholder="email@example.com"
									required
								/>
							</Field>

							<Field id="subject" label="Subject" required>
								<TextField
									id="subject"
									name="subject"
									placeholder="Email subject"
									required
								/>
							</Field>

							<Field id="message" label="Message" required>
								<TextField
									id="message"
									name="message"
									type="textarea"
									placeholder="Email message"
									required
								/>
							</Field>
						</form>
					</div>
				</Modal>
			)}
		</main>
	);
};
