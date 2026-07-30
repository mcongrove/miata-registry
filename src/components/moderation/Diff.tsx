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

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { clerkDashboardUserUrl } from '../../constants/clerk';

const DIFF_FIELD_LABELS: Record<string, string> = {
	'car_owners.id': 'Ownership ID',
	car_id: 'Car ID',
	city: 'City',
	country: 'Country',
	current_owner_id: 'Owner ID',
	date_end: 'End Date',
	date_start: 'Start Date',
	destroyed: 'Destroyed',
	edition_id: 'Edition',
	id: 'ID',
	information: 'Information',
	instagram: 'Instagram',
	links: 'Links',
	manufacture_city: 'Manufacture City',
	manufacture_date: 'Manufacture Date',
	manufacture_prefecture: 'Manufacture Prefecture',
	mileage: 'Mileage',
	mileage_date: 'Mileage Date',
	name: 'Name',
	owner_id: 'Owner ID',
	rarity_original_hardtop: 'Original Hardtop',
	rarity_original_paint: 'Original Paint',
	rarity_original_softtop: 'Original Soft Top',
	rarity_original_wheels: 'Original Wheels',
	rarity_sale_documents: 'Sale Documents',
	rarity_score: 'Rarity Score',
	rarity_service_records: 'Service Records',
	rarity_window_sticker: 'Window Sticker',
	sale_date: 'Sale Date',
	sale_dealer_city: 'Sale Dealer City',
	sale_dealer_country: 'Sale Dealer Country',
	sale_dealer_name: 'Sale Dealer Name',
	sale_dealer_state: 'Sale Dealer State',
	sale_msrp: 'Sale MSRP',
	sequence: 'Sequence',
	shipping_city: 'Shipping City',
	shipping_country: 'Shipping Country',
	shipping_date: 'Shipping Date',
	shipping_state: 'Shipping State',
	shipping_vessel: 'Shipping Vessel',
	state: 'State',
	story: 'Story',
	updated_date: 'Updated Date',
	user_id: 'Clerk User ID',
	vin: 'VIN',
	vin_decode_status: 'VIN Decode Status',
	vin_details: 'VIN Details',
};

export const formatDiffLabel = (field: string) => {
	if (DIFF_FIELD_LABELS[field]) return DIFF_FIELD_LABELS[field];

	return field
		.split(/[._]/)
		.filter(Boolean)
		.map((part) => {
			const upper = part.toUpperCase();

			if (upper === 'ID' || upper === 'VIN' || upper === 'MSRP') {
				return upper;
			}

			return part.charAt(0).toUpperCase() + part.slice(1);
		})
		.join(' ');
};

export const Diff = ({
	label,
	newValue,
	oldValue,
	subText,
	subTextCopy,
	copyValue,
	editValue,
	onEditChange,
	editPlaceholder,
	editType = 'text',
	edited = false,
}: {
	label: string;
	newValue?: unknown;
	oldValue?: unknown;
	subText?: ReactNode;
	subTextCopy?: string;
	/** When set, the whole new-value cell copies this (e.g. edition id under a pretty name). */
	copyValue?: string;
	editValue?: string;
	onEditChange?: (value: string) => void;
	editPlaceholder?: string;
	editType?: 'text' | 'date' | 'textarea';
	edited?: boolean;
}) => {
	const formatValue = (value: unknown) => {
		if (value == null || value === '') return null;
		if (typeof value === 'object') return JSON.stringify(value);
		return value as string | number | boolean;
	};

	const formattedOld = formatValue(oldValue);
	const formattedNew = formatValue(newValue);
	const hasSubText = subText != null && subText !== '';
	const isEditable = typeof onEditChange === 'function';

	if (!isEditable) {
		if (formattedOld === formattedNew) {
			if (formattedOld || !hasSubText) return null;
		} else if (!formattedOld && !formattedNew && !hasSubText) {
			return null;
		}
	}

	const subTextNode = hasSubText ? (
		<>
			<br />
			{!copyValue && subTextCopy ? (
				<span
					className="text-brg-border cursor-pointer"
					onClick={(event) => {
						event.stopPropagation();
						navigator.clipboard.writeText(subTextCopy);
					}}
					title="Click to copy"
				>
					{subText}
				</span>
			) : (
				<span className="text-brg-border">{subText}</span>
			)}
		</>
	) : null;

	return (
		<div className="flex items-start gap-4">
			<span className="w-1/3 text-sm font-medium text-brg-mid">
				{formatDiffLabel(label)}
			</span>

			<span className="w-1/3 line-through font-mono text-sm text-brg-border">
				{formattedOld ?? 'None'}
			</span>

			{isEditable ? (
				<span className="w-1/3 font-mono text-sm text-brg">
					{editType === 'textarea' ? (
						<textarea
							value={editValue ?? ''}
							placeholder={editPlaceholder}
							onChange={(event) =>
								onEditChange(event.target.value)
							}
							rows={3}
							className={twMerge(
								'w-full resize-y bg-transparent p-0 font-mono text-sm text-brg outline-none border-0 border-b border-transparent focus:border-brg-border placeholder:text-brg-border',
								edited && 'border-brg-border/70'
							)}
						/>
					) : (
						<input
							type={editType}
							value={editValue ?? ''}
							placeholder={editPlaceholder}
							onChange={(event) =>
								onEditChange(event.target.value)
							}
							className={twMerge(
								'w-full bg-transparent p-0 font-mono text-sm text-brg outline-none border-0 border-b border-transparent focus:border-brg-border placeholder:text-brg-border',
								edited && 'border-brg-border/70'
							)}
						/>
					)}
					{subTextNode}
				</span>
			) : copyValue ? (
				<span
					className="w-1/3 font-mono text-sm text-brg cursor-pointer"
					onClick={() => navigator.clipboard.writeText(copyValue)}
					title="Click to copy"
				>
					{formattedNew ?? 'None'}
					{subTextNode}
				</span>
			) : (
				<span className="w-1/3 font-mono text-sm">
					<span
						className="text-brg cursor-pointer"
						onClick={() => {
							if (formattedNew != null) {
								navigator.clipboard.writeText(
									String(formattedNew)
								);
							}
						}}
						title="Click to copy"
					>
						{formattedNew ?? 'None'}
					</span>
					{subTextNode}
				</span>
			)}
		</div>
	);
};

export const vinValidateLink = (vin: string) => (
	<a
		href={`https://www.vindecoderz.com/EN/check-lookup/${encodeURIComponent(vin)}`}
		target="_blank"
		rel="noopener noreferrer"
		className="text-brg-border hover:text-brg hover:underline"
		onClick={(e) => e.stopPropagation()}
	>
		Validate VIN
	</a>
);

export const clerkUserLink = (userId: string) => (
	<a
		href={clerkDashboardUserUrl(userId)}
		target="_blank"
		rel="noopener noreferrer"
		className="text-brg-border hover:text-brg hover:underline"
		onClick={(e) => e.stopPropagation()}
	>
		View in Clerk
	</a>
);

export const copyableSubText = (value: string) => (
	<span
		className="text-brg-border cursor-pointer"
		onClick={(event) => {
			event.stopPropagation();
			navigator.clipboard.writeText(value);
		}}
		title="Click to copy"
	>
		{value}
	</span>
);
