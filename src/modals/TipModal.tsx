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
import { Field } from '../components/form/Field';
import { Location } from '../components/form/Location';
import { SelectStyles } from '../components/form/Select';
import { TextField } from '../components/form/TextField';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { useModal } from '../context/ModalContext';

export function TipModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { openModal } = useModal();
	const [loading, setLoading] = useState(false);
	const [editions, setEditions] = useState<string[]>([]);
	const [isSuccess, setIsSuccess] = useState(false);
	const [showOtherInput, setShowOtherInput] = useState(false);
	const [isOwner, setIsOwner] = useState(false);

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

		loadEditions();
	}, []);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);

		try {
			const form = document.querySelector('form#tipForm');

			if (!form) return;

			const formData = new FormData(form as HTMLFormElement);

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

			const { tipId } = await response.json();

			await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/email/tip`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						tipId,
						edition: formData.get('edition'),
						vin: formData.get('vin') || 'Not provided',
						sequenceNumber:
							formData.get('sequenceNumber') || 'Not provided',
						ownerName: formData.get('ownerName') || 'Not provided',
						location: formData.get('location') || 'Not provided',
						information:
							formData.get('information') || 'Not provided',
					}),
				}
			);

			setIsSuccess(true);
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: 'Failed to submit tip. Please try again.'
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
						<svg
							className="w-8 h-8 text-brg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
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
			onClose={onClose}
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
							<Field id="edition" label="Edition" required>
								{!showOtherInput ? (
									<select
										className={SelectStyles(
											false,
											'w-full border-brg-light text-sm'
										)}
										name="edition"
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
											id="edition"
											name="edition"
											type="text"
											placeholder="1992 M2-1002 Roadster"
											required
										/>

										<Icon
											name="x"
											className="size-3.5"
											onClick={() =>
												setShowOtherInput(false)
											}
										/>
									</div>
								)}
							</Field>

							<div className="flex justify-between gap-4">
								<Field
									id="sequenceNumber"
									label="Sequence #"
									className="w-32"
								>
									<TextField
										id="sequenceNumber"
										name="sequenceNumber"
										type="text"
										placeholder="182"
									/>
								</Field>

								<Field id="vin" label="VIN" className="w-full">
									<TextField
										id="vin"
										name="vin"
										type="text"
										placeholder="JM1NA3510M1221538"
									/>
								</Field>
							</div>

							<div className="flex justify-between gap-4">
								<Field
									id="ownerName"
									label="Owner Name"
									className="w-64"
								>
									<TextField
										id="ownerName"
										name="ownerName"
										type="text"
										placeholder="John Doe"
									/>
								</Field>

								<Field
									id="location"
									label="Location"
									className="w-full"
								>
									<Location
										id="location"
										name="location"
										placeholder="City, Country"
									/>
								</Field>
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
