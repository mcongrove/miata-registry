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

import { Children, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../Button';

export const PendingItem = ({
	carId,
	children,
	createdAt,
	onApprove,
	onApproveSkipEmail,
	onReject,
	ownerId,
	status,
}: {
	carId?: string;
	children: React.ReactNode;
	createdAt: number;
	onApprove?: () => void;
	onApproveSkipEmail?: () => void;
	onReject?: () => void;
	ownerId?: string;
	status?: 'approved' | 'rejected';
}) => {
	const hasChildren = Children.count(children) > 0;
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!menuOpen || status) return;

		const onPointerDown = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', onPointerDown);

		return () => document.removeEventListener('mousedown', onPointerDown);
	}, [menuOpen, status]);

	const approveAction = onApprove ?? onApproveSkipEmail;
	const showSilentMenu = Boolean(onApprove && onApproveSkipEmail);

	return (
		<div className="bg-white rounded-lg border border-brg-light">
			<div className="flex items-center justify-between gap-4 py-3 px-4">
				<div className="flex min-w-0 flex-col gap-1">
					<h3 className="flex flex-wrap items-center gap-6">
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
								title="Click to copy Owner ID"
							>
								<span className="text-brg-border font-normal">
									Owner ID
								</span>{' '}
								<span className="font-mono">{ownerId}</span>
							</div>
						)}
					</h3>

					<p className="text-xs text-brg-border">
						{new Date(createdAt * 1000)
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

				<div className="flex shrink-0 items-center gap-2">
					{status ? (
						<span
							className={twMerge(
								'text-sm font-medium',
								status === 'approved'
									? 'text-green-700'
									: 'text-red-600'
							)}
						>
							{status === 'approved' ? 'Approved' : 'Rejected'}
						</span>
					) : (
						<>
							{onReject && (
								<Button
									type="button"
									variant="secondary"
									onClick={onReject}
									className="bg-red-50 hover:bg-red-100 text-red-600 lg:px-3 lg:py-1.5 lg:text-sm"
								>
									Reject
								</Button>
							)}

							{approveAction && (
								<div
									ref={menuRef}
									className="relative inline-flex isolate"
								>
									<Button
										type="button"
										onClick={approveAction}
										className={twMerge(
											'bg-green-50 hover:bg-green-100 text-green-700 lg:px-3 lg:py-1.5 lg:text-sm rounded-none',
											showSilentMenu
												? 'rounded-l-lg'
												: 'rounded-lg'
										)}
									>
										Approve
									</Button>

									{showSilentMenu && (
										<>
											<Button
												type="button"
												aria-label="More approve options"
												aria-expanded={menuOpen}
												aria-haspopup="menu"
												onClick={() =>
													setMenuOpen((open) => !open)
												}
												className="bg-green-50 hover:bg-green-100 text-green-700 lg:px-2 lg:py-1.5 lg:text-sm rounded-none rounded-r-lg border-l border-green-200/80"
											>
												<i className="fa-solid fa-fw fa-chevron-down text-xs" />
											</Button>

											{menuOpen && (
												<div
													role="menu"
													className="absolute right-0 top-full z-20 mt-1 min-w-56 rounded-lg border border-brg-light bg-white py-1 shadow-md"
												>
													<button
														type="button"
														role="menuitem"
														className="w-full px-3 py-2 text-left text-sm text-brg hover:bg-brg-light/80"
														onClick={() => {
															setMenuOpen(false);
															onApproveSkipEmail?.();
														}}
													>
														Approve without
														notification
													</button>
												</div>
											)}
										</>
									)}
								</div>
							)}
						</>
					)}
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
