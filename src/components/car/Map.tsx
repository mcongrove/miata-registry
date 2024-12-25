/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import {
	GoogleMap,
	useJsApiLoader,
	Marker,
	Polyline,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';

interface Location {
	name: string;
	address: string;
}

interface MapProps {
	locations: Location[];
	hasOwners: boolean;
}

interface MarkerData {
	name: string;
	position: google.maps.LatLngLiteral;
}

export const Map = ({ locations, hasOwners = false }: MapProps) => {
	const [markers, setMarkers] = useState<MarkerData[]>([]);
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
	});

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
							const position = data.results[0].geometry.location;

							return {
								name: loc.name,
								position: position,
							};
						}
					} catch (error) {
						console.error('Geocoding error:', error);
					}
					return null;
				})
			);

			const validMarkers = geocoded.filter(
				(m): m is MarkerData => m !== null
			);

			setMarkers(validMarkers);
		};

		if (isLoaded) {
			geocodeLocations();
		}
	}, [locations, isLoaded]);

	if (!isLoaded) {
		return <div className="w-full h-96 bg-brg-50" />;
	}

	return (
		<div className="w-full h-96 bg-brg-50">
			<GoogleMap
				mapContainerClassName="w-full h-full"
				options={{
					disableDefaultUI: true,
					zoomControl: true,
					styles: [
						{
							stylers: [{ saturation: -100 }, { lightness: 10 }],
						},
					],
				}}
				zoom={hasOwners ? 5 : 1}
				center={
					markers[markers.length - 1]?.position || {
						lat: 39.8283,
						lng: -98.5795,
					}
				}
			>
				{markers.map((marker, index) => (
					<Marker
						key={index}
						position={marker.position}
						title={marker.name}
						icon={{
							path: window.google.maps.SymbolPath.CIRCLE,
							fillColor: '#172E28',
							fillOpacity: 1,
							strokeColor: '#FFFFFF',
							strokeWeight: 2,
							scale: index === markers.length - 1 ? 8 : 4,
						}}
					/>
				))}

				{markers.length > 1 && (
					<Polyline
						path={markers.map((marker) => marker.position)}
						options={{
							strokeColor: '#172E28',
							strokeOpacity: 0.8,
							strokeWeight: 2,
							geodesic: true,
						}}
					/>
				)}
			</GoogleMap>
		</div>
	);
};
