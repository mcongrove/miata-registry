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

import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ErrorBanner } from '../components/ErrorBanner';
import { Field } from '../components/form/Field';
import { Location } from '../components/form/Location';
import { SelectStyles } from '../components/form/Select';
import { TextField } from '../components/form/TextField';
import { Modal } from '../components/Modal';
import { TOwner } from '../types/Owner';
import { handleApiError } from '../utils/common';
import { formatLocation, parseLocation } from '../utils/location';

interface RegisterProps {
	isOpen: boolean;
	onClose: () => void;
	props?: {
		prefilledData?: {
			edition_name?: string;
			id?: string;
			sequence?: string;
			vin?: string;
		};
	};
}

export function Register({ isOpen, onClose, props }: RegisterProps) {
	const { isSignedIn, userId, getToken } = useAuth();
	const { user } = useUser();
	const { openSignIn } = useClerk();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editions, setEditions] = useState<string[]>([]);
	const [showOtherInput, setShowOtherInput] = useState(false);
	const [existingOwner, setExistingOwner] = useState<TOwner | null>(null);
	const [formDataLoading, setFormDataLoading] = useState(false);
	const prefilledData = props?.prefilledData;

	useEffect(() => {
		const loadEditions = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/editions/names`
				);

				const editionNames = await response.json();

				setEditions(editionNames);
			} catch (error) {
				console.error('Error loading editions:', error);

				setEditions([]);
			}
		};

		if (!prefilledData?.id) {
			loadEditions();
		}
	}, []);

	useEffect(() => {
		const checkExistingOwner = async () => {
			if (!userId || !isSignedIn) return;

			try {
				const token = await getToken();

				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const data = await response.json();

				setExistingOwner(data.owner);
				setFormDataLoading(true);
			} catch (error) {
				handleApiError(error);
			}
		};

		checkExistingOwner();
	}, [userId, isSignedIn, getToken]);

	useEffect(() => {
		if (
			prefilledData?.edition_name &&
			editions.includes(prefilledData.edition_name)
		) {
			const form = document.querySelector('form');

			if (form) {
				const editionSelect = form.querySelector(
					'[name="edition"]'
				) as HTMLSelectElement;

				if (editionSelect) {
					editionSelect.value = prefilledData.edition_name;
				}
			}
		}
	}, [editions, prefilledData]);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);
		setFormError(null);

		try {
			const form = document.querySelector('form#registerForm');
			const token = await getToken();

			if (!form || !token) return;

			const formData = new FormData(form as HTMLFormElement);

			if (prefilledData?.id) {
				const owner_location = formData.get('owner_location')
					? parseLocation(formData.get('owner_location') as string)
					: null;

				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							car_id: prefilledData.id,
							information: formData.get('information'),
							owner_date_start: formData.get('owner_date_start'),
							owner_id: existingOwner?.id || undefined,
							owner_name: formData.get('owner_name'),
							owner_city: owner_location?.city,
							owner_state: owner_location?.state,
							owner_country: owner_location?.country,
						}),
					}
				);

				if (!response.ok) {
					const error = await response.json();

					throw new Error(
						error.details || 'Failed to submit ownership claim'
					);
				}

				setIsSuccess(true);
			} else {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/tips`,
					{
						method: 'POST',
						body: formData,
					}
				);

				if (!response.ok) {
					const error = await response.json();

					throw new Error(error.details || 'Failed to submit tip');
				}

				setIsSuccess(true);
			}
		} catch (error) {
			handleApiError(error);
			setFormError('Failed to submit form. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setIsSuccess(false);

		onClose();
	};

	if (!isSignedIn) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				action={{
					text: 'Sign In',
					onClick: () => {
						handleClose();
						openSignIn({});
					},
				}}
				allowClickOut
			>
				<div className="flex flex-col items-center gap-6 py-6">
					<div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
						<i className="fa-solid fa-fw fa-times text-red-500 text-3xl" />
					</div>

					<div className="flex flex-col gap-2 items-center text-center">
						<h2 className="text-2xl font-bold">Account Required</h2>

						<p className="text-brg-mid">
							Please sign in to{' '}
							{prefilledData?.id ? 'claim' : 'register'} your
							Miata.
						</p>

						<p className="text-brg-mid w-80">
							This ensures you can edit your car's information in
							the future.
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	if (isSuccess) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				hideCancel
				action={{
					text: 'Close',
					onClick: handleClose,
				}}
				allowClickOut
			>
				<div className="flex flex-col items-center gap-6 pt-6">
					<div className="w-16 h-16 rounded-full bg-brg/10 flex items-center justify-center">
						<i className="fa-solid fa-fw fa-check text-brg text-3xl" />
					</div>

					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Thank You!</h2>

						<p className="text-brg-mid mb-2">
							Your information has been submitted successfully.
						</p>

						<p className="text-brg-mid">
							Please send any supporting documentation to{' '}
							<a
								href={`mailto:support@miataregistry.com?subject=Car%20Documentation`}
								className="underline"
							>
								support@miataregistry.com
							</a>
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={
				prefilledData?.id ? `Claim your Miata` : 'Register your Miata'
			}
			action={{
				text: 'Submit',
				onClick: () => handleSubmit(),
				loading,
			}}
		>
			<div
				className={twMerge(
					'flex flex-col gap-4',
					!formDataLoading && 'opacity-50'
				)}
			>
				<p className="text-brg-mid text-sm">
					Until the self-
					{prefilledData?.id ? 'claim' : 'register'} feature is
					available, please fill out the form below to{' '}
					{prefilledData?.id ? 'claim' : 'register'} your Miata.
				</p>

				<ErrorBanner
					error={formError}
					onDismiss={() => setFormError(null)}
				/>

				<form
					id="registerForm"
					onSubmit={handleSubmit}
					className="flex flex-col gap-4"
				>
					{user?.id && (
						<input type="hidden" name="user_id" value={user.id} />
					)}

					<div className="space-y-4">
						{!prefilledData?.id && (
							<Field id="edition_name" label="Edition" required>
								{!showOtherInput ? (
									<select
										className={SelectStyles(
											false,
											'w-full border-brg-light text-sm'
										)}
										name="edition_name"
										required
										onChange={(e) => {
											if (e.target.value === 'other') {
												setShowOtherInput(true);
											}
										}}
										defaultValue=""
									>
										<option value="" disabled>
											Select an edition
										</option>
										{editions.map((edition) => (
											<option
												key={edition}
												value={edition}
											>
												{edition}
											</option>
										))}
										<option value="other">Other</option>
									</select>
								) : (
									<div className="flex items-center gap-2">
										<TextField
											id="edition_name"
											name="edition_name"
											placeholder="1992 M2-1002 Roadster"
											required
										/>

										<i
											className="fa-solid fa-times text-brg-mid cursor-pointer"
											onClick={() =>
												setShowOtherInput(false)
											}
										/>
									</div>
								)}
							</Field>
						)}

						<div className="flex justify-between gap-4">
							<Field
								id="sequence"
								label="Sequence #"
								className="w-32"
							>
								<TextField
									id="sequence"
									name="sequence"
									placeholder="182"
									defaultValue={prefilledData?.sequence}
									readOnly={!!prefilledData?.sequence}
									className={twMerge(
										prefilledData?.sequence &&
											'bg-brg-light text-brg-mid'
									)}
								/>
							</Field>

							<Field
								id="vin"
								label="VIN"
								className="w-full"
								required={!prefilledData?.id}
							>
								<TextField
									id="vin"
									name="vin"
									placeholder="JM1NA3510M1221538"
									defaultValue={prefilledData?.vin}
									readOnly={!!prefilledData?.vin}
									className={twMerge(
										prefilledData?.vin &&
											'bg-brg-light text-brg-mid'
									)}
								/>
							</Field>
						</div>

						<div className="flex justify-between gap-4">
							<Field
								id="owner_name"
								label="Your Name"
								className="w-64"
								required
							>
								<TextField
									id="owner_name"
									name="owner_name"
									placeholder="John Doe"
									defaultValue={
										existingOwner?.name ||
										user?.fullName ||
										''
									}
								/>
							</Field>

							<Field
								id="owner_location"
								label="Your Location"
								required
								className="w-full"
							>
								<Location
									id="owner_location"
									name="owner_location"
									placeholder="City, Country"
									value={
										existingOwner
											? formatLocation({
													city:
														existingOwner.city ||
														'',
													state:
														existingOwner.state ||
														'',
													country:
														existingOwner.country ||
														'',
												})
											: undefined
									}
								/>
							</Field>
						</div>

						<Field
							id="owner_date_state"
							label="Purchase Date"
							className="w-36"
							required
						>
							<TextField
								id="owner_date_start"
								name="owner_date_start"
								type="date"
								placeholder="1990-01-01"
							/>
						</Field>

						<Field id="information" label="Additional Information">
							<TextField
								id="information"
								name="information"
								type="textarea"
								placeholder="Any other information, like social media links, photo links, etc., which will help us associate you with your Miata."
							/>
						</Field>
					</div>
				</form>
			</div>
		</Modal>
	);
}
