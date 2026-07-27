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

import { type ChangeEvent } from 'react';
import { useCarHasProfilePhoto } from '../../hooks/useCarProfilePhoto';
import { ErrorBanner } from '../ErrorBanner';
import { Field } from '../form/Field';
import { Location } from '../form/Location';
import { PhotoUpload } from '../form/PhotoUpload';
import { Select } from '../form/Select';
import { TextField } from '../form/TextField';
import {
	CAR_EDIT_FORM_ID,
	type TCarWithOwnerHistory,
} from '../../hooks/useCarEdit';
import { convertMileageDisplay, type TMileageUnit } from '../../utils/car';
import { formatLocation, normalizeLocation } from '../../utils/location';

type CarEditFormProps = {
	car: TCarWithOwnerHistory;
	disabled?: boolean;
	formError: string | null;
	onClearPhoto: () => void;
	onDismissError: () => void;
	onFormChange: () => void;
	onOwnerDateEndChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onPhotoStaged: (file: File, previewUrl: string) => void;
	onSequenceChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	photoPreviewUrl: string | null;
	mileageDisplay: string;
	mileageUnit: TMileageUnit;
	onMileageDisplayChange: (value: string) => void;
	onMileageUnitChange: (unit: TMileageUnit) => void;
	warningOwnerDateEnd: boolean;
	warningSequence: boolean;
};

function Section({
	title,
	intro,
	children,
	className = '',
}: {
	title: string;
	intro?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<section
			className={`flex flex-col gap-4 pt-10 first:pt-0 ${className}`}
		>
			<div className="flex flex-col gap-1.5">
				<h2 className="text-lg font-semibold text-brg">{title}</h2>
				{intro ? (
					<div className="text-brg-mid/70 text-xs">{intro}</div>
				) : null}
			</div>
			<div className="flex flex-col gap-4 max-w-2xl">{children}</div>
		</section>
	);
}

export function CarEditForm({
	car,
	disabled = false,
	formError,
	onClearPhoto,
	onDismissError,
	onFormChange,
	onOwnerDateEndChange,
	onPhotoStaged,
	onSequenceChange,
	onSubmit,
	photoPreviewUrl,
	mileageDisplay,
	mileageUnit,
	onMileageDisplayChange,
	onMileageUnitChange,
	warningOwnerDateEnd,
	warningSequence,
}: CarEditFormProps) {
	const hasProfilePhoto = useCarHasProfilePhoto(car.id);

	const ownerLocationDisplay =
		formatLocation(
			normalizeLocation({
				city: car.current_owner?.city,
				state: car.current_owner?.state,
				country: car.current_owner?.country || '',
			})
		) || 'Not set on your profile';

	return (
		<form
			id={CAR_EDIT_FORM_ID}
			onSubmit={onSubmit}
			onChange={onFormChange}
			className="flex flex-col max-w-2xl"
		>
			<ErrorBanner error={formError} onDismiss={onDismissError} />

			<Section title="Your Ownership">
				<div className="flex flex-wrap gap-6">
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
						className="w-36"
					>
						<TextField
							id="owner_date_end"
							name="owner_date_end"
							type="date"
							placeholder="1990-01-01"
							onChange={onOwnerDateEndChange}
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

				{warningOwnerDateEnd && (
					<p className="text-xs text-brg-mid/80">
						You will be removed as the owner of this car.
					</p>
				)}

				<div className="flex flex-col gap-1">
					<Field
						id="owner_location_display"
						label="Vehicle Location"
						className="w-full max-w-sm"
					>
						<TextField
							id="owner_location_display"
							readOnly
							disabled
							value={ownerLocationDisplay}
							className="bg-brg-light/40 text-brg-mid disabled:opacity-100 disabled:cursor-not-allowed"
						/>
					</Field>

					<p className="text-brg-mid/70 text-xs">
						To change the vehicle location, please update your
						profile.
					</p>
				</div>
			</Section>

			<Section title="Manufacture">
				<div className="flex flex-wrap gap-6 items-start">
					<Field
						id="sequence"
						label="Sequence #"
						className="w-28 shrink-0"
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
							onChange={onSequenceChange}
						/>
					</Field>

					<Field
						id="manufacture_date"
						label="Manufacture Date"
						className="shrink-0"
					>
						<div className="flex flex-nowrap gap-2">
							<TextField
								id="manufacture_date"
								name="manufacture_date"
								type="date"
								placeholder="1990-01-01"
								className="w-[8.75rem] max-w-[8.75rem] shrink-0"
								defaultValue={
									car.manufacture_date
										? car.manufacture_date
												.toString()
												.split('T')[0]
										: undefined
								}
							/>

							<TextField
								id="manufacture_date_time"
								name="manufacture_date_time"
								type="time"
								placeholder="00:00"
								className="w-[8.75rem] max-w-[8.75rem] shrink-0"
								defaultValue={
									car.manufacture_date
										? car.manufacture_date
												.toString()
												.split('T')[1]
												.slice(0, -8)
										: undefined
								}
							/>
						</div>
					</Field>
				</div>

				{warningSequence && (
					<p className="text-xs text-brg-mid/80">
						Adding or changing the sequence number requires
						supporting documentation at{' '}
						<a
							href={`mailto:support@miataregistry.com?subject=Sequence%20Number%20Change%20Request:%20${car.id}`}
							className="underline"
						>
							support@miataregistry.com
						</a>
					</p>
				)}
			</Section>

			<Section title="Shipping">
				<div className="flex flex-wrap gap-x-4 gap-y-6 items-end">
					<Field
						id="shipping_date"
						label="Ship Date"
						className="w-[8.75rem] shrink-0"
					>
						<TextField
							id="shipping_date"
							name="shipping_date"
							type="date"
							placeholder="1990-01-01"
							className="w-[8.75rem] max-w-[8.75rem] shrink-0"
							defaultValue={
								car.shipping_date
									? car.shipping_date.toString().split('T')[0]
									: undefined
							}
						/>
					</Field>

					<Field
						id="shipping_vessel"
						label="Vessel"
						className="w-[11rem] shrink-0"
					>
						<TextField
							id="shipping_vessel"
							name="shipping_vessel"
							placeholder="Olive Ace"
							className="w-[11rem] max-w-[11rem] shrink-0"
							defaultValue={car.shipping_vessel}
						/>
					</Field>

					<Field
						id="shipping_location"
						label="Entry Port"
						className="w-full min-w-0 shrink-0 sm:w-[10.5rem] sm:max-w-[10.5rem]"
					>
						<Location
							id="shipping_location"
							name="shipping_location"
							placeholder="Enter a location"
							value={formatLocation(
								normalizeLocation({
									city: car.shipping_city,
									state: car.shipping_state,
									country: car.shipping_country || '',
								})
							)}
						/>
					</Field>
				</div>
			</Section>

			<Section
				title="Original Sale"
				intro={
					<>
						Use the original sales documents. This is <em>not</em>{' '}
						when you bought the car, unless you bought it new.
					</>
				}
			>
				<div className="flex flex-wrap gap-6">
					<Field
						id="sale_msrp"
						label="MSRP"
						className="w-28 shrink-0"
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
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
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

					<Field id="sale_date" label="Sale Date" className="w-36">
						<TextField
							id="sale_date"
							name="sale_date"
							type="date"
							placeholder="1990-01-01"
							defaultValue={
								car.sale_date
									? car.sale_date.toString().split('T')[0]
									: undefined
							}
						/>
					</Field>
				</div>

				<div className="flex flex-wrap gap-6 items-end">
					<Field
						id="sale_dealer_name"
						label="Dealer"
						className="w-full max-w-[11rem] shrink-0"
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
						className="w-full max-w-sm min-w-[12rem] flex-1"
					>
						<Location
							id="sale_dealer_location"
							name="sale_dealer_location"
							placeholder="Enter a location"
							value={formatLocation(
								normalizeLocation({
									city: car.sale_dealer_city,
									state: car.sale_dealer_state,
									country: car.sale_dealer_country || '',
								})
							)}
						/>
					</Field>
				</div>
			</Section>

			<Section
				title="Photo"
				intro={
					hasProfilePhoto
						? "Upload a new photo to replace your car's current photo."
						: undefined
				}
			>
				<PhotoUpload
					disabled={disabled}
					error={null}
					onClear={onClearPhoto}
					onPhotoStaged={onPhotoStaged}
					previewUrl={photoPreviewUrl}
				/>
			</Section>

			<Section title="About This Miata">
				<div className="flex flex-wrap gap-3 items-end">
					<Field
						id="mileage"
						label="Current Mileage"
						className="w-36 shrink-0"
					>
						<TextField
							id="mileage"
							name="mileage"
							inputMode="numeric"
							placeholder="42,500"
							value={mileageDisplay}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								const value = e.target.value.replace(
									/[^0-9]/g,
									''
								);

								onMileageDisplayChange(
									value ? Number(value).toLocaleString() : ''
								);
							}}
						/>
					</Field>

					<Select
						name="mileage_unit"
						className="w-20"
						value={mileageUnit}
						onChange={(e: ChangeEvent<HTMLSelectElement>) => {
							const newUnit = e.target.value as TMileageUnit;
							const raw = Number(
								mileageDisplay.replace(/[^0-9]/g, '')
							);

							if (raw) {
								onMileageDisplayChange(
									convertMileageDisplay(
										raw,
										mileageUnit,
										newUnit
									).toLocaleString()
								);
							}

							onMileageUnitChange(newUnit);
						}}
						options={[
							{ value: 'mi', label: 'mi' },
							{ value: 'km', label: 'km' },
						]}
					/>
				</div>

				<Field id="story" label="Your Car's Story" className="w-full">
					<TextField
						id="story"
						name="story"
						type="textarea"
						className="h-48"
						placeholder="Mods, service history, how you use it, provenance you've learned as an owner…"
						defaultValue={car.story || ''}
					/>
				</Field>
			</Section>

			<Section title="Prior Owners and Rarity Scores">
				<p className="text-sm text-brg-mid/80">
					Editing prior owner history and rarity scores is under
					development. Send documentation to{' '}
					<a
						href={`mailto:support@miataregistry.com?subject=Prior%20Owners%20/%20Rarity%20Score%20Submission:%20${car.id}`}
						className="underline"
					>
						support@miataregistry.com
					</a>{' '}
					and we'll add it for you.
				</p>
			</Section>

			<section className="flex flex-col gap-3 pt-10">
				<h2 className="text-lg font-semibold text-red-800">
					Danger Zone
				</h2>

				<label className="flex items-center gap-2 text-sm text-red-800 select-none max-w-2xl">
					<input
						type="checkbox"
						id="destroyed"
						name="destroyed"
						defaultChecked={car.destroyed}
					/>
					Car has been destroyed / parted out
				</label>
			</section>
		</form>
	);
}
