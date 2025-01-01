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

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TAddress } from '../../types/Location';

interface LocationProps {
	className?: string;
	fullAddress?: boolean;
	id: string;
	name: string;
	onLocationSelect?: (location: string) => void;
	placeholder?: string;
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
	required,
	value,
}: LocationProps) {
	const [inputValue, setInputValue] = useState(value || '');
	const inputRef = useRef<HTMLInputElement>(null);
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(
		null
	);

	useEffect(() => {
		if (value !== undefined) {
			setInputValue(value);
		}
	}, [value]);

	useEffect(() => {
		if (!inputRef.current) return;

		autocompleteRef.current = new window.google.maps.places.Autocomplete(
			inputRef.current,
			{
				types: fullAddress ? ['address'] : ['(cities)'],
				fields: ['address_components', 'formatted_address'],
			}
		);

		autocompleteRef.current.addListener('place_changed', () => {
			const place = autocompleteRef.current?.getPlace();

			if (!place?.address_components) return;

			let formattedLocation: string;

			if (fullAddress) {
				formattedLocation = place.formatted_address || '';
			} else {
				const components = place.address_components;
				const location: TAddress = { country: '' };

				components.forEach((component) => {
					const types = component.types;

					if (types.includes('street_number')) {
						location.streetNumber = component.long_name;
					} else if (types.includes('route')) {
						location.street = component.long_name;
					} else if (types.includes('locality')) {
						location.city = component.long_name;
					} else if (types.includes('administrative_area_level_1')) {
						location.state = component.short_name;
					} else if (types.includes('country')) {
						location.country = component.short_name;
					} else if (types.includes('postal_code')) {
						location.postalCode = component.long_name;
					}
				});

				formattedLocation = [
					location.city,
					location.state,
					location.country,
				]
					.filter(Boolean)
					.join(', ');
			}

			setInputValue(formattedLocation);

			if (onLocationSelect && formattedLocation) {
				onLocationSelect(formattedLocation);
			}
		});

		return () => {
			if (autocompleteRef.current) {
				google.maps.event.clearInstanceListeners(
					autocompleteRef.current
				);
			}
		};
	}, [onLocationSelect, fullAddress]);

	return (
		<input
			ref={inputRef}
			id={id}
			name={name}
			type="text"
			placeholder={placeholder}
			required={required}
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			className={twMerge(
				'w-full px-3 py-2 !text-[16px] md:!text-sm border border-brg-light rounded-lg focus:outline-none focus:border-brg-mid',
				className
			)}
		/>
	);
}
