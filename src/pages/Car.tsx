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
import { lazy, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Icon, IconName } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';
import { useModal } from '../context/ModalContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { TCar } from '../types/Car';
import { TCarOwner } from '../types/Owner';
import { formatEngineDetails, formatPlantLocation } from '../utils/car';
import { country, formatLocation, state } from '../utils/geo';
import { toPrettyDate, toTitleCase } from '../utils/global';

const Map = lazy(() =>
	import('../components/car/Map').then((module) => ({ default: module.Map }))
);

const TimelineItem = lazy(() =>
	import('../components/car/TimelineItem').then((module) => ({
		default: module.TimelineItem,
	}))
);

export const getVinDetails = async (vin: string, year: number) => {
	try {
		const response = await fetch(
			`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json&modelyear=${year}`
		);

		const data = await response.json();

		if (data.Results?.[0]) {
			return data.Results[0];
		}

		return null;
	} catch (error) {
		console.error('Error fetching VIN details:', error);

		return null;
	}
};

const EditButton = ({
	className,
	color = 'text-brg-mid',
	disabled = false,
	icon,
	text,
}: {
	className?: string;
	color?: string;
	disabled?: boolean;
	icon: string;
	text: string;
}) => {
	return (
		<div
			className={`flex flex-col items-center justify-center p-3 gap-2 text-xs font-medium ${color} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-brg-light/30'}`}
		>
			<Icon
				name={icon as IconName}
				className={`!size-5 ${color} ${className} ${disabled ? 'opacity-50' : ''}`}
			/>

			<span
				className={`whitespace-nowrap ${disabled ? 'opacity-50' : ''}`}
			>
				{text}
			</span>
		</div>
	);
};

export const CarProfile = () => {
	const { id } = useParams();
	const { userId } = useAuth();
	const { openModal } = useModal();
	const [car, setCar] = useState<TCar | null>(null);
	const [vinDetails, setVinDetails] = useState<any>(null);
	const [timelineOwners, setTimelineOwners] = useState<TCarOwner[]>([]);

	usePageMeta({
		path: `/registry/${id}`,
		title: car
			? `${car.edition?.year} ${car.edition?.name}${car.sequence ? ` #${car.sequence}` : ''}`
			: '',
		description: car ? car.edition?.description?.split('\n')[0] : '',
	});

	const manufactureLocation = car?.manufacture_country
		? formatLocation({
				country: car.manufacture_country,
				city: car.manufacture_city,
			})
		: vinDetails
			? formatPlantLocation(vinDetails)
			: '';

	useEffect(() => {
		const loadCar = async () => {
			if (!id) return;

			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/cars/${id}`
				);

				if (!response.ok) {
					throw new Error('Failed to fetch car');
				}

				const carData = await response.json();

				setCar(carData);

				if (carData?.owner_history?.length) {
					setTimelineOwners(carData.owner_history);
				}

				if (carData?.vin) {
					const details = await getVinDetails(
						carData.vin,
						carData.edition.year
					);

					setVinDetails(details);
				}
			} catch (error) {
				console.error('Error loading car:', error);
				setCar(null);
			}
		};

		loadCar();
	}, [id]);

	const getTimelineItems = () => {
		if (!car) return [];

		const items = [];

		// Owners
		if (timelineOwners.length > 0) {
			timelineOwners.forEach((owner: TCarOwner, index: number) => {
				const startYear = owner.date_start
					? new Date(owner.date_start).getUTCFullYear()
					: '';
				const endYear = owner.date_end
					? new Date(owner.date_end).getUTCFullYear()
					: '';

				items.push({
					name: owner.name || 'Unknown',
					dateRange:
						!startYear && !endYear
							? ''
							: index === 0
								? car.destroyed
									? `${startYear || 'Unknown'} – Destruction`
									: `${startYear || 'Unknown'} – Present`
								: `${startYear || 'Unknown'} – ${endYear || 'Unknown'}`,
					location: formatLocation({
						city: owner.city,
						state: owner.state,
						country: owner.country || '',
					}),
					isActive: index === 0,
				});
			});
		}

		// Dealer
		if (car.sale_dealer_country || car.sale_dealer_name) {
			items.push({
				name: (
					<>
						Sold{' '}
						{car.sale_dealer_name && (
							<span className="text-brg-border">
								by {car.sale_dealer_name}
							</span>
						)}
					</>
				),
				dateRange: toPrettyDate(car.sale_date || ''),
				location: formatLocation({
					city: car.sale_dealer_city || '',
					state: car.sale_dealer_state || '',
					country: car.sale_dealer_country || '',
				}),
			});
		}

		// Shipping
		if (car.shipping_date || car.shipping_country || car.shipping_vessel) {
			items.push({
				name: car.shipping_vessel ? (
					<>
						Shipped{' '}
						<span className="text-brg-border">
							via {toTitleCase(car.shipping_vessel)}
						</span>
					</>
				) : (
					'Shipped'
				),
				dateRange: toPrettyDate(car.shipping_date || ''),
				location: formatLocation({
					city: car.shipping_city,
					state: car.shipping_state,
					country: car.shipping_country || '',
				}),
			});
		}

		// Factory
		if (manufactureLocation) {
			items.push({
				name: vinDetails?.Manufacturer ? (
					<>
						Built{' '}
						<span className="text-brg-border">
							by {toTitleCase(vinDetails.Manufacturer)}
						</span>
					</>
				) : (
					'Built'
				),
				dateRange: car.manufacture_date
					? toPrettyDate(car.manufacture_date)
					: car.edition?.year.toString(),
				location: manufactureLocation,
			});
		}

		// Find the last valid item to set showConnector=false
		const lastValidIndex = items.length - 1;

		return items.map((item, index) => (
			<TimelineItem
				key={index}
				{...item}
				showConnector={index !== lastValidIndex}
			/>
		));
	};

	const mapLocations = useMemo(() => {
		if (!car) return [];

		return [
			car.manufacture_country ? country(car.manufacture_country) : null,
			car.shipping_state
				? state(car.shipping_state)
				: car.shipping_country
					? country(car.shipping_country as any)
					: null,
			car.sale_dealer_state
				? state(car.sale_dealer_state)
				: car.sale_dealer_country
					? country(car.sale_dealer_country as any)
					: null,
			...timelineOwners
				.slice()
				.reverse()
				.map((owner) =>
					owner.state
						? state(owner.state)
						: owner.country
							? country(owner.country as any)
							: null
				),
		].filter((location) => location !== null);
	}, [
		car?.manufacture_country,
		car?.sale_dealer_state,
		car?.sale_dealer_country,
		timelineOwners,
	]);

	return (
		<main className="flex-1 pt-20 pb-0 lg:pb-16">
			<div className="container mx-auto px-8 py-6 lg:p-0 lg:py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
					<div className="lg:col-span-8 space-y-6 lg:space-y-8">
						<div>
							{car ? (
								<>
									<div className="flex items-center justify-between gap-4">
										<div>
											<h2 className="text-2xl lg:text-4xl leading-[1.1] font-bold">
												{car.edition?.year}{' '}
												{car.edition?.name}
											</h2>

											{car.edition?.total_produced && (
												<p className="text-sm lg:text-base font-medium text-brg-border">
													{car.sequence ? (
														<>
															No.{' '}
															<span className="text-brg">
																{car.sequence.toLocaleString()}
															</span>{' '}
															of{' '}
															{car.edition?.total_produced?.toLocaleString()}
														</>
													) : (
														`One of the ${car.edition?.total_produced?.toLocaleString()} produced`
													)}
												</p>
											)}
										</div>

										{car.destroyed && (
											<span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
												Destroyed
											</span>
										)}
									</div>
								</>
							) : (
								<div className="space-y-2">
									<div className="h-10 w-96 bg-brg-light rounded-lg animate-pulse" />
									<div className="h-6 w-48 bg-brg-light rounded-lg animate-pulse" />
								</div>
							)}
						</div>

						<div className="aspect-video w-screen lg:w-full h-72 md:h-96 lg:h-[550px] relative lg:rounded-lg overflow-hidden lg:m-0 max-lg:relative max-lg:left-1/2 max-lg:w-dvw max-lg:max-w-none max-lg:-translate-x-1/2">
							{car ? (
								<div className="w-full h-full bg-brg-light">
									<img
										src={`https://store.miataregistry.com/${car.edition?.image_car_id ? `car/${car.edition?.image_car_id}` : `edition/${car.edition?.id}`}.jpg`}
										alt={`${car.edition?.name} Edition Car`}
										className={`w-full h-full object-cover opacity-0 transition-opacity duration-1000 grayscale`}
										id="edition-image"
										onLoad={(e) => {
											const img =
												e.target as HTMLImageElement;

											setTimeout(() => {
												img.classList.remove(
													'opacity-0'
												);

												img.classList.add(
													car.destroyed
														? 'opacity-50'
														: 'opacity-100'
												);
											}, 1000);
										}}
									/>

									{car.id && (
										<img
											src={`https://store.miataregistry.com/car/${car.id}.jpg`}
											alt={`${car.edition?.name}`}
											className={`absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200`}
											onLoad={(e) => {
												const img =
													e.target as HTMLImageElement;

												img.classList.add(
													car.destroyed
														? 'opacity-50'
														: 'opacity-100'
												);

												const editionImage =
													document.getElementById(
														'edition-image'
													);

												if (editionImage) {
													editionImage.remove();
												}
											}}
										/>
									)}

									{car.destroyed && (
										<div className="absolute inset-0 overflow-hidden">
											<div className="absolute top-1/2 left-1/2 w-[200%] h-4 bg-red-700 -translate-x-1/2 -translate-y-1/2 -rotate-[28deg]" />
										</div>
									)}
								</div>
							) : (
								<div className="w-full h-full bg-brg-light animate-pulse" />
							)}
						</div>

						<div className="bg-white rounded-lg overflow-hidden border border-brg-light">
							<div className="grid grid-cols-1 md:grid-cols-3">
								<div className="p-4 lg:p-6 md:border-r border-brg-light">
									<p className="text-sm text-brg-mid mb-1">
										Factory Color
									</p>

									{car ? (
										<p className="font-medium">
											{car.color || car.edition?.color}
										</p>
									) : (
										<div className="h-6 w-24 bg-brg-light rounded animate-pulse" />
									)}
								</div>

								<div className="p-4 lg:p-6 border-t md:border-t-0 md:border-r border-brg-light">
									<p className="text-sm text-brg-mid mb-1">
										VIN
									</p>

									{car ? (
										<p className="font-medium font-mono pt-px">
											{car.vin}
										</p>
									) : (
										<div className="h-6 w-32 bg-brg-light rounded animate-pulse" />
									)}
								</div>

								<div className="p-4 lg:p-6 border-t md:border-t-0 md:border-r border-brg-light">
									<div className="flex items-center gap-1 mb-1">
										<p className="text-sm text-brg-mid">
											Engine
										</p>

										<Tooltip content="Information retrieved based on VIN; may be inaccurate">
											<Icon
												name="info-circle"
												className="size-3.5 text-brg-border"
											/>
										</Tooltip>
									</div>

									<p
										className={`font-medium ${!vinDetails ? 'animate-pulse bg-brg-light h-6 w-24 rounded' : formatEngineDetails(vinDetails) === 'Not specified' ? 'text-brg-border' : ''}`}
									>
										{vinDetails &&
											formatEngineDetails(vinDetails)}
									</p>
								</div>
							</div>

							{(car?.sale_date ||
								car?.sale_msrp ||
								car?.sale_dealer_name) && (
								<div className="flex flex-wrap gap-3 lg:gap-16 border-t border-brg-light p-4 lg:p-6">
									{car?.sale_msrp && (
										<div className="w-full lg:w-auto">
											<p className="text-sm text-brg-mid mb-1">
												Original{' '}
												<span className="hidden lg:inline">
													MSRP
												</span>
												<span className="inline lg:hidden">
													Purchase
												</span>
											</p>

											<p className="font-medium">
												$
												{car?.sale_msrp?.toLocaleString()}
											</p>
										</div>
									)}

									{car?.sale_date && (
										<div className="w-full lg:w-auto">
											<p className="text-sm text-brg-mid mb-1 hidden lg:block">
												Purchase Date
											</p>

											<p className="font-medium">
												{toPrettyDate(car?.sale_date)}
											</p>
										</div>
									)}

									{car?.sale_dealer_name && (
										<div className="w-full lg:w-auto">
											<p className="text-sm text-brg-mid mb-1 hidden lg:block">
												Original Dealer
											</p>

											<p className="font-medium">
												{car?.sale_dealer_name}
											</p>

											{car?.sale_dealer_city && (
												<p className="text-xs text-brg-mid">
													{formatLocation({
														city: car.sale_dealer_city,
														state: car.sale_dealer_state,
														country:
															car.sale_dealer_country ||
															'',
													})}
												</p>
											)}
										</div>
									)}
								</div>
							)}
						</div>

						{car?.edition?.description ? (
							<div className="hidden lg:flex flex-col gap-4">
								<h3 className="text-xl font-semibold">
									About the {car.edition.year}{' '}
									{car.edition.name.replace('Edition', '')}{' '}
									Edition
								</h3>

								<div className="prose max-w-none">
									{car?.edition?.description
										?.split('\n')
										.map(
											(
												paragraph: string,
												index: number
											) => <p key={index}>{paragraph}</p>
										)}
								</div>
							</div>
						) : null}
					</div>

					<div className="lg:col-span-4 space-y-6">
						{import.meta.env.DEV &&
						car?.current_owner?.user_id === userId ? (
							<div className="hidden md:grid grid-cols-4 divide-x divide-brg-light border rounded-lg rounded-br-none border-brg-light">
								<EditButton
									className="scale-90"
									color="text-gray-700"
									icon="edit"
									text="Edit Car"
									disabled
								/>

								<EditButton
									className="scale-110"
									color="text-green-700"
									icon="sold"
									text="Sold"
									disabled
								/>

								<EditButton
									className="scale-110"
									color="text-red-700"
									icon="destroyed"
									text="Destroyed"
									disabled
								/>

								<EditButton
									color="text-gray-500"
									icon="qr"
									text="Get QR Code"
									disabled
								/>
							</div>
						) : (
							car && (
								<Button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();

										openModal('register', {
											prefilledData: {
												edition: `${car.edition?.year} ${car.edition?.name}`,
												vin: car.vin || '',
												sequenceNumber:
													car.sequence?.toString() ||
													'',
											},
										});
									}}
									className="w-full md:w-auto justify-center md:flex ml-auto text-sm"
								>
									Claim this Car
								</Button>
							)
						)}

						<div className="bg-white rounded-lg border border-brg-light overflow-hidden">
							<div className="aspect-[16/9] w-full relative">
								{car ? (
									<Map
										hasOwners={
											car.owner_history
												? car.owner_history.length > 0
												: false
										}
										locations={mapLocations}
									/>
								) : (
									<div className="w-full h-full bg-brg-light animate-pulse" />
								)}
							</div>

							{car ? (
								<div className="p-4 flex items-center justify-between">
									{car?.current_owner?.country ? (
										<div>
											<p className="font-medium text-lg">
												{car.current_owner?.city}
											</p>

											<p className="text-brg-mid">
												{formatLocation(
													{
														city: car.current_owner
															?.city,
														state: car.current_owner
															?.state,
														country:
															car.current_owner
																?.country || '',
													},
													true
												)}
											</p>
										</div>
									) : (
										<div>
											<p className="font-medium text-lg text-brg-border">
												Unknown Location
											</p>
										</div>
									)}

									<svg
										className="size-5 text-brg-mid"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
							) : (
								<div className="p-4 flex items-center justify-between">
									<div className="w-full">
										<div className="h-6 w-32 bg-brg-light rounded animate-pulse mb-2" />
										<div className="h-5 w-48 bg-brg-light rounded animate-pulse" />
									</div>
								</div>
							)}
						</div>

						<div className="flex flex-col gap-8">
							<div>{getTimelineItems()}</div>

							<p className="text-xs text-brg-border w-3/4">
								The above information may only be accurate as of
								a specific date, as it may have been imported
								from a defunct registry.
							</p>
						</div>
					</div>

					{car?.edition?.description ? (
						<div className="flex lg:hidden flex-col gap-4">
							<h3 className="text-xl font-semibold">
								About the {car.edition.year}{' '}
								{car.edition.name.replace('Edition', '')}{' '}
								Edition
							</h3>

							<div className="prose max-w-none space-y-4">
								{car?.edition?.description
									?.split('\n')
									.map((paragraph: string, index: number) => (
										<p key={index}>{paragraph}</p>
									))}
							</div>
						</div>
					) : null}
				</div>
			</div>
		</main>
	);
};

export default CarProfile;
