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
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
} from 'react';
import { TCar } from '../types/Car';
import { TCarOwner } from '../types/Owner';
import { parseMileageInput, type TMileageUnit } from '../utils/car';
import { handleApiError } from '../utils/common';
import { uploadCarPhoto } from '../utils/carPhoto';
import {
	formatLocation,
	isLocationAcceptedForMaps,
	normalizeLocation,
	parseLocation,
} from '../utils/location';
import {
	dateToFormValue,
	priorOwnersFromCarHistory,
	priorOwnersSnapshotEqual,
	priorOwnersToSubmitPayload,
	validateOwnershipTimeline,
	type TPriorOwnerFormRow,
} from '../utils/ownershipHistory';
import {
	attestationsFromCar,
	attestationsFromFormData,
	computeFullRarityBreakdown,
} from '../utils/rarityScore';

export const CAR_EDIT_FORM_ID = 'carEditForm';

function resolveCurrentOwnerDatesFromDom(car: TCarWithOwnerHistory): {
	end: string | null;
	start: string | null;
} {
	const form = document.getElementById(
		CAR_EDIT_FORM_ID
	) as HTMLFormElement | null;
	const start =
		(form?.querySelector('#owner_date_start') as HTMLInputElement | null)
			?.value ||
		dateToFormValue(car.owner_history?.[0]?.date_start) ||
		null;
	const end =
		(form?.querySelector('#owner_date_end') as HTMLInputElement | null)
			?.value ||
		dateToFormValue(car.owner_history?.[0]?.date_end) ||
		null;

	return { end, start };
}

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
	const [previewAttestations, setPreviewAttestations] = useState(() =>
		attestationsFromCar(car)
	);
	const [previewDestroyed, setPreviewDestroyed] = useState(
		Boolean(car.destroyed)
	);
	const [priorOwners, setPriorOwners] = useState<TPriorOwnerFormRow[]>(() =>
		priorOwnersFromCarHistory(car.owner_history)
	);
	const [baselinePriorOwners, setBaselinePriorOwners] = useState<
		TPriorOwnerFormRow[]
	>(() => priorOwnersFromCarHistory(car.owner_history));
	const [ownershipTimelineError, setOwnershipTimelineError] = useState<
		string | null
	>(null);
	const initializedCarIdRef = useRef<string | null>(null);

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

		// Same car after a soft/hard reload (e.g. post-save) — keep success UI
		if (initializedCarIdRef.current === car.id) return;

		initializedCarIdRef.current = car.id;
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
		setPreviewAttestations(attestationsFromCar(car));
		setPreviewDestroyed(Boolean(car.destroyed));
		const initialPriorOwners = priorOwnersFromCarHistory(car.owner_history);
		setPriorOwners(initialPriorOwners);
		setBaselinePriorOwners(initialPriorOwners);
		setOwnershipTimelineError(null);
		revokePhotoPreview();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset when switching cars
	}, [enabled, car.id]);

	const isPhotoDirty = pendingPhoto != null;
	const priorOwnersDirty = !priorOwnersSnapshotEqual(
		priorOwners,
		baselinePriorOwners
	);
	const isSaveDirty = isFormDirty || isPhotoDirty || priorOwnersDirty;

	const syncOwnershipTimelineError = useCallback(() => {
		const { end, start } = resolveCurrentOwnerDatesFromDom(car);

		setOwnershipTimelineError(
			validateOwnershipTimeline(priorOwners, start, end)
		);
	}, [car, priorOwners]);

	useEffect(() => {
		if (!enabled) return;

		syncOwnershipTimelineError();
	}, [enabled, priorOwners, syncOwnershipTimelineError]);

	const handleOwnerDateEndChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		setWarningOwnerDateEnd(newValue !== car.owner_history?.[0]?.date_end);
		syncOwnershipTimelineError();
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
					case 'color':
						return currentValue !== (car.color || 'Various');
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

		const nextAttestations = attestationsFromFormData(formData);
		const attestationsDirty = (
			Object.keys(nextAttestations) as (keyof typeof nextAttestations)[]
		).some(
			(key) =>
				nextAttestations[key] !==
				Boolean(car[key as keyof TCarWithOwnerHistory])
		);

		const destroyedChecked = formData.get('destroyed') === 'on';
		const destroyedDirty = destroyedChecked !== Boolean(car.destroyed);

		setPreviewAttestations(nextAttestations);
		setPreviewDestroyed(destroyedChecked);

		setIsFormDirty(
			hasChanges || mileageDirty || attestationsDirty || destroyedDirty
		);
		syncOwnershipTimelineError();
	}, [car, mileageDisplay, mileageUnit, syncOwnershipTimelineError]);

	useEffect(() => {
		if (!enabled) return;

		handleFormChange();
	}, [enabled, car.id, mileageDisplay, mileageUnit, handleFormChange]);

	const rarityBreakdown = useMemo(() => {
		const editionYear = car.edition?.year;

		if (editionYear == null) return null;

		return computeFullRarityBreakdown({
			attestations: previewAttestations,
			destroyed: previewDestroyed,
			editionBase: car.edition?.rarity_score ?? 0,
			editionYear,
			mileage: parseMileageInput(mileageDisplay, mileageUnit),
			ownerHistory: car.owner_history ?? [],
		});
	}, [
		car.edition?.rarity_score,
		car.edition?.year,
		car.owner_history,
		mileageDisplay,
		mileageUnit,
		previewAttestations,
		previewDestroyed,
	]);

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) {
			e.preventDefault();
		}

		if (!isFormDirty && !pendingPhoto && !priorOwnersDirty) {
			return;
		}

		const form = document.getElementById(
			CAR_EDIT_FORM_ID
		) as HTMLFormElement | null;

		const formData = isFormDirty && form ? new FormData(form) : null;

		const { end: currentOwnerEnd, start: currentOwnerStart } =
			resolveCurrentOwnerDatesFromDom(car);
		const timelineError = validateOwnershipTimeline(
			priorOwners,
			currentOwnerStart,
			currentOwnerEnd
		);

		if (timelineError) {
			setFormError(timelineError);
			setOwnershipTimelineError(timelineError);

			return;
		}

		if (import.meta.env.PROD && form) {
			const locationFieldIds = [
				'shipping_location',
				'sale_dealer_location',
			] as const;

			for (const fieldId of locationFieldIds) {
				const el = form.querySelector(
					`#${fieldId}`
				) as HTMLInputElement | null;
				const raw = el?.value ?? '';

				if (raw && !isLocationAcceptedForMaps(raw)) {
					setFormError(
						'Choose each location from the autocomplete suggestions.'
					);

					return;
				}
			}

			for (const row of priorOwners) {
				const el = form.querySelector(
					`#prior_owner_location_${row.key}`
				) as HTMLInputElement | null;
				const raw =
					el?.value ??
					formatLocation(normalizeLocation(row.location));

				if (raw && !isLocationAcceptedForMaps(raw)) {
					setFormError(
						'Choose each prior owner location from the autocomplete suggestions.'
					);

					return;
				}
			}
		}

		setLoading(true);
		setFormError(null);

		let detailsSaved = false;
		let needsReview = false;

		try {
			const token = await getToken();

			if (!token) return;

			if (formData || priorOwnersDirty) {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${car.id}`,
					{
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							...(formData
								? {
										destroyed:
											formData.get('destroyed') === 'on',
										manufacture_date: formData.get(
											'manufacture_date'
										)
											? `${formData.get('manufacture_date')}${
													formData.get(
														'manufacture_date_time'
													)
														? `T${formData.get('manufacture_date_time')}:00.000Z`
														: 'T00:00:00.000Z'
												}`
											: null,
										color: formData.has('color')
											? (() => {
													const selected = (
														formData.get(
															'color'
														) as string
													).trim();

													return !selected ||
														selected.toLowerCase() ===
															'various'
														? null
														: selected;
												})()
											: undefined,
										mileage: parseMileageInput(
											mileageDisplay,
											mileageUnit
										),
										owner_date_end:
											formData.get('owner_date_end') ||
											null,
										owner_date_start:
											formData.get('owner_date_start') ||
											null,
										sale_date:
											formData.get('sale_date') || null,
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
											formData.get('sale_dealer_name') ||
											null,
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
											formData.get('shipping_date') ||
											null,
										shipping_location: formData.get(
											'shipping_location'
										)
											? parseLocation(
													formData.get(
														'shipping_location'
													) as string
												)
											: null,
										shipping_vessel:
											formData.get('shipping_vessel') ||
											null,
										story: formData.get('story') || null,
										...attestationsFromFormData(formData),
									}
								: {}),
							...(priorOwnersDirty
								? {
										prior_owners:
											priorOwnersToSubmitPayload(
												priorOwners
											),
									}
								: {}),
						}),
					}
				);

				if (!response.ok) {
					const error = await response.json();

					throw new Error(error.details || 'Failed to update car');
				}

				const result = await response.json();

				needsReview = Boolean(result.pending_review);
				detailsSaved = true;
			}

			if (pendingPhoto) {
				try {
					await uploadCarPhoto(car.id, pendingPhoto, token);
					needsReview = true;
					clearPendingPhoto();
				} catch (photoError) {
					if (detailsSaved) {
						setPendingReview(needsReview);
						setFormError(
							'Details saved, but the photo could not be uploaded. Try saving again.'
						);
						handleApiError(photoError);

						return;
					}

					throw photoError;
				}
			}

			setPendingReview(needsReview);
			setIsFormDirty(false);
			setBaselinePriorOwners(priorOwners);
			setWarningSequence(false);
			setWarningOwnerDateEnd(false);
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
		ownershipTimelineError,
		pendingReview,
		photoPreviewUrl,
		priorOwners,
		setPriorOwners,
		stagePhoto,
		setFormError,
		setMileageDisplay,
		setMileageUnit,
		setIsSuccess,
		warningOwnerDateEnd,
		warningSequence,
		rarityBreakdown,
	};
}
