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

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import sampleCars from '../../data/sampleCars.json';
import { Car } from '../../types/Car';
import { TimelineItem } from '../../components/registry/TimelineItem';
import { toPrettyDate, toTitleCase } from '../../utils/global';
import { countryMap } from '../../utils/map';
import { Map } from '../../components/Map';

interface Location {
	name: string;
	address: string;
}

export const CarProfile = () => {
	const { id } = useParams();
	const [car, setCar] = useState<Car | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [vinDetails, setVinDetails] = useState<any>(null);

	useEffect(() => {
		if (id) {
			const foundCar = sampleCars.find((c) => c.id === id);
			setCar(foundCar || null);

			if (foundCar?.vin) {
				fetchVinDetails(foundCar.vin, foundCar.edition.year);
			}
		}
	}, [id]);

	const fetchVinDetails = async (vin: string, year: number) => {
		try {
			const response = await fetch(
				`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json&modelyear=${year}`
			);

			const data = await response.json();

			if (data.Results?.[0]) {
				setVinDetails(data.Results[0]);
			}
		} catch (error) {
			console.error('Error fetching VIN details:', error);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const formatEngineDetails = (details: any) => {
		const displacement = details.DisplacementL
			? `${Number(details.DisplacementL).toFixed(1)}L`
			: '';

		const cylinders = details.EngineCylinders
			? `${details.EngineCylinders}-cylinder`
			: '';

		const configuration =
			details.EngineConfiguration?.toLowerCase() === 'inline'
				? 'Inline'
				: details.EngineConfiguration;

		const horsepower = details.EngineHP ? `${details.EngineHP}hp` : '';

		return (
			[displacement, configuration, cylinders, horsepower]
				.filter(Boolean)
				.join(' ')
				.trim() || 'Not specified'
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const formatTransmission = (details: any) => {
		const speed = details.TransmissionSpeeds || details.TransmissionSpeed;
		const style = details.TransmissionStyle || details.DriveType;

		if (!speed && !style) return 'Not specified';

		return [
			speed ? `${speed}-speed` : '',
			style?.toLowerCase().includes('manual') ? 'Manual' : 'Automatic',
		]
			.filter(Boolean)
			.join(' ');
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const formatPlantLocation = (details: any) => {
		const city = details?.PlantCity
			? toTitleCase(details?.PlantCity?.toLowerCase())
			: '';

		const country =
			countryMap[details?.PlantCountry] || details?.PlantCountry;

		return city && country ? `${city}, ${country}` : '';
	};

	if (!car) {
		return <main className="flex-1 pt-20"></main>;
	}

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					<div className="lg:col-span-8 space-y-6">
						<div>
							<h2 className="text-4xl font-bold">
								{car.edition.year} {car.edition.name}
							</h2>

							<p className="text-md font-medium">
								#{car.sequence}{' '}
								<span className="text-brg-border">
									of {car.edition.totalProduced}
								</span>
							</p>
						</div>

						<div className="aspect-video w-full relative rounded-lg overflow-hidden">
							<img
								src={car.image}
								alt={`${car.edition.name}`}
								className="w-full h-full object-cover"
							/>
						</div>

						<div className="bg-white rounded-lg overflow-hidden border border-brg-light">
							<div className="grid grid-cols-2 md:grid-cols-4">
								<div className="p-6 border-r border-brg-light">
									<p className="text-sm text-brg-mid mb-1">
										Factory Color
									</p>

									<p className="font-medium">{car.color}</p>
								</div>

								<div className="p-6 md:border-r border-brg-light">
									<p className="text-sm text-brg-mid mb-1">
										VIN
									</p>

									<p className="font-medium font-mono pt-px">
										{car.vin}
									</p>
								</div>

								{vinDetails && (
									<>
										<div className="p-6 border-r border-brg-light">
											<p className="text-sm text-brg-mid mb-1">
												Engine
											</p>

											<p
												className={`font-medium ${formatEngineDetails(vinDetails) === 'Not specified' ? 'text-brg-border' : ''}`}
											>
												{formatEngineDetails(
													vinDetails
												)}
											</p>
										</div>

										<div className="p-6">
											<p className="text-sm text-brg-mid mb-1">
												Transmission
											</p>

											<p
												className={`font-medium ${formatTransmission(vinDetails) === 'Not specified' ? 'text-brg-border' : ''}`}
											>
												{formatTransmission(vinDetails)}
											</p>
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					<div className="lg:col-span-4 space-y-6">
						<div className="bg-white rounded-lg border border-brg-light overflow-hidden">
							<div className="aspect-[16/9] w-full relative">
								<Map
									locations={[
										{
											name: `${toTitleCase(vinDetails?.Manufacturer || 'Factory')}`,
											address:
												formatPlantLocation(vinDetails),
										},
										car.shipping?.port
											? {
													name: `Port of ${toTitleCase(car.shipping.port)}`,
													address: `Port of ${toTitleCase(car.shipping.port)}`,
												}
											: null,
										{
											name: `${car.location?.city}, ${car.location?.state}`,
											address: `${car.location?.city}, ${car.location?.state}, ${car.location?.country}`,
										},
									].filter(
										(location): location is Location =>
											location !== null
									)}
								/>
							</div>

							<div className="p-4 flex items-center justify-between">
								<div>
									<p className="font-medium text-lg">
										{car.location?.city}
									</p>

									<p className="text-brg-mid">
										{car.location?.state},{' '}
										{car.location?.country}
									</p>
								</div>

								<svg
									className="w-5 h-5 text-brg-mid"
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
						</div>

						<div>
							<h2 className="text-xl font-semibold mb-4">
								Timeline
							</h2>

							<div className="bg-white rounded-lg border border-brg-light p-6">
								{car.owner && (
									<TimelineItem
										name={car.owner.name || 'Unknown'}
										dateRange="2022 – Present"
										location={`${car.location?.city}, ${car.location?.state}, ${car.location?.country}`}
										isActive={true}
									/>
								)}
								<TimelineItem
									name="Jane Smith"
									dateRange="2015 – 2022"
									location="Seattle, WA, US"
								/>
								<TimelineItem name="Robert Johnson" />
								<TimelineItem
									dateRange="1992 – 1995"
									location="Miami, FL, US"
								/>

								{car.shipping && (
									<TimelineItem
										name={`${car.shipping.vessel ? `Shipped via ${toTitleCase(car.shipping.vessel)}` : 'Shipped'}`}
										location={
											car.shipping.port
												? `Port of ${toTitleCase(car.shipping.port)}`
												: undefined
										}
										dateRange={toPrettyDate(
											car.shipping.date || ''
										)}
									/>
								)}

								{formatPlantLocation(vinDetails) && (
									<TimelineItem
										name={`${toTitleCase(
											vinDetails?.Manufacturer ||
												'Factory'
										)}`}
										dateRange={
											car.manufactureDate
												? toPrettyDate(
														car.manufactureDate
													)
												: car.edition.year.toString()
										}
										location={formatPlantLocation(
											vinDetails
										)}
										showConnector={false}
										isActive={true}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default CarProfile;
