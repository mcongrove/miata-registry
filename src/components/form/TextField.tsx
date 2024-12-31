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
	defaultValue?: string;
	id: string;
	name: string;
	onChange?: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	placeholder: string;
	readOnly?: boolean;
	required?: boolean;
	type: string;
}

export function TextField({
	defaultValue,
	id,
	name,
	onChange,
	placeholder,
	readOnly,
	required,
	type,
}: TextFieldProps) {
	return type === 'textarea' ? (
		<textarea
			id={id}
			name={name}
			placeholder={placeholder}
			defaultValue={defaultValue}
			required={required}
			onChange={onChange}
			className="w-full h-32 px-3 py-2 text-[16px] md:text-sm border border-brg-light rounded-lg focus:outline-none focus:border-brg-mid text-brg [&:not([value])]:!text-[#9CA3AF]"
			readOnly={readOnly}
		/>
	) : (
		<input
			id={id}
			name={name}
			type={type}
			placeholder={placeholder}
			defaultValue={defaultValue}
			required={required}
			className={`w-full px-3 py-2 text-[16px] md:text-sm border border-brg-light rounded-lg focus:outline-none focus:border-brg-mid text-brg [&:not([value])]:!text-[#9CA3AF]`}
			readOnly={readOnly}
			onChange={onChange}
		/>
	);
}
