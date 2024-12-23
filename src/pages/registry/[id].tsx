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

export const CarProfile = () => {
	const { id } = useParams();
	const [car, setCar] = useState<Car | null>(null);

	useEffect(() => {
		if (id) {
			const foundCar = sampleCars.find((c) => c.id === id);
			setCar(foundCar || null);
		}
	}, [id]);

	const getStaticMapUrl = (location: string) => {
		const encodedLocation = encodeURIComponent(location);
		return (
			`https://maps.googleapis.com/maps/api/staticmap?` +
			`center=${encodedLocation}` +
			`&zoom=4` +
			`&size=300x300` +
			`&markers=color:red%7C${encodedLocation}` +
			`&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}` +
			`&style=element:labels%7Cvisibility:off`
		);
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
								{car.edition.name}
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

						{car.owner && (
							<div>
								<h2 className="text-xl font-semibold mb-4">
									Owner
								</h2>
								<div className="bg-white rounded-lg shadow-md p-6">
									<p>{car.owner.name}</p>
								</div>
							</div>
						)}
					</div>

					<div className="lg:col-span-4 space-y-6">
						<div>
							<h2 className="text-xl font-semibold mb-4">
								Location
							</h2>
							<div className="bg-white rounded-lg shadow-md p-6">
								<div className="grid grid-cols-2 gap-6">
									<div className="flex items-center">
										<div>
											<p className="mb-2">
												{car.location?.city},{' '}
												{car.location?.state}
											</p>
											<p>{car.location?.country}</p>
										</div>
									</div>

									<div className="aspect-square rounded-lg overflow-hidden">
										<img
											src={getStaticMapUrl(
												`${car.location?.city}, ${car.location?.state}, ${car.location?.country}`
											)}
											alt="Car location map"
											className="w-full h-full object-cover"
										/>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h2 className="text-xl font-semibold mb-4">
								Car Details
							</h2>
							<div className="bg-white rounded-lg shadow-md p-6 space-y-3">
								<p>
									<span className="font-medium">Color:</span>{' '}
									{car.color}
								</p>

								<p>
									<span className="font-medium">VIN:</span>{' '}
									{car.vin}
								</p>

								<p>
									<span className="font-medium">
										Generation:
									</span>{' '}
									{car.edition.generation}
								</p>

								<p>
									<span className="font-medium">Year:</span>{' '}
									{car.edition.year}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default CarProfile;
