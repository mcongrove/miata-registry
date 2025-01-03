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

import { Children } from 'react';
import { Button } from '../Button';

export const PendingItem = ({
	carId,
	children,
	createdAt,
	onApprove,
	onReject,
	ownerId,
}: {
	carId?: string;
	children: React.ReactNode;
	createdAt: number;
	onApprove: () => void;
	onReject: () => void;
	ownerId?: string;
}) => {
	const hasChildren = Children.count(children) > 0;

	return (
		<div className="bg-white rounded-lg border border-brg-light">
			<div className="flex items-center justify-between py-3 px-4">
				<div className="flex flex-col gap-1">
					<h3 className="flex items-center gap-6">
						{carId && (
							<div
								className="font-medium cursor-pointer hover:text-brg-dark transition-colors leading-5"
								onClick={() =>
									navigator.clipboard.writeText(carId)
								}
								title="Click to copy Car ID"
							>
								<span className="text-brg-border font-normal">
									Car ID
								</span>{' '}
								<span className="font-mono">{carId}</span>
							</div>
						)}

						{ownerId && (
							<div
								className="font-medium cursor-pointer hover:text-brg-dark transition-colors leading-5"
								onClick={() =>
									navigator.clipboard.writeText(ownerId)
								}
								title="Click to copy Car Owner ID"
							>
								<span className="text-brg-border font-normal">
									Car Owner ID
								</span>{' '}
								<span className="font-mono">{ownerId}</span>
							</div>
						)}
					</h3>

					<p className="text-xs text-brg-border">
						{new Date(createdAt)
							.toLocaleString('en-US', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: 'numeric',
								minute: '2-digit',
								hour12: true,
							})
							.replace(/\//g, '-')
							.replace(',', '')}
					</p>
				</div>

				<div className="flex gap-4">
					<Button
						variant="secondary"
						onClick={onReject}
						className="bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center size-8"
					>
						<i className="fa-solid fa-fw fa-times"></i>
					</Button>

					<Button
						onClick={onApprove}
						className="bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center size-8"
					>
						<i className="fa-solid fa-fw fa-check"></i>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-2 border-t border-brg-light py-3 px-4 text-sm">
				{hasChildren ? (
					children
				) : (
					<p className="text-brg-border">No changes.</p>
				)}
			</div>
		</div>
	);
};
