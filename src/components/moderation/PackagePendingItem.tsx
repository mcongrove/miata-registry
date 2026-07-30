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

import { useMemo, useState, type ReactNode } from 'react';
import { TCar, TCarPending } from '../../types/Car';
import {
	TCarOwner,
	TCarOwnerPending,
	TOwner,
	TOwnerPending,
} from '../../types/Owner';
import { Diff, clerkUserLink, copyableSubText, vinValidateLink } from './Diff';
import { PendingItem } from './PendingItem';

const OWNER_DIFF_FIELD_ORDER = ['name', 'city', 'state', 'country'] as const;
const CAR_DIFF_FIELD_ORDER = ['vin', 'edition_id'] as const;
const PACKAGE_DIFF_PRIORITY = [
	'vin',
	'edition_id',
	'name',
	'city',
	'state',
	'country',
	'date_start',
	'car_owners.id',
] as const;

const EDITABLE_OWNER_FIELDS = ['name', 'city', 'state', 'country'] as const;

const sortByFieldOrder = (keys: string[], order: readonly string[]) => {
	const priority = new Map(order.map((field, index) => [field, index]));

	return keys.sort((a, b) => {
		const aRank = priority.get(a) ?? order.length;
		const bRank = priority.get(b) ?? order.length;

		if (aRank !== bRank) return aRank - bRank;

		return a.localeCompare(b);
	});
};

const orderedOwnerDiffFields = (proposed: TOwner) =>
	sortByFieldOrder(
		Object.keys(proposed).filter((field) => field !== 'id'),
		OWNER_DIFF_FIELD_ORDER
	);

const orderedCarDiffFields = (pending: {
	current: TCar | null;
	proposed: TCar;
}) =>
	sortByFieldOrder(
		Object.keys(pending.proposed).filter(
			(field) =>
				field !== 'id' &&
				pending.proposed[field as keyof TCar] !==
					pending.current?.[field as keyof TCar]
		),
		CAR_DIFF_FIELD_ORDER
	);

export type TPackage = {
	car: (TCarPending & { current: TCar | null; proposed: TCar }) | null;
	carOwner:
		| (TCarOwnerPending & {
				car_current_owner_id?: string | null;
				current: TCarOwner | null;
				proposed: TCarOwner;
		  })
		| null;
	owner: (TOwnerPending & { proposed: TOwner }) | null;
};

export type PackageApproveOverrides = {
	owner?: {
		city?: string | null;
		country?: string | null;
		name?: string | null;
		state?: string | null;
	};
};

export const PackagePendingItem = ({
	createdAt,
	onApprove,
	onApproveSkipEmail,
	onReject,
	pkg,
	status,
}: {
	createdAt: number;
	onApprove: (overrides: PackageApproveOverrides) => void;
	onApproveSkipEmail: (overrides: PackageApproveOverrides) => void;
	onReject: () => void;
	pkg: TPackage;
	status?: 'approved' | 'rejected';
}) => {
	const initialOwner = pkg.owner?.proposed;

	const [name, setName] = useState(initialOwner?.name ?? '');
	const [city, setCity] = useState(initialOwner?.city ?? '');
	const [state, setState] = useState(initialOwner?.state ?? '');
	const [country, setCountry] = useState(initialOwner?.country ?? '');

	const ownerEdits = useMemo(
		() => ({
			name,
			city,
			state,
			country,
		}),
		[name, city, state, country]
	);

	const ownerSetters = {
		name: setName,
		city: setCity,
		state: setState,
		country: setCountry,
	} as const;

	const buildOverrides = (): PackageApproveOverrides => {
		const overrides: PackageApproveOverrides = {};

		if (pkg.owner) {
			overrides.owner = {
				name: name || null,
				city: city || null,
				state: state || null,
				country: country || null,
			};
		}

		return overrides;
	};

	type TPackageDiff = {
		key: string;
		label: string;
		oldValue?: unknown;
		newValue?: unknown;
		subText?: ReactNode;
		subTextCopy?: string;
		copyValue?: string;
		editValue?: string;
		onEditChange?: (value: string) => void;
		editType?: 'text' | 'date';
		edited?: boolean;
	};

	const byKey = new Map<string, TPackageDiff>();

	const addDiff = (diff: TPackageDiff) => {
		if (!byKey.has(diff.key)) {
			byKey.set(diff.key, diff);
		}
	};

	if (pkg.car) {
		const packageHiddenCarFields = new Set([
			'current_owner_id',
			'manufacture_city',
			'manufacture_date',
			'manufacture_prefecture',
			'vin_decode_status',
			'vin_details',
		]);

		for (const field of orderedCarDiffFields(pkg.car)) {
			if (packageHiddenCarFields.has(field)) continue;

			if (field === 'edition_id') {
				const editionId = pkg.car.proposed.edition_id;

				addDiff({
					key: field,
					label: field,
					oldValue: pkg.car.current?.edition_id,
					newValue: pkg.car.edition ?? editionId,
					subText: pkg.car.edition ? editionId : undefined,
					copyValue: editionId,
				});

				continue;
			}

			addDiff({
				key: field,
				label: field,
				oldValue: pkg.car.current?.[field as keyof TCar],
				newValue: pkg.car.proposed[field as keyof TCar],
				subText:
					field === 'vin' && pkg.car.proposed.vin
						? vinValidateLink(pkg.car.proposed.vin)
						: undefined,
			});
		}
	}

	if (pkg.owner) {
		const clerkUserId = pkg.owner.proposed.user_id;
		const ownerId = pkg.owner.proposed.id;

		for (const field of orderedOwnerDiffFields(pkg.owner.proposed)) {
			if (field === 'user_id') continue;

			if ((EDITABLE_OWNER_FIELDS as readonly string[]).includes(field)) {
				const key = field as (typeof EDITABLE_OWNER_FIELDS)[number];
				const original = String(initialOwner?.[key] ?? '');
				const current = ownerEdits[key];

				addDiff({
					key: field,
					label: field,
					oldValue: undefined,
					newValue: current,
					...(status
						? {}
						: {
								editValue: current,
								onEditChange: ownerSetters[key],
								edited: current !== original,
							}),
					subText:
						field === 'name' && (clerkUserId || ownerId) ? (
							<>
								{ownerId ? copyableSubText(ownerId) : null}
								{clerkUserId && ownerId ? <br /> : null}
								{clerkUserId
									? clerkUserLink(clerkUserId)
									: null}
							</>
						) : undefined,
				});

				continue;
			}

			addDiff({
				key: field,
				label: field,
				oldValue: undefined,
				newValue: pkg.owner.proposed[field as keyof TOwner],
			});
		}
	}

	if (pkg.carOwner) {
		if (pkg.carOwner.id) {
			addDiff({
				key: 'car_owners.id',
				label: 'car_owners.id',
				newValue: pkg.carOwner.id,
			});
		}

		for (const field of Object.keys(pkg.carOwner.proposed)) {
			if (field === 'car_id' || field === 'owner_id') {
				continue;
			}

			if (
				pkg.carOwner.proposed[field as keyof TCarOwner] ===
				pkg.carOwner.current?.[field as keyof TCarOwner]
			) {
				continue;
			}

			addDiff({
				key: field,
				label: field,
				oldValue: pkg.carOwner.current?.[field as keyof TCarOwner],
				newValue: pkg.carOwner.proposed[field as keyof TCarOwner],
			});
		}
	}

	const orderedKeys = sortByFieldOrder(
		[...byKey.keys()],
		PACKAGE_DIFF_PRIORITY
	);

	return (
		<PendingItem
			carId={pkg.carOwner?.proposed.car_id}
			createdAt={createdAt}
			status={status}
			onApprove={status ? undefined : () => onApprove(buildOverrides())}
			onApproveSkipEmail={
				status ? undefined : () => onApproveSkipEmail(buildOverrides())
			}
			onReject={status ? undefined : onReject}
		>
			{orderedKeys.map((key) => {
				const diff = byKey.get(key)!;

				return (
					<Diff
						key={diff.key}
						label={diff.label}
						oldValue={diff.oldValue}
						newValue={diff.newValue}
						subText={diff.subText}
						subTextCopy={diff.subTextCopy}
						copyValue={diff.copyValue}
						editValue={diff.editValue}
						onEditChange={diff.onEditChange}
						editType={diff.editType}
						edited={diff.edited}
					/>
				);
			})}
		</PendingItem>
	);
};
