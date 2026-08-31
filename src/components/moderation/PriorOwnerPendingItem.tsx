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

import { TCarOwner, TCarOwnerPending } from '../../types/Owner';
import { parsePriorOwnerIntent } from '../../utils/priorOwnerIntent';
import { Diff, copyableSubText } from './Diff';
import { PendingItem } from './PendingItem';

const ACTION_TITLES = {
	create: 'Add prior owner',
	update: 'Update prior owner',
	delete: 'Remove prior owner',
} as const;

const formatOwnershipDate = (value?: string | null) => {
	if (!value) return undefined;

	return value.toString().split('T')[0];
};

export const isPriorOwnerPending = (carOwner: {
	information?: string | null;
	proposed?: unknown;
}) => {
	const proposed = carOwner.proposed as
		{ information?: string | null } | undefined;

	return (
		parsePriorOwnerIntent(proposed?.information ?? carOwner.information) !=
		null
	);
};

export const PriorOwnerPendingItem = ({
	carOwner,
	createdAt,
	onApprove,
	onReject,
	status,
}: {
	carOwner: TCarOwnerPending & {
		current: TCarOwner | null;
		proposed: TCarOwner & { information?: string | null };
	};
	createdAt: number;
	onApprove: () => void;
	onReject: () => void;
	status?: 'approved' | 'rejected';
}) => {
	const intent = parsePriorOwnerIntent(carOwner.proposed.information);

	if (!intent) {
		return null;
	}

	const current = carOwner.current;
	const proposedOwner = 'owner' in intent ? intent.owner : null;
	const isDelete = intent.action === 'delete';

	const oldName = current?.name;
	const newName = isDelete ? undefined : proposedOwner?.name;
	const oldCity = current?.city;
	const newCity = isDelete ? undefined : proposedOwner?.city;
	const oldState = current?.state;
	const newState = isDelete ? undefined : proposedOwner?.state;
	const oldCountry = current?.country;
	const newCountry = isDelete ? undefined : proposedOwner?.country;
	const oldStart = formatOwnershipDate(current?.date_start);
	const newStart = isDelete
		? undefined
		: formatOwnershipDate(carOwner.proposed.date_start);
	const oldEnd = formatOwnershipDate(current?.date_end);
	const newEnd = isDelete
		? undefined
		: formatOwnershipDate(carOwner.proposed.date_end);

	return (
		<PendingItem
			title={ACTION_TITLES[intent.action]}
			carId={carOwner.proposed.car_id}
			createdAt={createdAt}
			status={status}
			onApprove={status ? undefined : onApprove}
			onReject={status ? undefined : onReject}
		>
			<Diff
				label="name"
				oldValue={oldName}
				newValue={newName}
				subText={
					carOwner.proposed.owner_id
						? copyableSubText(carOwner.proposed.owner_id)
						: undefined
				}
			/>
			<Diff label="city" oldValue={oldCity} newValue={newCity} />
			<Diff label="state" oldValue={oldState} newValue={newState} />
			<Diff label="country" oldValue={oldCountry} newValue={newCountry} />
			<Diff label="date_start" oldValue={oldStart} newValue={newStart} />
			<Diff label="date_end" oldValue={oldEnd} newValue={newEnd} />
		</PendingItem>
	);
};
