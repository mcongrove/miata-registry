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

import emailjs from '@emailjs/browser';
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { Field } from '../form/Field';
import { TextField } from '../form/TextField';
import { SelectStyles } from '../Select';

export function TipModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const [loading, setLoading] = useState(false);
	const [editions, setEditions] = useState<string[]>([]);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);

		try {
			const formData = new FormData(e.currentTarget);

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

			await emailjs.send(
				import.meta.env.VITE_EMAILJS_SERVICE_ID,
				'template_ppq6jga',
				{
					tipId,
					edition: formData.get('edition'),
					information: formData.get('information') || 'Not provided',
					location: formData.get('location') || 'Not provided',
					ownerName: formData.get('ownerName') || 'Not provided',
					sequenceNumber:
						formData.get('sequenceNumber') || 'Not provided',
					vin: formData.get('vin') || 'Not provided',
				},
				import.meta.env.VITE_EMAILJS_PUBLIC_KEY
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

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[51]">
			<div className="flex flex-col gap-4 bg-white rounded-lg p-6 max-w-lg w-full">
				{isSuccess ? (
					<div className="flex flex-col items-center gap-6 py-8">
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
							<h2 className="text-2xl font-bold mb-2">
								Thank You!
							</h2>
							<p className="text-brg-mid">
								Your tip has been submitted successfully. We'll
								review it and update the registry accordingly.
							</p>
						</div>
						<Button onClick={handleClose} className="text-sm">
							Close
						</Button>
					</div>
				) : (
					<>
						<h2 className="text-2xl font-bold">Submit a Tip</h2>

						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-4"
						>
							<div className="space-y-4">
								<Field id="edition" label="Edition" required>
									<select
										className={SelectStyles(
											false,
											'',
											'w-full border-brg-light'
										)}
										name="edition"
										required
									>
										<option value="">
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
									</select>
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

									<Field
										id="vin"
										label="VIN"
										className="w-full"
									>
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
										<TextField
											id="location"
											name="location"
											type="text"
											placeholder="City, State, Country"
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
										placeholder="Any other information, like social media links, etc..."
									/>
								</Field>
							</div>

							<div className="flex justify-end gap-2">
								<Button
									onClick={onClose}
									variant="tertiary"
									className={`text-brg-border text-sm ${
										loading ? 'hidden' : ''
									}`}
								>
									Cancel
								</Button>

								<Button
									type="submit"
									disabled={loading}
									className="text-sm"
								>
									{loading ? 'Submitting...' : 'Submit Tip'}
								</Button>
							</div>
						</form>
					</>
				)}
			</div>
		</div>
	);
}
