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

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type BaseTextFieldProps = {
	type?: 'date' | 'email' | 'number' | 'textarea' | 'text';
	className?: string;
};

type InputProps = BaseTextFieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextAreaProps = BaseTextFieldProps &
	TextareaHTMLAttributes<HTMLTextAreaElement>;

type TextFieldProps = InputProps | TextAreaProps;

export function TextField({
	className,
	type = 'text',
	...props
}: TextFieldProps) {
	const baseClassName =
		'w-full px-3 py-2 text-[16px] md:text-sm border border-brg-light rounded-lg focus:outline-none focus:border-brg-mid text-brg placeholder-[#9CA3AF]';

	return type === 'textarea' ? (
		<textarea
			className={twMerge(baseClassName, 'h-32', className)}
			{...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
		/>
	) : (
		<input
			type={type}
			className={twMerge(baseClassName, className)}
			{...(props as InputHTMLAttributes<HTMLInputElement>)}
		/>
	);
}
