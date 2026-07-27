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

import { useAuth } from '@clerk/clerk-react';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ChangeEvent,
} from 'react';
import { TCar } from '../types/Car';
import { TCarOwner } from '../types/Owner';
import { parseMileageInput, type TMileageUnit } from '../utils/car';
import { handleApiError } from '../utils/common';
import { uploadCarPhoto } from '../utils/carPhoto';
import { formatLocation, parseLocation } from '../utils/location';

export const CAR_EDIT_FORM_ID = 'carEditForm';

export type TCarWithOwnerHistory = TCar & {
	owner_history?: TCarOwner[];
};

export function useCarEdit(
	car: TCarWithOwnerHistory,
	options: { enabled?: boolean; onUpdate?: () => void } = {}
) {
	const { enabled = true, onUpdate } = options;
	const { getToken } = useAuth();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [pendingReview, setPendingReview] = useState(true);
	const [formError, setFormError] = useState<string | null>(null);
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [warningSequence, setWarningSequence] = useState(false);
	const [warningOwnerDateEnd, setWarningOwnerDateEnd] = useState(false);
	const [mileageUnit, setMileageUnit] = useState<TMileageUnit>('mi');
	const [mileageDisplay, setMileageDisplay] = useState('');
	const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
	const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
	const photoPreviewRef = useRef<string | null>(null);

	const revokePhotoPreview = useCallback(() => {
		if (photoPreviewRef.current?.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreviewRef.current);
		}

		photoPreviewRef.current = null;
		setPhotoPreviewUrl(null);
		setPendingPhoto(null);
	}, []);

	const stagePhoto = useCallback((file: File, previewUrl: string) => {
		if (photoPreviewRef.current?.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreviewRef.current);
		}

		photoPreviewRef.current = previewUrl;
		setPhotoPreviewUrl(previewUrl);
		setPendingPhoto(file);
		setFormError(null);
	}, []);

	const clearPendingPhoto = useCallback(() => {
		revokePhotoPreview();
	}, [revokePhotoPreview]);

	useEffect(() => {
		return () => {
			if (photoPreviewRef.current?.startsWith('blob:')) {
				URL.revokeObjectURL(photoPreviewRef.current);
			}
		};
	}, []);

	useLayoutEffect(() => {
		if (!enabled) return;

		setMileageUnit('mi');
		setMileageDisplay(
			car.mileage != null ? car.mileage.toLocaleString() : ''
		);
		setIsSuccess(false);
		setPendingReview(true);
		setFormError(null);
		setIsFormDirty(false);
		setWarningSequence(false);
		setWarningOwnerDateEnd(false);
		revokePhotoPreview();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset when switching cars
	}, [enabled, car.id]);

	const isPhotoDirty = pendingPhoto != null;
	const isSaveDirty = isFormDirty || isPhotoDirty;

	const handleOwnerDateEndChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		setWarningOwnerDateEnd(newValue !== car.owner_history?.[0]?.date_end);
	};

	const handleSequenceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value ? Number(e.target.value) : null;

		setWarningSequence(newValue !== car.sequence);
	};

	const handleFormChange = useCallback(() => {
		const form = document.getElementById(
			CAR_EDIT_FORM_ID
		) as HTMLFormElement | null;

		if (!form) return;

		const formData = new FormData(form);

		const hasChanges = Array.from(formData.entries()).some(
			([key, value]) => {
				const currentValue = value.toString().trim();

				switch (key) {
					case 'destroyed': {
						const isChecked = formData.get('destroyed') !== null;
						return isChecked !== car.destroyed;
					}
					case 'sequence':
						return currentValue
							? Number(currentValue) !== car.sequence
							: car.sequence !== null;
					case 'sale_msrp': {
						const msrp = currentValue
							? Number(currentValue.replace(/[^0-9]/g, ''))
							: null;
						return msrp !== car.sale_msrp;
					}
					case 'owner_date_start':
						return (
							currentValue !==
							(car.owner_history?.[0]?.date_start
								?.toString()
								.split('T')[0] || '')
						);
					case 'owner_date_end':
						return (
							currentValue !==
							(car.owner_history?.[0]?.date_end
								?.toString()
								.split('T')[0] || '')
						);
					case 'manufacture_date':
						return (
							currentValue !==
							(car.manufacture_date?.toString().split('T')[0] ||
								'')
						);
					case 'manufacture_date_time':
						return (
							currentValue !==
							(car.manufacture_date
								?.toString()
								.split('T')[1]
								.slice(0, -8) || '')
						);
					case 'sale_date':
						return (
							currentValue !==
							(car.sale_date?.toString().split('T')[0] || '')
						);
					case 'sale_dealer_name':
						return currentValue !== (car.sale_dealer_name || '');
					case 'sale_dealer_location': {
						const currentLocation = formatLocation({
							city: car.sale_dealer_city,
							state: car.sale_dealer_state,
							country: car.sale_dealer_country || '',
						});
						return currentValue !== currentLocation;
					}
					case 'shipping_date':
						return (
							currentValue !==
							(car.shipping_date?.toString().split('T')[0] || '')
						);
					case 'shipping_vessel':
						return currentValue !== (car.shipping_vessel || '');
					case 'shipping_location': {
						const currentShippingLocation = formatLocation({
							city: car.shipping_city,
							state: car.shipping_state,
							country: car.shipping_country || '',
						});
						return currentValue !== currentShippingLocation;
					}
					case 'mileage':
					case 'mileage_unit':
						return false;
					case 'story':
						return currentValue !== (car.story || '');
				}
				return false;
			}
		);

		const mileageDirty =
			parseMileageInput(mileageDisplay, mileageUnit) !==
			(car.mileage ?? null);

		setIsFormDirty(hasChanges || mileageDirty);
	}, [car, mileageDisplay, mileageUnit]);

	useEffect(() => {
		if (!enabled) return;

		handleFormChange();
	}, [enabled, car.id, mileageDisplay, mileageUnit, handleFormChange]);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		if (!isFormDirty && !pendingPhoto) {
			return;
		}

		setLoading(true);
		setFormError(null);

		let detailsSaved = false;

		try {
			const token = await getToken();

			if (!token) return;

			if (isFormDirty) {
				const form = document.getElementById(CAR_EDIT_FORM_ID);

				if (!form) return;

				const formData = new FormData(form as HTMLFormElement);

				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${car.id}`,
					{
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							destroyed: formData.get('destroyed') === 'on',
							manufacture_date: formData.get('manufacture_date')
								? `${formData.get('manufacture_date')}${
										formData.get('manufacture_date_time')
											? `T${formData.get('manufacture_date_time')}:00.000Z`
											: 'T00:00:00.000Z'
									}`
								: null,
							mileage: parseMileageInput(
								mileageDisplay,
								mileageUnit
							),
							owner_date_end:
								formData.get('owner_date_end') || null,
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
							shipping_date:
								formData.get('shipping_date') || null,
							shipping_location: formData.get('shipping_location')
								? parseLocation(
										formData.get(
											'shipping_location'
										) as string
									)
								: null,
							shipping_vessel:
								formData.get('shipping_vessel') || null,
							story: formData.get('story') || null,
						}),
					}
				);

				if (!response.ok) {
					const error = await response.json();

					throw new Error(error.details || 'Failed to update car');
				}

				const result = await response.json();

				setPendingReview(Boolean(result.pending_review));
				detailsSaved = true;
			} else {
				setPendingReview(false);
			}

			if (pendingPhoto) {
				try {
					await uploadCarPhoto(car.id, pendingPhoto, token);
					clearPendingPhoto();
				} catch (photoError) {
					if (detailsSaved) {
						setFormError(
							'Details saved, but the photo could not be uploaded. Try saving again.'
						);
						handleApiError(photoError);

						return;
					}

					throw photoError;
				}
			}

			setIsSuccess(true);
			onUpdate?.();
		} catch (error) {
			handleApiError(error);
			setFormError('Failed to submit form. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return {
		clearPendingPhoto,
		formError,
		handleFormChange,
		handleOwnerDateEndChange,
		handleSequenceChange,
		handleSubmit,
		isFormDirty,
		isSaveDirty,
		isSuccess,
		loading,
		mileageDisplay,
		mileageUnit,
		pendingReview,
		photoPreviewUrl,
		stagePhoto,
		setFormError,
		setMileageDisplay,
		setMileageUnit,
		setIsSuccess,
		warningOwnerDateEnd,
		warningSequence,
	};
}
