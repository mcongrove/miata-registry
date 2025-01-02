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
import { ErrorBanner } from '../components/ErrorBanner';
import { Field } from '../components/form/Field';
import { Location } from '../components/form/Location';
import { PhotoUpload } from '../components/form/PhotoUpload';
import { TextField } from '../components/form/TextField';
import { Modal } from '../components/Modal';
import { TCar } from '../types/Car';
import { TCarOwner } from '../types/Owner';
import { handleApiError } from '../utils/common';
import { formatLocation, parseLocation } from '../utils/location';

interface CarEditProps {
	isOpen: boolean;
	onClose: () => void;
	props: {
		car: TCar & {
			owner_history?: TCarOwner[];
		};
		onUpdate: () => void;
	};
}

export function CarEdit({ isOpen, onClose, props }: CarEditProps) {
	const { isSignedIn, userId, getToken } = useAuth();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [warningSequence, setWarningSequence] = useState(false);
	const [warningOwnerDateEnd, setWarningOwnerDateEnd] = useState(false);
	const car = props.car;

	const handleOwnerDateEndChange = (e: any) => {
		const newValue = e.target.value;

		setWarningOwnerDateEnd(newValue !== car.owner_history?.[0]?.date_end);
	};

	const handleSequenceChange = (e: any) => {
		const newValue = e.target.value ? Number(e.target.value) : null;

		setWarningSequence(newValue !== car.sequence);
	};

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);
		setFormError(null);

		try {
			const form = document.querySelector('form#carEditForm');
			const token = await getToken();

			if (!form || !token) return;

			const formData = new FormData(form as HTMLFormElement);

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${car.id}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						destroyed: formData.get('destroyed') === 'on',
						manufacture_date:
							formData.get('manufacture_date') || null,
						owner_date_end: formData.get('owner_date_end') || null,
						owner_date_start:
							formData.get('owner_date_start') || null,
						sale_date: formData.get('sale_date') || null,
						sale_dealer_location: formData.get(
							'sale_dealer_location'
						)
							? parseLocation(
									formData.get(
										'sale_dealer_location'
									) as string
								)
							: null,
						sale_dealer_name:
							formData.get('sale_dealer_name') || null,
						sale_msrp: formData.get('sale_msrp')
							? Number(
									formData
										.get('sale_msrp')
										?.toString()
										.replace(/[^0-9]/g, '')
								)
							: null,
						sequence: formData.get('sequence')
							? Number(formData.get('sequence'))
							: null,
						shipping_date: formData.get('shipping_date') || null,
						shipping_location: formData.get('shipping_location')
							? parseLocation(
									formData.get('shipping_location') as string
								)
							: null,
						shipping_vessel:
							formData.get('shipping_vessel') || null,
					}),
				}
			);

			if (!response.ok) {
				const error = await response.json();

				throw new Error(error.details || 'Failed to update car');
			}

			setIsSuccess(true);

			props.onUpdate();
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
						<h2 className="text-2xl font-bold mb-2">Success!</h2>

						<p className="text-brg-mid mb-2">
							Your changes have been submitted and will be
							reviewed by the Miata Registry team.
						</p>

						<p className="text-brg-mid">
							Please send any supporting documentation to{' '}
							<a
								href={`mailto:support@miataregistry.com?subject=Change%20Request:%20${car.id}`}
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

	return isSignedIn ? (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
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

				<ErrorBanner
					error={formError}
					onDismiss={() => setFormError(null)}
				/>

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
									id="owner_date_start"
									name="owner_date_start"
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
									id="owner_date_end"
									name="owner_date_end"
									type="date"
									placeholder="1990-01-01"
									onChange={handleOwnerDateEndChange}
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

						<div className="flex flex-col gap-1">
							{warningOwnerDateEnd && (
								<p className="text-xs text-brg-mid/70">
									You will be removed as the owner of this
									car.
								</p>
							)}

							<p className="text-brg-mid/70 text-xs">
								To change the vehicle location, please update
								your profile.
							</p>
						</div>
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
									min={1}
									max={9999}
									step={1}
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

						{warningSequence && (
							<p className="text-xs text-brg-mid/70">
								Adding or changing the sequence number requires
								you send supporting documentation to the Miata
								Registry team at{' '}
								<a
									href={`mailto:support@miataregistry.com?subject=Sequence%20Number%20Change%20Request:%20${car.id}`}
									className="underline"
								>
									support@miataregistry.com
								</a>
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
									placeholder="$21,423"
									defaultValue={
										car.sale_msrp
											? `$${car.sale_msrp.toLocaleString()}`
											: ''
									}
									onChange={(e: any) => {
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
									placeholder="Olive Ace"
									defaultValue={car.shipping_vessel}
								/>
							</Field>
						</div>

						<Field
							id="shipping_location"
							label="Entry Port"
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
							/>
						</Field>
					</div>

					<h4 className="text-md font-semibold mt-3">Photos</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg p-4">
						<PhotoUpload carId={car.id} />
					</div>

					<h4 className="text-md font-semibold mt-3">Prior Owners</h4>

					<div className="flex flex-col gap-4 bg-brg-light/30 border border-brg-light rounded-lg py-3 px-4">
						<p className="text-sm text-brg-mid">
							Editing owner history is under development. Send us
							documentation at{' '}
							<a
								href={`mailto:support@miataregistry.com?subject=Owner%20History%20Submission:%20${car.id}`}
								className="underline"
							>
								support@miataregistry.com
							</a>{' '}
							and we'll get it added for you.
						</p>
					</div>

					<h4 className="text-md font-semibold mt-3 text-red-700">
						Danger Zone
					</h4>

					<div className="flex flex-col gap-4 bg-red-50 border border-red-100 rounded-lg py-3 px-4 mb-1">
						<label className="flex items-center gap-2 text-sm text-red-700">
							<input
								type="checkbox"
								id="destroyed"
								name="destroyed"
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
