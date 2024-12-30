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

import {
	GoogleMap,
	Marker,
	Polyline,
	useJsApiLoader,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { TMapLocation } from '../../types/Location';

interface MarkerData {
	name: string;
	position: google.maps.LatLngLiteral;
}

export const Map = ({
	locations,
	hasOwners = false,
}: {
	locations?: (TMapLocation | null)[];
	hasOwners: boolean;
}) => {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
	});
	const [markers, setMarkers] = useState<MarkerData[]>([]);

	useEffect(() => {
		const markLocations = async () => {
			if (!locations) return;

			const validLocations = locations.filter(
				(location): location is TMapLocation => location !== null
			);

			const markers = validLocations.reduce(
				(acc: MarkerData[], location: TMapLocation) => {
					const lastMarker = acc[acc.length - 1];

					if (lastMarker && lastMarker.name === location.name) {
						return acc;
					}

					acc.push({
						name: location.name || '',
						position: {
							lat: location.latitude || 0,
							lng: location.longitude || 0,
						},
					});
					return acc;
				},
				[]
			);
			console.log(markers);

			setMarkers(markers);
		};

		if (isLoaded) {
			markLocations();
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
