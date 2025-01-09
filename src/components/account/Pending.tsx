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

import {
	flip,
	FloatingPortal,
	offset,
	shift,
	useClick,
	useFloating,
	useInteractions,
} from '@floating-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toRelativeTime } from '../../utils/common';

interface PendingProps {
	changes: any;
}

export const Pending = ({ changes }: PendingProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const { x, y, strategy, refs, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-end',
		middleware: [offset(8), flip(), shift({ padding: 32 })],
	});

	const click = useClick(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([click]);

	return (
		<>
			<button
				ref={refs.setReference}
				{...getReferenceProps()}
				type="button"
				className="flex items-center gap-1.5 text-xs text-yellow-600 rounded-full py-1 px-3 border border-yellow-300 hover:bg-yellow-50 transition-colors"
			>
				<div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />

				<span>
					Pending <span className="hidden lg:inline">Changes</span>
				</span>
			</button>

			{isOpen && (
				<FloatingPortal>
					<div
						className="fixed inset-0 z-50"
						onClick={() => setIsOpen(false)}
					/>

					<div
						ref={refs.setFloating}
						style={{
							position: strategy,
							top: y ?? 0,
							left: x ?? 0,
						}}
						{...getFloatingProps()}
						className="z-[51] max-w-[calc(100vw-64px)] lg:max-w-sm mt-2 lg:mt-0 lg:w-96 border border-brg-light rounded-lg"
					>
						<div className="flex flex-col gap-4 bg-white rounded-lg shadow-lg py-3">
							{changes.cars.length > 0 && (
								<div className="flex flex-col gap-2 px-4">
									<h5 className="text-xs font-semibold text-brg uppercase tracking-wide">
										Cars
									</h5>

									{changes.cars.map((car: any) => (
										<Link
											to={`/registry/${car.id}`}
											key={car.id}
											className="flex flex-col text-sm"
										>
											{car.edition_name}
											<span className="text-xs text-brg-mid/60">
												{car.vin} •{' '}
												{toRelativeTime(
													new Date(
														car.created_at * 1000
													)
												)}
											</span>
										</Link>
									))}
								</div>
							)}

							{changes.cars.length > 0 &&
								changes.carOwners.length > 0 && (
									<hr className="bgalpine-brg-border" />
								)}

							{changes.carOwners.length > 0 && (
								<div className="flex flex-col gap-2 px-4">
									<h5 className="text-xs font-semibold text-brg uppercase tracking-wide">
										Ownership
									</h5>

									{changes.carOwners.map((carOwner: any) => (
										<Link
											to={`/registry/${carOwner.car_id}`}
											key={carOwner.id}
											className="flex flex-col text-sm"
										>
											{carOwner.edition_name}
											<span className="text-xs text-brg-mid/60">
												{carOwner.vin} •{' '}
												{toRelativeTime(
													new Date(
														carOwner.created_at *
															1000
													)
												)}
											</span>
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
				</FloatingPortal>
			)}
		</>
	);
};
