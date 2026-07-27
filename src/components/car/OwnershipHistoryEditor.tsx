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

import { Fragment, type ChangeEvent } from 'react';
import { Location } from '../form/Location';
import { TextField } from '../form/TextField';
import {
	formatLocation,
	normalizeLocation,
	parseLocation,
} from '../../utils/location';
import {
	dateToFormValue,
	datesForGapPlaceholder,
	insertPriorOwnerAt,
	ownershipGapPlaceholder,
	suggestPriorOwnerDatesBetween,
	type TOwnershipGapPlaceholder,
	type TPriorOwnerFormRow,
} from '../../utils/ownershipHistory';

const OWNERSHIP_GRID =
	'grid w-full min-w-[34rem] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8.75rem_8.75rem_1.75rem]';

function ownershipCellClass(extra = '') {
	return `min-w-0 py-1 pr-2 ${extra}`.trim();
}

type CurrentOwnerDisplay = {
	locationDisplay: string;
	name: string;
};

type OwnershipHistoryEditorProps = {
	currentOwner: CurrentOwnerDisplay;
	currentOwnerDateEnd?: string | null;
	currentOwnerDateStart?: string | null;
	disabled?: boolean;
	editionYear?: number | null;
	onChange: (rows: TPriorOwnerFormRow[]) => void;
	onOwnerDateEndChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	rows: TPriorOwnerFormRow[];
	timelineError?: string | null;
	warningOwnerDateEnd?: boolean;
};

function updateRow(
	rows: TPriorOwnerFormRow[],
	key: string,
	patch: Partial<TPriorOwnerFormRow>
) {
	return rows.map((row) => (row.key === key ? { ...row, ...patch } : row));
}

function readCurrentPurchaseStart(fallback?: string | null): string {
	const fromDom = (
		document.getElementById('owner_date_start') as HTMLInputElement | null
	)?.value;

	if (fromDom) {
		return fromDom;
	}

	return fallback ? dateToFormValue(fallback) : '';
}

function insertBoundaries(
	rows: TPriorOwnerFormRow[],
	insertIndex: number,
	purchaseStart: string,
	editionYear?: number | null
) {
	return suggestPriorOwnerDatesBetween({
		currentOwnerPurchaseStart: purchaseStart,
		editionYear,
		insertIndex,
		newerOwnedFrom:
			insertIndex === 0
				? purchaseStart
				: rows[insertIndex - 1]?.date_start || null,
		olderOwnedUntil: rows[insertIndex]?.date_end || null,
	});
}

function InsertOwnerRow({
	disabled,
	onInsert,
}: {
	disabled: boolean;
	onInsert: () => void;
}) {
	return (
		<div className="col-span-full py-0.5">
			<button
				type="button"
				disabled={disabled}
				onClick={onInsert}
				className="flex w-full items-center justify-center py-1 text-xs text-brg-mid disabled:cursor-not-allowed disabled:opacity-50"
				aria-label="Add owner here"
			>
				+ Add owner here
			</button>
		</div>
	);
}

function GapPlaceholderRow({
	disabled,
	onAdd,
	placeholder,
}: {
	disabled: boolean;
	onAdd: () => void;
	placeholder: TOwnershipGapPlaceholder;
}) {
	const ghostFieldClass =
		'bg-brg-light/40 text-brg-border disabled:cursor-not-allowed disabled:opacity-100';

	const dateFieldClass = 'w-full max-w-[8.75rem] shrink-0';

	return (
		<div className="relative col-span-full grid grid-cols-subgrid py-1">
			<div className={ownershipCellClass('pointer-events-none opacity-50')}>
				<TextField
					readOnly
					disabled
					value="Unknown"
					tabIndex={-1}
					aria-hidden
					className={ghostFieldClass}
				/>
			</div>
			<div className={ownershipCellClass('pointer-events-none opacity-50')}>
				<TextField
					readOnly
					disabled
					value=""
					tabIndex={-1}
					aria-hidden
					className={ghostFieldClass}
				/>
			</div>
			<div className={ownershipCellClass('pointer-events-none opacity-50')}>
				<TextField
					readOnly
					disabled
					type="date"
					value={placeholder.date_start}
					tabIndex={-1}
					aria-hidden
					className={`${dateFieldClass} ${ghostFieldClass}`}
				/>
			</div>
			<div className={ownershipCellClass('pointer-events-none opacity-50')}>
				<TextField
					readOnly
					disabled
					type="date"
					value={placeholder.date_end}
					tabIndex={-1}
					aria-hidden
					className={`${dateFieldClass} ${ghostFieldClass}`}
				/>
			</div>
			<div className="min-w-0 py-1" aria-hidden />
			<button
				type="button"
				disabled={disabled}
				onClick={onAdd}
				className="absolute inset-0 z-[1] flex items-center justify-center border-0 bg-transparent text-xs text-brg-mid disabled:cursor-not-allowed disabled:opacity-50"
				aria-label="Add owner here"
			>
				+ Add owner here
			</button>
		</div>
	);
}

export function OwnershipHistoryEditor({
	currentOwner,
	currentOwnerDateEnd,
	currentOwnerDateStart,
	disabled = false,
	editionYear = null,
	onChange,
	onOwnerDateEndChange,
	rows,
	timelineError = null,
	warningOwnerDateEnd = false,
}: OwnershipHistoryEditorProps) {
	const currentPurchaseStart = readCurrentPurchaseStart(
		currentOwnerDateStart
	);

	const insertAt = (insertIndex: number) => {
		const purchaseStart = readCurrentPurchaseStart(currentOwnerDateStart);
		const dates = insertBoundaries(
			rows,
			insertIndex,
			purchaseStart,
			editionYear
		);

		onChange(insertPriorOwnerAt(rows, insertIndex, dates));
	};

	const insertFromGap = (
		insertIndex: number,
		placeholder: TOwnershipGapPlaceholder
	) => {
		onChange(
			insertPriorOwnerAt(
				rows,
				insertIndex,
				datesForGapPlaceholder(placeholder)
			)
		);
	};

	const removeRow = (key: string) => {
		onChange(rows.filter((row) => row.key !== key));
	};

	const setLocation = (key: string, value: string) => {
		onChange(
			updateRow(rows, key, {
				location: parseLocation(value),
			})
		);
	};

	const priorBlocks: Array<
		| { type: 'gap'; insertIndex: number; placeholder: TOwnershipGapPlaceholder }
		| { type: 'prior'; row: TPriorOwnerFormRow }
	> = [];

	for (let i = 0; i < rows.length; i++) {
		const newerOwnedFrom =
			i === 0 ? currentPurchaseStart : rows[i - 1].date_start;
		const olderOwnedUntil = rows[i].date_end;
		const gap = ownershipGapPlaceholder(
			olderOwnedUntil,
			newerOwnedFrom,
			`gap-${i}`
		);

		if (gap) {
			priorBlocks.push({ type: 'gap', insertIndex: i, placeholder: gap });
		}

		priorBlocks.push({ type: 'prior', row: rows[i] });
	}

	const gapInsertIndexes = new Set(
		priorBlocks
			.filter((block): block is Extract<typeof block, { type: 'gap' }> => block.type === 'gap')
			.map((block) => block.insertIndex)
	);

	const showInsertAt = (insertIndex: number) =>
		!gapInsertIndexes.has(insertIndex);

	return (
		<div className="flex flex-col gap-2">
			<div className="overflow-x-auto">
				<div className={OWNERSHIP_GRID} role="table">
					<div
						className="col-span-full grid grid-cols-subgrid text-left text-xs font-medium text-brg-mid"
						role="row"
					>
						<div className="pb-1 pr-2 font-medium" role="columnheader">
							Name
						</div>
						<div className="pb-1 pr-2 font-medium" role="columnheader">
							Location
						</div>
						<div
							className="pb-1 pr-2 font-medium"
							role="columnheader"
						>
							From
						</div>
						<div
							className="pb-1 pr-2 font-medium"
							role="columnheader"
						>
							Until
						</div>
						<div className="pb-1" role="columnheader">
							<span className="sr-only">Remove</span>
						</div>
					</div>

					<div className="col-span-full grid grid-cols-subgrid" role="row">
						<div className={ownershipCellClass()} role="cell">
							<TextField
								id="current_owner_name_display"
								name="current_owner_name_display"
								readOnly
								disabled
								value={currentOwner.name}
								className="bg-brg-light/40 text-brg-mid disabled:cursor-not-allowed disabled:opacity-100"
							/>
						</div>
						<div className={ownershipCellClass()} role="cell">
							<TextField
								id="owner_location_display"
								name="owner_location_display"
								readOnly
								disabled
								value={currentOwner.locationDisplay}
								className="bg-brg-light/40 text-brg-mid disabled:cursor-not-allowed disabled:opacity-100"
							/>
						</div>
						<div className={ownershipCellClass()} role="cell">
							<TextField
								id="owner_date_start"
								name="owner_date_start"
								type="date"
								required
								disabled={disabled}
								className="w-full max-w-[8.75rem] shrink-0"
								defaultValue={
									currentOwnerDateStart
										? currentOwnerDateStart
												.toString()
												.split('T')[0]
										: undefined
								}
							/>
						</div>
						<div className={ownershipCellClass()} role="cell">
							<TextField
								id="owner_date_end"
								name="owner_date_end"
								type="date"
								disabled={disabled}
								className="w-full max-w-[8.75rem] shrink-0"
								defaultValue={
									currentOwnerDateEnd
										? currentOwnerDateEnd
												.toString()
												.split('T')[0]
										: undefined
								}
								onChange={onOwnerDateEndChange}
							/>
						</div>
						<div className="min-w-0 py-1" role="cell" aria-hidden />
					</div>

					{showInsertAt(0) ? (
						<InsertOwnerRow
							disabled={disabled}
							onInsert={() => insertAt(0)}
						/>
					) : null}

					{priorBlocks.map((block) => {
						if (block.type === 'gap') {
							return (
								<GapPlaceholderRow
									key={block.placeholder.key}
									disabled={disabled}
									placeholder={block.placeholder}
									onAdd={() =>
										insertFromGap(
											block.insertIndex,
											block.placeholder
										)
									}
								/>
							);
						}

						const { row } = block;
						const priorIndex = rows.findIndex(
							(r) => r.key === row.key
						);
						const insertAfterIndex = priorIndex + 1;

						return (
							<Fragment key={row.key}>
								<div
									className="col-span-full grid grid-cols-subgrid"
									role="row"
								>
									<div className={ownershipCellClass()} role="cell">
										<label
											htmlFor={`prior_owner_name_${row.key}`}
											className="sr-only"
										>
											Name
										</label>
										<TextField
											id={`prior_owner_name_${row.key}`}
											name={`prior_owner_name_${row.key}`}
											placeholder="Name"
											disabled={disabled}
											value={row.name}
											onChange={(
												e: ChangeEvent<HTMLInputElement>
											) =>
												onChange(
													updateRow(rows, row.key, {
														name: e.target.value,
													})
												)
											}
										/>
									</div>
									<div className={ownershipCellClass()} role="cell">
										<label
											htmlFor={`prior_owner_location_${row.key}`}
											className="sr-only"
										>
											Location
										</label>
										<Location
											id={`prior_owner_location_${row.key}`}
											name={`prior_owner_location_${row.key}`}
											placeholder="Location"
											value={formatLocation(
												normalizeLocation(row.location)
											)}
											onLocationSelect={(value) =>
												setLocation(row.key, value)
											}
										/>
									</div>
									<div className={ownershipCellClass()} role="cell">
										<label
											htmlFor={`prior_owner_start_${row.key}`}
											className="sr-only"
										>
											Owned from
										</label>
										<TextField
											id={`prior_owner_start_${row.key}`}
											name={`prior_owner_start_${row.key}`}
											type="date"
											disabled={disabled}
											className="w-full max-w-[8.75rem] shrink-0"
											value={row.date_start}
											onChange={(
												e: ChangeEvent<HTMLInputElement>
											) =>
												onChange(
													updateRow(rows, row.key, {
														date_start:
															e.target.value,
													})
												)
											}
										/>
									</div>
									<div className={ownershipCellClass()} role="cell">
										<label
											htmlFor={`prior_owner_end_${row.key}`}
											className="sr-only"
										>
											Owned until
										</label>
										<TextField
											id={`prior_owner_end_${row.key}`}
											name={`prior_owner_end_${row.key}`}
											type="date"
											disabled={disabled}
											className="w-full max-w-[8.75rem] shrink-0"
											value={row.date_end}
											onChange={(
												e: ChangeEvent<HTMLInputElement>
											) =>
												onChange(
													updateRow(rows, row.key, {
														date_end: e.target.value,
													})
												)
											}
										/>
									</div>
									<div
										className="min-w-0 py-1 text-center"
										role="cell"
									>
										<button
											type="button"
											disabled={disabled}
											onClick={() => removeRow(row.key)}
											className="rounded p-1 text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
											aria-label="Remove owner"
										>
											<i
												className="fa-solid fa-fw fa-xmark text-xs"
												aria-hidden
											/>
										</button>
									</div>
								</div>
								{showInsertAt(insertAfterIndex) ? (
									<InsertOwnerRow
										disabled={disabled}
										onInsert={() =>
											insertAt(insertAfterIndex)
										}
									/>
								) : null}
							</Fragment>
						);
					})}
				</div>
			</div>

			{warningOwnerDateEnd ? (
				<p className="text-xs text-brg-mid/80">
					You will be removed as the owner of this car.
				</p>
			) : null}

			{timelineError ? (
				<p className="text-xs text-red-800" role="alert">
					{timelineError}
				</p>
			) : null}
		</div>
	);
}
