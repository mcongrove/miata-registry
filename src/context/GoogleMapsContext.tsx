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

import { Libraries, useJsApiLoader } from '@react-google-maps/api';
import { createContext, ReactNode, useContext } from 'react';

interface GoogleMapsContextType {
	isLoaded: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
	undefined
);

const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: GOOGLE_MAPS_LIBRARIES,
	});

	return (
		<GoogleMapsContext.Provider value={{ isLoaded }}>
			{children}
		</GoogleMapsContext.Provider>
	);
}

export function useGoogleMaps() {
	const context = useContext(GoogleMapsContext);
	if (context === undefined) {
		throw new Error(
			'useGoogleMaps must be used within a GoogleMapsProvider'
		);
	}
	return context;
}
