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

import { ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';
import { Icon } from './Icon';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	action?: {
		text: string;
		onClick: () => void;
		loading?: boolean;
	};
	hideCancel?: boolean;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	action,
	hideCancel,
}: ModalProps) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[51]">
			<div className="flex flex-col bg-white rounded-lg max-w-lg w-full">
				{title && (
					<h2 className="flex items-center justify-between text-xl font-bold bg-brg-light/70 px-6 py-4 rounded-t-lg border-b border-brg-border/50">
						{title}

						<Icon
							name="x"
							className="text-brg-mid hover:text-brg"
							onClick={onClose}
						/>
					</h2>
				)}

				<div className="p-6">{children}</div>

				<div
					className={twMerge(
						'flex gap-2 px-6 pb-6',
						hideCancel ? 'justify-center' : 'justify-end'
					)}
				>
					{!hideCancel && (
						<Button
							onClick={onClose}
							variant="tertiary"
							className={twMerge(
								'text-brg-border text-sm',
								action?.loading ? 'hidden' : ''
							)}
						>
							Cancel
						</Button>
					)}

					{action && (
						<Button
							onClick={action.onClick}
							disabled={action.loading}
							className="text-sm"
						>
							{action.loading ? 'Loading...' : action.text}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
