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

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import {
	formatLocation,
	locationFromAddressComponents,
	parseLocation,
} from '../../utils/location';

interface LocationProps {
	className?: string;
	fullAddress?: boolean;
	id: string;
	name: string;
	onLocationSelect?: (location: string) => void;
	placeholder?: string;
	requirePlaceSelection?: boolean;
	required?: boolean;
	value?: string;
}

export function Location({
	className,
	fullAddress = false,
	id,
	name,
	onLocationSelect,
	placeholder = '',
	requirePlaceSelection,
	required,
	value,
}: LocationProps) {
	const { isLoaded, mapsEnabled } = useGoogleMaps();
	const enforcePlaceSelection = requirePlaceSelection ?? mapsEnabled;

	const [inputValue, setInputValue] = useState(value || '');
	const [committedValue, setCommittedValue] = useState(value || '');
	const inputRef = useRef<HTMLInputElement>(null);
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(
		null
	);
	const placeSelectedRef = useRef(false);

	useEffect(() => {
		if (value !== undefined) {
			setInputValue(value);
			setCommittedValue(value);
		}
	}, [value]);

	useEffect(() => {
		if (!mapsEnabled || !isLoaded || !inputRef.current) {
			return;
		}

		autocompleteRef.current = new window.google.maps.places.Autocomplete(
			inputRef.current,
			{
				types: fullAddress ? ['address'] : ['(cities)'],
				fields: ['address_components', 'formatted_address'],
			}
		);

		autocompleteRef.current.addListener('place_changed', () => {
			const place = autocompleteRef.current?.getPlace();

			if (!place?.address_components) {
				return;
			}

			let formattedLocation: string;

			if (fullAddress) {
				formattedLocation = place.formatted_address || '';
			} else {
				const parsed = locationFromAddressComponents(
					place.address_components
				);

				formattedLocation = formatLocation(parsed);
			}

			if (!formattedLocation) {
				return;
			}

			placeSelectedRef.current = true;
			setCommittedValue(formattedLocation);
			setInputValue(formattedLocation);
			onLocationSelect?.(formattedLocation);
		});

		return () => {
			if (autocompleteRef.current) {
				google.maps.event.clearInstanceListeners(
					autocompleteRef.current
				);
			}

			autocompleteRef.current = null;
		};
	}, [fullAddress, isLoaded, mapsEnabled, onLocationSelect]);

	const handleChange = (next: string) => {
		placeSelectedRef.current = false;
		setInputValue(next);
	};

	const handleBlur = () => {
		if (!enforcePlaceSelection) {
			const formatted = formatLocation(parseLocation(inputValue));

			setInputValue(formatted);
			setCommittedValue(formatted);

			if (formatted !== committedValue) {
				onLocationSelect?.(formatted);
			}

			return;
		}

		const trimmed = inputValue.trim();

		if (!trimmed) {
			if (committedValue) {
				setCommittedValue('');
				onLocationSelect?.('');
			}

			setInputValue('');
			placeSelectedRef.current = false;

			return;
		}

		if (placeSelectedRef.current || trimmed === committedValue) {
			placeSelectedRef.current = false;

			return;
		}

		setInputValue(committedValue);
		placeSelectedRef.current = false;
	};

	return (
		<input
			ref={inputRef}
			id={id}
			name={name}
			type="text"
			placeholder={placeholder}
			required={required}
			value={inputValue}
			onChange={(e) => handleChange(e.target.value)}
			onBlur={handleBlur}
			autoComplete="off"
			className={twMerge(
				'w-full p-2 text-[16px] md:text-sm text-brg border border-brg-light rounded-lg focus:outline-none focus:border-brg-mid',
				className
			)}
		/>
	);
}
