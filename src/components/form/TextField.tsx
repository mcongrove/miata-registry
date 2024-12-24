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
	id: string;
	name: string;
	label: string;
	type?: 'text' | 'email' | 'textarea';
	placeholder?: string;
	required?: boolean;
	rows?: number;
	className?: string;
}

export const TextField = ({
	id,
	name,
	label,
	type = 'text',
	placeholder,
	required = false,
	rows = 4,
	className = '',
}: TextFieldProps) => {
	const inputClasses =
		'rounded-lg border border-brg-light bg-white px-2.5 py-2 text-sm text-brg';

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<label htmlFor={id} className="text-sm font-medium text-brg">
				{label} {required && <span className="text-red-500">*</span>}
			</label>

			{type === 'textarea' ? (
				<textarea
					id={id}
					name={name}
					placeholder={placeholder}
					rows={rows}
					className={inputClasses}
					required={required}
				/>
			) : (
				<input
					type={type}
					id={id}
					name={name}
					placeholder={placeholder}
					className={inputClasses}
					required={required}
				/>
			)}
		</div>
	);
};
