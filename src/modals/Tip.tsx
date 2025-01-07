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

import { useEffect, useState } from 'react';
import { ErrorBanner } from '../components/ErrorBanner';
import { Field } from '../components/form/Field';
import { Location } from '../components/form/Location';
import { SelectStyles } from '../components/form/Select';
import { TextField } from '../components/form/TextField';
import { Modal } from '../components/Modal';
import { useModal } from '../context/ModalContext';
import { handleApiError } from '../utils/common';

export function Tip({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { openModal } = useModal();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editions, setEditions] = useState<Array<{ name: string }>>([]);
	const [showOtherInput, setShowOtherInput] = useState(false);
	const [isOwner, setIsOwner] = useState(false);

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

		loadEditions();
	}, []);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);
		setFormError(null);

		try {
			const form = document.querySelector('form#tipForm');
			if (!form) return;

			const formData = new FormData(form as HTMLFormElement);
			const sequence = formData.get('sequence');
			const vin = formData.get('vin');
			const ownerName = formData.get('owner_name');
			const ownerLocation = formData.get('owner_location');

			if (!sequence && !vin) {
				setFormError('Please provide either a sequence number or VIN');
				return;
			}

			if (!ownerName && !ownerLocation) {
				setFormError('Please provide either an owner name or location');
				return;
			}

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
		} catch (error) {
			handleApiError(error);
			setFormError(
				error instanceof Error
					? error.message
					: 'Failed to submit form. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setIsSuccess(false);

		onClose();
	};

	const handleRegister = () => {
		onClose();

		openModal('register');
	};

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

						<p className="text-brg-mid">
							Your tip has been submitted successfully.
						</p>

						<p className="text-brg-mid">
							We'll review it and update the registry accordingly.
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
			title="Submit a Tip"
			action={
				!isOwner
					? {
							text: 'Submit',
							onClick: () => handleSubmit(),
							loading,
						}
					: {
							text: 'Register',
							onClick: () => handleRegister(),
						}
			}
		>
			<div className="flex flex-col gap-4">
				<ErrorBanner
					error={formError}
					onDismiss={() => setFormError(null)}
				/>

				<label className="flex items-center gap-2 text-sm text-brg-mid">
					<input
						type="checkbox"
						checked={isOwner}
						onChange={(e) => setIsOwner(e.target.checked)}
						className="-mt-px"
					/>
					I am the owner of this vehicle
				</label>

				{isOwner ? (
					<div className="bg-brg/5 rounded-lg p-4 text-sm text-brg-mid">
						Please use the Register form for cars you own
					</div>
				) : (
					<form
						id="tipForm"
						onSubmit={handleSubmit}
						className={`flex flex-col gap-4 ${
							isOwner ? 'opacity-50 pointer-events-none' : ''
						}`}
					>
						<div className="space-y-4">
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
												key={edition.name}
												value={edition.name}
											>
												{edition.name}
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

							<div className="flex flex-col gap-2">
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
										/>
									</Field>

									<Field
										id="vin"
										label="VIN"
										className="w-full"
									>
										<TextField
											id="vin"
											name="vin"
											placeholder="JM1NA3510M1221538"
										/>
									</Field>
								</div>

								<span className="text-xs text-brg-border font-normal">
									Either a sequence number or VIN is required
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<div className="flex justify-between gap-4">
									<Field
										id="owner_name"
										label="Owner Name"
										className="w-64"
									>
										<TextField
											id="owner_name"
											name="owner_name"
											placeholder="John Doe"
										/>
									</Field>

									<Field
										id="owner_location"
										label="Location"
										className="w-full"
									>
										<Location
											id="owner_location"
											name="owner_location"
											placeholder="City, Country"
										/>
									</Field>
								</div>

								<span className="text-xs text-brg-border font-normal">
									Either an owner name or location is required
								</span>
							</div>

							<Field
								id="information"
								label="Additional Information"
							>
								<TextField
									id="information"
									name="information"
									type="textarea"
									placeholder="Any other information, like social media links, etc."
								/>
							</Field>
						</div>
					</form>
				)}
			</div>
		</Modal>
	);
}
