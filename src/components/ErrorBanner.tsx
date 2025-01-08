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

import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ErrorBannerProps {
	className?: string;
	error: string | null;
	onDismiss?: () => void;
}

export function ErrorBanner({ className, error, onDismiss }: ErrorBannerProps) {
	const bannerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (error && bannerRef.current) {
			bannerRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}
	}, [error]);

	if (!error) return null;

	return (
		<div
			ref={bannerRef}
			className={twMerge(
				'w-full p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700',
				className
			)}
		>
			<div className="flex justify-between items-center">
				<span>{error}</span>

				{onDismiss && (
					<i
						className="fa-solid fa-times text-red-700 hover:text-red-800 cursor-pointer"
						onClick={onDismiss}
						aria-label="Dismiss error"
					></i>
				)}
			</div>
		</div>
	);
}
