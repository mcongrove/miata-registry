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

export const Diff = ({
	label,
	newValue,
	oldValue,
	subText,
}: {
	label: string;
	newValue?: unknown;
	oldValue?: unknown;
	subText?: string;
}) => {
	const formatValue = (value: unknown) => {
		if (value == null || value === '') return null;
		if (typeof value === 'object') return JSON.stringify(value);
		return value as string | number | boolean;
	};

	const formattedOld = formatValue(oldValue);
	const formattedNew = formatValue(newValue);

	if (formattedOld === formattedNew || (!formattedOld && !formattedNew))
		return null;

	return (
		<div className="flex items-start gap-4 font-mono">
			<span className="w-1/3 text-sm font-medium text-brg-mid">
				{label}
			</span>

			<span className="w-1/3 line-through text-sm text-brg-border">
				{formattedOld ?? 'None'}
			</span>

			<span
				className="w-1/3 text-sm text-brg cursor-pointer hover:opacity-80"
				onClick={() => {
					if (formattedNew != null) {
						navigator.clipboard.writeText(String(formattedNew));
					}
				}}
				title="Click to copy"
			>
				{formattedNew ?? 'None'}

				{subText && (
					<>
						<br />
						<span className="text-brg-border">{subText}</span>
					</>
				)}
			</span>
		</div>
	);
};
