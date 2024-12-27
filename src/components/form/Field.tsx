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

interface FieldProps {
	caption?: string;
	children: React.ReactNode;
	className?: string;
	error?: string | null;
	id: string;
	label: string;
	required?: boolean;
}

export const Field = ({
	caption,
	children,
	className = '',
	error,
	id,
	label,
	required = false,
}: FieldProps) => (
	<div className={`flex flex-col gap-1 ${className}`}>
		<label htmlFor={id} className="text-sm font-medium text-brg">
			<span>
				{label} {required && <span className="text-red-500">*</span>}
			</span>

			{(caption || error) && (
				<div className="flex justify-between items-start gap-2">
					{caption && (
						<span className="text-xs text-brg-border font-normal">
							{caption}
						</span>
					)}

					{error && (
						<span className="text-xs text-red-500">{error}</span>
					)}
				</div>
			)}
		</label>

		{children}
	</div>
);
