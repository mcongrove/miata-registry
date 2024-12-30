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

import { SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	placeholder?: string;
	options: Array<{ value: string | number; label: string }>;
}

export const SelectStyles = (
	disabled: boolean,
	value: string | number,
	className: string
) => {
	return twMerge(
		'w-full p-2 text-xs bg-white border border-brg-border rounded-md focus:outline-none cursor-pointer appearance-none',
		disabled ? 'opacity-50 cursor-not-allowed' : '',
		value ? 'text-brg' : 'text-brg-mid',
		"bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]",
		className
	);
};

export const Select = ({
	className,
	disabled = false,
	onChange,
	options,
	placeholder,
	value,
	...props
}: SelectProps) => (
	<div className="relative">
		<select
			{...props}
			className={SelectStyles(
				disabled,
				value?.toString() || '',
				className || ''
			)}
			onChange={onChange}
			value={value || ''}
			disabled={disabled}
		>
			{placeholder && <option value="">{placeholder}</option>}

			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</div>
);
