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
import { useParams } from 'react-router-dom';
import { Map } from '../components/car/Map';
import { TimelineItem } from '../components/car/TimelineItem';
import { Tooltip } from '../components/Tooltip';
import { Car } from '../types/Car';
import { toPrettyDate, toTitleCase } from '../utils/global';
import { getCar, getVinDetails } from '../api/Car';
import {
	formatEngineDetails,
	formatTransmission,
	formatPlantLocation,
} from '../utils/car';
import { formatLocation } from '../utils/geo';
import { usePageTitle } from '../hooks/usePageTitle';
import { getOwner } from '../api/Owner';
import { Owner } from '../types/Owner';
import { getImage } from '../api/Image';

interface MapLocation {
	name: string;
	address: string;
}

export const CarProfile = () => {
	const { id } = useParams();
	const [car, setCar] = useState<Car | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [vinDetails, setVinDetails] = useState<any>(null);
	const [timelineOwners, setTimelineOwners] = useState<Owner[]>([]);

	usePageTitle(
		car
			? `${car.edition.year} ${car.edition.name}${car.sequence ? ` #${car.sequence}` : ''}`
			: ''
	);

	const manufactureLocation = car?.manufacture?.location
		? formatLocation(car.manufacture.location)
		: vinDetails
			? formatPlantLocation(vinDetails)
			: '';

	useEffect(() => {
		const loadCar = async () => {
			if (!id) return;

			try {
				const carData = await getCar(id);

				setCar(carData);

				if (carData?.owners?.length) {
					const ownerPromises = carData.owners.map(async (owner) => {
						const ownerData = await getOwner(owner.ownerId.id);

						return {
							...ownerData,
							dateStart: owner.dateStart,
							dateEnd: owner.dateEnd,
						};
					});

					const ownerDetails = await Promise.all(ownerPromises);

					setTimelineOwners(ownerDetails);
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
			timelineOwners.forEach((owner, index) => {
				const startYear = owner.dateStart
					? new Date(owner.dateStart.seconds * 1000).getFullYear()
					: '';
				const endYear = owner.dateEnd
					? new Date(owner.dateEnd.seconds * 1000).getFullYear()
					: '';

				items.push({
					name: owner.name || 'Unknown',
					dateRange:
						index === 0
							? `${startYear} – ${car.destroyed ? 'Destruction' : 'Present'}`
							: `${startYear} – ${endYear}`,
					location: formatLocation(owner.location),
					isActive: index === 0,
				});
			});
		}

		// Dealer
		if (car.sale?.dealer) {
			items.push({
				name: car.sale.dealer.name,
				dateRange: toPrettyDate(car.sale.date || ''),
				location: formatLocation(car.sale.dealer.location),
			});
		}

		// Shipping
		if (car.shipping) {
			items.push({
				name: car.shipping.vessel ? (
					<>
						Shipped{' '}
						<span className="text-brg-border">
							via {toTitleCase(car.shipping.vessel)}
						</span>
					</>
				) : (
					'Shipped'
				),
				dateRange: toPrettyDate(car.shipping.date || ''),
				location: formatLocation(car.shipping.location),
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
				dateRange: car.manufacture?.date
					? toPrettyDate(car.manufacture.date)
					: car.edition.year.toString(),
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

	return (
		<main className="flex-1 pt-20 pb-16">
			<div className="container mx-auto py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					<div className="lg:col-span-8 space-y-6">
						<div>
							{car ? (
								<>
									<div className="flex items-start justify-between">
										<div>
											<h2 className="text-4xl font-bold">
												{car.edition.year}{' '}
												{car.edition.name}
											</h2>

											{car.edition.totalProduced && (
												<p className="text-md font-medium text-brg-border">
													{car.sequence ? (
														<>
															No.{' '}
															<span className="text-brg">
																{car.sequence.toLocaleString()}
															</span>{' '}
															of{' '}
															{car.edition.totalProduced?.toLocaleString()}
														</>
													) : (
														`One of the ${car.edition.totalProduced?.toLocaleString()} produced`
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

						<div className="aspect-video w-full h-[550px] relative rounded-lg overflow-hidden">
							{car ? (
								<div className="w-full h-full bg-brg-light">
									<img
										src={getImage(car.id)}
										alt={`${car.edition.name}`}
										className="w-full h-full object-cover opacity-0"
										onLoad={(e) => {
											const img =
												e.target as HTMLImageElement;
											img.classList.add(
												car.destroyed
													? 'opacity-70'
													: 'opacity-100'
											);
										}}
										onError={(e) => {
											if (car.edition.imageCarId) {
												const img =
													e.target as HTMLImageElement;

												img.src = getImage(
													car.edition.imageCarId.id
												);

												img.classList.add('grayscale');
											}
										}}
									/>

									{car.destroyed && (
										<div className="absolute inset-0 overflow-hidden">
											<div className="absolute top-1/2 left-1/2 w-[200%] h-4 bg-red-500/80 -translate-x-1/2 -translate-y-1/2 -rotate-[28deg]" />
										</div>
									)}
								</div>
							) : (
								<div className="w-full h-full bg-brg-light animate-pulse" />
							)}
						</div>

						<div className="bg-white rounded-lg overflow-hidden border border-brg-light">
							<div className="grid grid-cols-2 md:grid-cols-4">
								<div className="p-6 border-r border-brg-light">
									<p className="text-sm text-brg-mid mb-1">
										Factory Color
									</p>
									{car ? (
										<p className="font-medium">
											{car.edition.color}
										</p>
									) : (
										<div className="h-6 w-24 bg-brg-light rounded animate-pulse" />
									)}
								</div>

								<div className="p-6 md:border-r border-brg-light">
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

								<div className="p-6 border-r border-brg-light">
									<div className="flex items-center gap-1 mb-1">
										<p className="text-sm text-brg-mid">
											Engine
										</p>

										<Tooltip content="Information retrieved based on VIN; may be inaccurate">
											<svg
												className="w-3.5 h-3.5 text-brg-mid cursor-help"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</Tooltip>
									</div>
									<p
										className={`font-medium ${!vinDetails ? 'animate-pulse bg-brg-light h-6 w-24 rounded' : formatEngineDetails(vinDetails) === 'Not specified' ? 'text-brg-border' : ''}`}
									>
										{vinDetails &&
											formatEngineDetails(vinDetails)}
									</p>
								</div>

								<div className="p-6">
									<div className="flex items-center gap-1 mb-1">
										<p className="text-sm text-brg-mid">
											Transmission
										</p>

										<Tooltip content="Information retrieved based on VIN; may be inaccurate">
											<svg
												className="w-3.5 h-3.5 text-brg-mid cursor-help"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</Tooltip>
									</div>
									<p
										className={`font-medium ${!vinDetails ? 'animate-pulse bg-brg-light h-6 w-24 rounded' : formatTransmission(vinDetails) === 'Not specified' ? 'text-brg-border' : ''}`}
									>
										{vinDetails &&
											formatTransmission(vinDetails)}
									</p>
								</div>
							</div>

							{car?.sale && (
								<div className="flex flex-wrap gap-16 border-t border-brg-light p-6">
									{car.sale.msrp && (
										<div>
											<p className="text-sm text-brg-mid mb-1">
												Original MSRP
											</p>

											<p className="font-medium">
												$
												{car.sale.msrp.toLocaleString()}
											</p>
										</div>
									)}

									{car.sale?.date && (
										<div>
											<p className="text-sm text-brg-mid mb-1">
												Purchase Date
											</p>

											<p className="font-medium">
												{toPrettyDate(car.sale.date)}
											</p>
										</div>
									)}

									{car.sale.dealer && (
										<div>
											<p className="text-sm text-brg-mid mb-1">
												Original Dealer
											</p>

											<p className="font-medium">
												{car.sale.dealer.name}
											</p>

											{car.sale.dealer.location && (
												<p className="text-xs text-brg-mid">
													{formatLocation(
														car.sale.dealer.location
													)}
												</p>
											)}
										</div>
									)}
								</div>
							)}
						</div>

						{car?.edition.description ? (
							<div className="flex flex-col gap-4">
								<h3 className="text-xl font-semibold">
									About the {car.edition.year}{' '}
									{car.edition.name.replace('Edition', '')}{' '}
									Edition
								</h3>

								<div className="prose prose-brg max-w-none space-y-4">
									{car.edition.description?.map(
										(paragraph, index) => (
											<p key={index}>{paragraph}</p>
										)
									)}
								</div>
							</div>
						) : null}
					</div>

					<div className="lg:col-span-4 space-y-6">
						<div className="bg-white rounded-lg border border-brg-light overflow-hidden">
							<div className="aspect-[16/9] w-full relative">
								{car ? (
									<Map
										hasOwners={
											car.owners
												? car.owners.length > 0
												: false
										}
										locations={[
											{
												name: `${toTitleCase(vinDetails?.Manufacturer || 'Factory')}`,
												address: manufactureLocation,
											},
											car?.shipping?.location
												? {
														name: formatLocation(
															car.shipping
																.location
														),
														address: formatLocation(
															car.shipping
																.location
														),
													}
												: null,
											car?.sale?.dealer?.location
												? {
														name: car.sale.dealer
															.name,
														address: formatLocation(
															car.sale.dealer
																.location
														),
													}
												: null,
											...timelineOwners
												.slice()
												.sort(
													(a, b) =>
														(a.dateStart?.seconds ||
															0) -
														(b.dateStart?.seconds ||
															0)
												)
												.map((owner) =>
													owner.location
														? {
																name:
																	owner.name ||
																	'Unknown Owner',
																address:
																	formatLocation(
																		owner.location
																	),
															}
														: null
												),
										].filter(
											(
												location
											): location is MapLocation =>
												location !== null
										)}
									/>
								) : (
									<div className="w-full h-full bg-brg-light animate-pulse" />
								)}
							</div>

							{car ? (
								<div className="p-4 flex items-center justify-between">
									{car?.owner?.location ? (
										<div>
											<p className="font-medium text-lg">
												{car.owner?.location?.city}
											</p>

											<p className="text-brg-mid">
												{formatLocation(
													car.owner?.location,
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

						<div>{getTimelineItems()}</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default CarProfile;
