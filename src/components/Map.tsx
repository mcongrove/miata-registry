/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface Location {
	name: string;
	address: string;
}

interface MapProps {
	locations: Location[];
}

interface MarkerData {
	name: string;
	position: google.maps.LatLngLiteral;
}

export const Map = ({ locations }: MapProps) => {
	const [markers, setMarkers] = useState<MarkerData[]>([]);

	useEffect(() => {
		const geocodeLocations = async () => {
			const validLocations = locations.filter((loc) =>
				loc.address?.trim()
			);

			const geocoded = await Promise.all(
				validLocations.map(async (loc) => {
					try {
						const response = await fetch(
							`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
								loc.address
							)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
						);
						const data = await response.json();

						if (data.results?.[0]?.geometry?.location) {
							return {
								name: loc.name,
								position: data.results[0].geometry.location,
							};
						}
					} catch (error) {
						console.error('Geocoding error:', error);
					}
					return null;
				})
			);

			setMarkers(geocoded.filter((m): m is MarkerData => m !== null));
		};

		if (locations.length > 0) {
			geocodeLocations();
		}
	}, [locations]);

	const mapOptions = {
		disableDefaultUI: true,
		zoomControl: true,
	};

	return (
		<div className="w-full h-[400px]">
			<LoadScript
				googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
			>
				<GoogleMap
					mapContainerClassName="w-full h-full"
					options={mapOptions}
					zoom={4}
					center={
						markers[markers.length - 1]?.position || {
							lat: 35.6762,
							lng: -139.6503,
						}
					}
				>
					{markers.map((marker, index) => (
						<Marker
							key={index}
							position={marker.position}
							title={marker.name}
							icon={{
								path: google.maps.SymbolPath.CIRCLE,
								fillColor: '#172E28',
								fillOpacity: 1,
								strokeColor: '#172E28',
								strokeWeight: 1,
								scale: 8,
							}}
						/>
					))}
				</GoogleMap>
			</LoadScript>
		</div>
	);
};
