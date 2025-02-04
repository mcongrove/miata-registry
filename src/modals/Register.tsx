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
import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
	const [formError, setFormError] = useState<string | ReactNode | null>(null);
	const [isFormValid, setIsFormValid] = useState(false);
	const [editions, setEditions] = useState<Array<{ name: string }>>([]);
	const [showOtherInput, setShowOtherInput] = useState(false);
	const [existingOwner, setExistingOwner] = useState<TOwner | null>(null);
	const [formDataLoading, setFormDataLoading] = useState(false);
	const prefilledData = props?.prefilledData;
	const [selectedEdition, setSelectedEdition] = useState<string>('');

	useEffect(() => {
		const loadEditions = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/editions/names`
				);

				const editionData = await response.json();

				setEditions(editionData);
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
			editions.some((e) => e.name === prefilledData.edition_name)
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

	useEffect(() => {
		const form = document.querySelector(
			'form#registerForm'
		) as HTMLFormElement;

		if (form) {
			const checkValidity = () => {
				setIsFormValid(form.checkValidity());
			};

			checkValidity();

			form.querySelectorAll('input, select, textarea').forEach(
				(input) => {
					input.addEventListener('input', checkValidity);
				}
			);

			return () => {
				form.querySelectorAll('input, select, textarea').forEach(
					(input) => {
						input.removeEventListener('input', checkValidity);
					}
				);
			};
		}
	}, [formDataLoading]);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);
		setFormError(null);

		try {
			const form = document.querySelector(
				'form#registerForm'
			) as HTMLFormElement;

			if (!form?.checkValidity()) {
				form?.reportValidity();

				return;
			}

			const token = await getToken();

			if (!form || !token) return;

			const formData = new FormData(form as HTMLFormElement);

			const owner_location = formData.get('owner_location')
				? parseLocation(formData.get('owner_location') as string)
				: null;

			if (prefilledData?.id) {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/claims/existing`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							car_id: prefilledData.id,
							information: formData.get('information'),
							owner_city: owner_location?.city,
							owner_country: owner_location?.country,
							owner_date_start: formData.get('owner_date_start'),
							owner_id: existingOwner?.id || undefined,
							owner_name: (formData.get('owner_name') as string)
								.replace(/\s+/g, ' ')
								.trim(),
							owner_state: owner_location?.state,
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
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/claims/new`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							edition_name: formData.get('edition_name'),
							information: formData.get('information'),
							owner_city: owner_location?.city,
							owner_country: owner_location?.country,
							owner_date_start: formData.get('owner_date_start'),
							owner_id: existingOwner?.id || undefined,
							owner_name: (formData.get('owner_name') as string)
								.replace(/\s+/g, ' ')
								.trim(),
							owner_state: owner_location?.state,
							sequence: formData.get('sequence'),
							vin: formData.get('vin'),
						}),
					}
				);

				if (!response.ok) {
					const error = await response.json();

					console.log(error);

					if (error.error === 'Conflict' && error.details.id) {
						setFormError(
							<>
								This car already exists in our database.{' '}
								<Link
									to={`/registry/${error.details.id}`}
									className="underline"
									onClick={handleClose}
								>
									Click here
								</Link>{' '}
								to view and claim.
							</>
						);

						return;
					} else {
						throw new Error(
							error.details || 'Failed to submit tip'
						);
					}
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
							Your information has been submitted and will be
							reviewed by the Miata Registry team.
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
				disabled: !isFormValid,
			}}
		>
			<div
				className={twMerge(
					'flex flex-col gap-4',
					!formDataLoading && 'opacity-50'
				)}
			>
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
									<>
										<select
											className={SelectStyles(
												false,
												'w-full border-brg-light text-sm z-10'
											)}
											name="edition_name"
											required
											onChange={(e) => {
												if (
													e.target.value === 'other'
												) {
													setShowOtherInput(true);
												}

												setSelectedEdition(
													e.target.value
												);
											}}
											defaultValue=""
										>
											<option value="" disabled>
												Select an edition
											</option>
											{editions.map((edition) => (
												<option
													key={edition.name}
													value={edition.name}
												>
													{edition.name}
												</option>
											))}
											{/* <option value="other">Other</option> */}
										</select>

										{selectedEdition ===
											'1990 Color Test Cars' && (
											<ErrorBanner
												className="p-2 pt-3.5 pb-2.5 -mt-3 rounded-t-none z-0"
												error={
													<span className="text-xs font-medium">
														No, it probably isn't.{' '}
														<span className="font-normal opacity-60">
															There were only 6
															produced.
														</span>
													</span>
												}
											/>
										)}
									</>
								) : (
									<>
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

										<span className="text-xs text-brg-border mt-1">
											Only Miatas produced in limited
											quantities are eligible for the
											Registry.
										</span>
									</>
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
									maxLength={4}
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
									maxLength={17}
									placeholder="JM1NA3510M1221538"
									required
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
									required
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
									required
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
							id="owner_date_start"
							label="Purchase Date"
							className="w-36"
							required
						>
							<TextField
								id="owner_date_start"
								required
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
