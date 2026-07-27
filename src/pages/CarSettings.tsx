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
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { CarEditForm } from '../components/car/CarEditForm';
import { Modal } from '../components/Modal';
import { useCarEdit, type TCarWithOwnerHistory } from '../hooks/useCarEdit';
import { useUnsavedLeaveGuard } from '../hooks/useUnsavedLeaveGuard';
import { usePageMeta } from '../hooks/usePageMeta';
import { userCanEditCar } from '../utils/carEditAccess';
import { handleApiError } from '../utils/common';
import { hasSequence } from '../utils/car';
import { isValidUuid } from '../utils/seoIndexing';

export function CarSettings() {
	const { id } = useParams();
	const { isLoaded, isSignedIn, userId } = useAuth();
	const [car, setCar] = useState<TCarWithOwnerHistory | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	const loadCar = useCallback(async () => {
		if (!id) return;

		setIsLoading(true);
		setNotFound(false);
		setCar(null);

		if (!isValidUuid(id)) {
			setNotFound(true);
			setIsLoading(false);

			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${id}`
			);

			if (response.status === 404) {
				setNotFound(true);

				return;
			}

			if (!response.ok) {
				throw new Error('Failed to fetch car');
			}

			setCar(await response.json());
		} catch (error) {
			handleApiError(error);
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		loadCar();
	}, [loadCar]);

	const canEdit =
		car &&
		userId &&
		userCanEditCar(car.id, car.current_owner?.user_id, userId);

	usePageMeta({
		path: id ? `/registry/${id}/settings` : '/registry',
		title: car
			? `Settings · ${car.edition?.year} ${car.edition?.name}`
			: 'Car settings',
		noindex: true,
	});

	const edit = useCarEdit(car ?? ({} as TCarWithOwnerHistory), {
		enabled: Boolean(car && canEdit),
		onUpdate: loadCar,
	});

	const warnOnLeave = edit.isSaveDirty && !edit.isSuccess;

	const leaveGuardActive =
		isLoaded &&
		!isLoading &&
		Boolean(isSignedIn && car && canEdit && !edit.isSuccess && warnOnLeave);

	const { handleLeavePage, handleStayOnPage, leaveModalOpen, requestLeave } =
		useUnsavedLeaveGuard(leaveGuardActive);

	if (!isLoaded || isLoading) {
		return <div className="min-h-[50vh]" />;
	}

	if (!isSignedIn) {
		return <Navigate to={id ? `/registry/${id}` : '/registry'} replace />;
	}

	if (notFound || !car || !id) {
		return <Navigate to="/registry" replace />;
	}

	if (!canEdit) {
		return <Navigate to={`/registry/${id}`} replace />;
	}

	const title = `${car.edition?.year} ${car.edition?.name}`;

	if (edit.isSuccess) {
		return (
			<main className="flex-1 pt-20 pb-16">
				<div className="container mx-auto max-w-3xl px-8 lg:px-0 py-10 lg:py-14">
					<div className="flex flex-col items-center gap-6 text-center">
						<div className="w-16 h-16 rounded-full bg-brg/10 flex items-center justify-center">
							<i className="fa-solid fa-fw fa-check text-brg text-3xl" />
						</div>

						<div>
							<h1 className="text-2xl font-bold text-brg mb-2">
								Changes saved
							</h1>

							<p className="text-brg-mid mb-2">
								{edit.pendingReview
									? 'Your updates were submitted and will be reviewed by the Miata Registry team.'
									: 'Your updates were saved.'}
							</p>

							{edit.pendingReview && (
								<p className="text-brg-mid text-sm">
									Send supporting documentation to{' '}
									<a
										href={`mailto:support@miataregistry.com?subject=Change%20Request:%20${car.id}`}
										className="underline"
									>
										support@miataregistry.com
									</a>
								</p>
							)}
						</div>

						<Button href={`/registry/${id}`}>
							Back to car profile
						</Button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<>
			<Modal
				isOpen={leaveModalOpen}
				onClose={handleStayOnPage}
				title="Unsaved changes"
				action={{
					text: 'Leave without saving',
					onClick: handleLeavePage,
				}}
			>
				<p className="text-brg-mid text-sm">
					You have changes that haven&apos;t been saved. Leave this
					page anyway?
				</p>
			</Modal>

			<main className="flex-1 pt-20 pb-16">
				<div className="sticky top-20 z-40 border-b border-brg-light bg-white">
					<div className="container mx-auto max-w-5xl px-8 py-3 lg:px-0">
						<div className="flex items-center justify-between gap-4">
							<div className="min-w-0">
								<p className="flex items-center gap-2 text-lg font-semibold text-brg">
									{edit.isSaveDirty &&
										!car.has_pending_changes && (
											<span
												className="size-2 shrink-0 rounded-full bg-amber-500"
												aria-hidden
											/>
										)}
									<span className="truncate">
										Edit Car Details
									</span>
								</p>
								<p className="truncate text-sm text-brg-mid">
									{edit.isSaveDirty &&
									!car.has_pending_changes ? (
										<span className="text-amber-800/90">
											Unsaved changes
										</span>
									) : (
										<>
											{title}
											{hasSequence(car.sequence)
												? ` · #${car.sequence}`
												: ''}
										</>
									)}
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<Button
									type="button"
									variant="tertiary"
									onClick={() =>
										requestLeave(`/registry/${id}`)
									}
									disabled={edit.loading}
									className="shrink-0 rounded-md py-2 px-3 text-sm text-brg-mid hover:bg-brg-light hover:text-brg lg:py-2 lg:px-3 lg:text-sm"
								>
									Cancel
								</Button>

								<Button
									type="button"
									onClick={() => edit.handleSubmit()}
									disabled={
										!edit.isSaveDirty ||
										car.has_pending_changes ||
										edit.loading
									}
									className="shrink-0 rounded-md bg-brg py-2 px-3 text-sm text-white hover:bg-brg-dark disabled:opacity-50 lg:py-2 lg:px-3 lg:text-sm"
								>
									{edit.loading ? 'Saving…' : 'Save changes'}
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto max-w-5xl px-8 py-8 lg:px-0 lg:py-10">
					{car.has_pending_changes && (
						<p className="mb-8 text-sm text-brg flex items-center gap-2 border border-yellow-200 bg-yellow-50/80 rounded-lg px-4 py-3">
							<i className="fa-solid fa-fw fa-triangle-exclamation text-yellow-600" />
							This car has pending changes under review. You can
							edit again after moderation finishes.
						</p>
					)}

					<fieldset
						disabled={car.has_pending_changes}
						className="disabled:opacity-60 disabled:pointer-events-none min-w-0"
					>
						<CarEditForm
							car={car}
							disabled={car.has_pending_changes || edit.loading}
							formError={edit.formError}
							onClearPhoto={edit.clearPendingPhoto}
							onDismissError={() => edit.setFormError(null)}
							onFormChange={edit.handleFormChange}
							onOwnerDateEndChange={edit.handleOwnerDateEndChange}
							onPhotoStaged={edit.stagePhoto}
							onSequenceChange={edit.handleSequenceChange}
							onSubmit={edit.handleSubmit}
							photoPreviewUrl={edit.photoPreviewUrl}
							mileageDisplay={edit.mileageDisplay}
							mileageUnit={edit.mileageUnit}
							onMileageDisplayChange={edit.setMileageDisplay}
							onMileageUnitChange={edit.setMileageUnit}
							warningOwnerDateEnd={edit.warningOwnerDateEnd}
							warningSequence={edit.warningSequence}
						/>
					</fieldset>
				</div>
			</main>
		</>
	);
}
