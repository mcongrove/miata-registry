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

interface TextFieldProps {
	className?: string;
	id: string;
	name: string;
	placeholder?: string;
	required?: boolean;
	rows?: number;
	type?: 'text' | 'email' | 'textarea';
}

export const TextFieldStyles = (className: string) => `
		w-full rounded-lg border border-brg-light bg-white px-2.5 py-2 text-xs text-brg placeholder:text-brg-/50 ${className}
	`;

export const TextField = ({
	className = '',
	id,
	name,
	placeholder,
	required = false,
	rows = 4,
	type = 'text',
}: TextFieldProps) => (
	<>
		{type === 'textarea' ? (
			<textarea
				id={id}
				name={name}
				placeholder={placeholder}
				rows={rows}
				className={TextFieldStyles(className)}
				required={required}
			/>
		) : (
			<input
				type={type}
				id={id}
				name={name}
				placeholder={placeholder}
				className={TextFieldStyles(className)}
				required={required}
			/>
		)}
	</>
);
