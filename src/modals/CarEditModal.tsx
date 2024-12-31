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

import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import { Field } from '../components/form/Field';
import { Location } from '../components/form/Location';
import { TextField } from '../components/form/TextField';
import { Modal } from '../components/Modal';
import { TCar } from '../types/Car';
import { TLocation } from '../types/Location';
import { TCarOwner } from '../types/Owner';
import { formatLocation, parseLocation } from '../utils/geo';
interface CarEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	car: TCar & {
		owner_history?: TCarOwner[];
	};
}

export function CarEditModal({ isOpen, onClose, car }: CarEditModalProps) {
	const { isSignedIn, userId } = useAuth();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [hasSequenceWarning, setHasSequenceWarning] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<TLocation | null>(
		null
	);

	const handleSequenceChange = (e: any) => {
		const newValue = e.target.value ? Number(e.target.value) : null;

		setHasSequenceWarning(newValue !== car.sequence);
	};

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);

		try {
			const form = document.querySelector('form#carEditForm');

			if (!form) return;

			const formData = new FormData(form as HTMLFormElement);

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${car.id}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						sequence: formData.get('sequence')
							? Number(formData.get('sequence'))
							: null,
						manufacture_date:
							formData.get('manufacture_date') || null,
						sale_msrp: formData.get('sale_msrp')
							? Number(formData.get('sale_msrp'))
							: null,
						sale_date: formData.get('sale_date') || null,
						sale_dealer_name:
							formData.get('sale_dealer_name') || null,
						ownership_date_start:
							formData.get('owner_date_start') || null,
						ownership_date_end:
							formData.get('owner_date_end') || null,
						shipping_date: formData.get('shipping_date') || null,
						shipping_vessel:
							formData.get('shipping_vessel') || null,
						shipping_location: selectedLocation,
					}),
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.details || 'Failed to update car');
			}

			setIsSuccess(true);
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: 'Failed to update car. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setIsSuccess(false);

		onClose();
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
						<h2 className="text-2xl font-bold mb-2">Updated!</h2>
						<p className="text-brg-mid">
							Your car's details have been updated successfully.
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	return isSignedIn ? (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Edit Car Details"
			action={{
				text: 'Save Changes',
				onClick: handleSubmit,
				loading,
			}}
		>
			<form
				id="carEditForm"
				onSubmit={handleSubmit}
				className="flex flex-col gap-4"
			>
				<input type="hidden" name="userId" value={userId} />

				<div className="flex flex-col gap-2">
					<h4 className="text-md font-semibold -mt-1">
						Your Ownership
					</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg p-4">
						<div className="flex gap-8">
							<Field
								id="owner_date_state"
								label="Purchase Date"
								className="w-36 [&>label]:text-brg-mid"
								required
							>
								<TextField
									id="ownership_date"
									name="ownership_date"
									type="date"
									placeholder="1990-01-01"
									defaultValue={
										car.owner_history?.[0]?.date_start
											? car.owner_history[0].date_start
													.toString()
													.split('T')[0]
											: undefined
									}
								/>
							</Field>

							<Field
								id="owner_date_end"
								label="Date Sold"
								className="w-36 [&>label]:text-brg-mid"
							>
								<TextField
									id="ownership_date"
									name="ownership_date"
									type="date"
									placeholder="1990-01-01"
									defaultValue={
										car.owner_history?.[0]?.date_end
											? car.owner_history[0].date_end
													.toString()
													.split('T')[0]
											: undefined
									}
								/>
							</Field>
						</div>

						<p className="text-brg-mid/70 text-xs">
							To change the vehicle location, please update your
							profile.
						</p>
					</div>

					<h4 className="text-md font-semibold mt-3">Manufacture</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg p-4">
						<div className="flex gap-8">
							<Field
								id="sequence"
								label="Sequence #"
								className="w-24 [&>label]:text-brg-mid"
							>
								<TextField
									id="sequence"
									name="sequence"
									type="number"
									placeholder="182"
									defaultValue={car.sequence?.toString()}
									onChange={handleSequenceChange}
								/>
							</Field>

							<Field
								id="manufacture_date"
								label="Manufacture Date"
								className="w-36 [&>label]:text-brg-mid"
							>
								<TextField
									id="manufacture_date"
									name="manufacture_date"
									type="date"
									placeholder="1990-01-01"
									defaultValue={
										car.manufacture_date
											? car.manufacture_date
													.toString()
													.split('T')[0]
											: undefined
									}
								/>
							</Field>
						</div>

						{hasSequenceWarning && (
							<p className="text-xs text-brg-mid/70">
								Adding or changing the sequence number requires
								approval from the Miata Registry team. Please
								send supporting documentation to{' '}
								<a
									href={`mailto:support@miataregistry.com?subject=Sequence%20Number%20Change%20Request:%20${car.id}`}
									className="underline"
								>
									support@miataregistry.com
								</a>
								.
							</p>
						)}
					</div>

					<h4 className="text-md font-semibold mt-3">
						Original Sale
					</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg p-4">
						<p className="text-brg-mid/70 text-xs">
							Please refer to the original sales documents. This
							is <u>not</u> when you purchased the car, unless you
							purchased it new.
						</p>

						<div className="flex gap-8">
							<Field
								id="sale_msrp"
								label="MSRP"
								className="w-24 shrink-0 [&>label]:text-brg-mid"
							>
								<TextField
									id="sale_msrp"
									name="sale_msrp"
									type="text"
									placeholder="$21,423"
									defaultValue={
										car.sale_msrp
											? `$${car.sale_msrp.toLocaleString()}`
											: ''
									}
									onChange={(e) => {
										const value = e.target.value.replace(
											/[^0-9]/g,
											''
										);
										if (value) {
											const number = parseInt(value, 10);
											e.target.value = `$${number.toLocaleString()}`;
										} else {
											e.target.value = '';
										}
									}}
								/>
							</Field>

							<Field
								id="sale_date"
								label="Sale Date"
								className="w-36 [&>label]:text-brg-mid"
							>
								<TextField
									id="sale_date"
									name="sale_date"
									type="date"
									placeholder="1990-01-01"
									defaultValue={
										car.sale_date
											? car.sale_date
													.toString()
													.split('T')[0]
											: undefined
									}
								/>
							</Field>
						</div>

						<Field
							id="sale_dealer_name"
							label="Dealer"
							className="w-full [&>label]:text-brg-mid"
						>
							<TextField
								id="sale_dealer_name"
								name="sale_dealer_name"
								type="text"
								placeholder="Mazda of Austin"
								defaultValue={car.sale_dealer_name}
							/>
						</Field>

						<Field
							id="sale_dealer_location"
							label="Dealer Location"
							className="w-full [&>label]:text-brg-mid"
						>
							<Location
								id="sale_dealer_location"
								name="sale_dealer_location"
								placeholder="Enter a location"
								value={formatLocation({
									city: car.sale_dealer_city,
									state: car.sale_dealer_state,
									country: car.sale_dealer_country || '',
								})}
								onLocationSelect={(location) =>
									setSelectedLocation(parseLocation(location))
								}
							/>
						</Field>
					</div>

					<h4 className="text-md font-semibold mt-3">Shipping</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg p-4">
						<div className="flex gap-8">
							<Field
								id="shipping_date"
								label="Ship Date"
								className="w-36 shrink-0 [&>label]:text-brg-mid"
							>
								<TextField
									id="shipping_date"
									name="shipping_date"
									type="date"
									placeholder="1990-01-01"
									defaultValue={
										car.shipping_date
											? car.shipping_date
													.toString()
													.split('T')[0]
											: undefined
									}
								/>
							</Field>

							<Field
								id="shipping_vessel"
								label="Vessel"
								className="w-full [&>label]:text-brg-mid"
							>
								<TextField
									id="shipping_vessel"
									name="shipping_vessel"
									type="text"
									placeholder="Olive Ace"
									defaultValue={car.shipping_vessel}
								/>
							</Field>
						</div>

						<Field
							id="shipping_location"
							label="Shipping Location"
							className="w-full [&>label]:text-brg-mid"
						>
							<Location
								id="shipping_location"
								name="shipping_location"
								placeholder="Enter a location"
								value={formatLocation({
									city: car.shipping_city,
									state: car.shipping_state,
									country: car.shipping_country || '',
								})}
								onLocationSelect={(location) =>
									setSelectedLocation(parseLocation(location))
								}
							/>
						</Field>
					</div>

					<h4 className="text-md font-semibold mt-3">Photos</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg py-3 px-4">
						<p className="text-sm text-brg-mid">
							Submission of photographs is under development. Send
							us photos or links to photos at{' '}
							<a
								href={`mailto:support@miataregistry.com?subject=Photo%20Submission:%20${car.id}`}
								className="underline"
							>
								support@miataregistry.com
							</a>
						</p>
					</div>

					<h4 className="text-md font-semibold mt-3 text-red-700">
						Danger Zone
					</h4>

					<div className="flex flex-col gap-4 bg-red-50 border border-red-100 rounded-lg py-3 px-4 mb-1">
						<label className="flex items-center gap-2 text-sm text-red-700">
							<input
								type="checkbox"
								defaultChecked={car.destroyed}
							/>
							Car has been destroyed / parted out
						</label>
					</div>
				</div>
			</form>
		</Modal>
	) : null;
}