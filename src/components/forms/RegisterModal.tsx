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

import { useAuth, useClerk } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Field } from '../form/Field';
import { Location } from '../form/Location';
import { SelectStyles } from '../form/Select';
import { TextField } from '../form/TextField';
import { Icon } from '../Icon';
import { Modal } from '../Modal';

interface RegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
	prefilledData?: {
		edition?: string;
		vin?: string;
		sequenceNumber?: string;
	};
}

export function RegisterModal({
	isOpen,
	onClose,
	prefilledData,
}: RegisterModalProps) {
	const { isSignedIn, userId } = useAuth();
	const { openSignIn } = useClerk();
	const [loading, setLoading] = useState(false);
	const [editions, setEditions] = useState<string[]>([]);
	const [isSuccess, setIsSuccess] = useState(false);
	const [showOtherInput, setShowOtherInput] = useState(false);

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

	useEffect(() => {
		if (
			prefilledData?.edition &&
			editions.includes(prefilledData.edition)
		) {
			const form = document.querySelector('form');

			if (form) {
				const editionSelect = form.querySelector(
					'[name="edition"]'
				) as HTMLSelectElement;

				if (editionSelect) {
					editionSelect.value = prefilledData.edition;
				}
			}
		}
	}, [editions, prefilledData]);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);

		try {
			const form = document.querySelector('form#registerForm');

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
						<svg
							className="w-8 h-8 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>

					<div className="flex flex-col gap-2 items-center text-center">
						<h2 className="text-2xl font-bold">Account Required</h2>

						<p className="text-brg-mid">
							Please sign in to{' '}
							{prefilledData?.edition ? 'claim' : 'register'} your
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
							Your information has been submitted successfully.
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
			title={
				prefilledData?.edition
					? `Claim your Miata`
					: 'Register your Miata'
			}
			action={{
				text: 'Submit',
				onClick: () => handleSubmit(),
				loading,
			}}
		>
			<p className="text-brg-mid text-sm mb-6">
				Until the self-
				{prefilledData?.edition ? 'claim' : 'register'} feature is
				available, please fill out the form below to{' '}
				{prefilledData?.edition ? 'claim' : 'register'} your Miata.
			</p>

			<form
				id="registerForm"
				onSubmit={handleSubmit}
				className="flex flex-col gap-4"
			>
				{isSignedIn && (
					<input
						id="userId"
						name="userId"
						type="hidden"
						value={userId}
					/>
				)}

				<div className="space-y-4">
					<Field id="edition" label="Edition" required>
						{prefilledData?.edition ? (
							<TextField
								id="edition"
								name="edition"
								type="text"
								placeholder="1992 M2-1002 Roadster"
								defaultValue={prefilledData.edition}
								required
								readOnly
							/>
						) : !showOtherInput ? (
							<select
								className={SelectStyles(
									false,
									'',
									'w-full border-brg-light text-sm'
								)}
								name="edition"
								required
								onChange={(e) => {
									if (e.target.value === 'other') {
										setShowOtherInput(true);
									}
								}}
							>
								<option value="">Select an edition</option>
								{editions.map((edition) => (
									<option key={edition} value={edition}>
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
									onClick={() => setShowOtherInput(false)}
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
								defaultValue={prefilledData?.sequenceNumber}
								readOnly={!!prefilledData?.sequenceNumber}
							/>
						</Field>

						<Field id="vin" label="VIN" className="w-full" required>
							<TextField
								id="vin"
								name="vin"
								type="text"
								placeholder="JM1NA3510M1221538"
								defaultValue={prefilledData?.vin}
								readOnly={!!prefilledData?.vin}
							/>
						</Field>
					</div>

					<div className="flex justify-between gap-4">
						<Field
							id="ownerName"
							label="Owner Name"
							required
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
							required
							className="w-full"
						>
							<Location
								id="location"
								name="location"
								placeholder="City, Country"
							/>
						</Field>
					</div>

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
		</Modal>
	);
}
