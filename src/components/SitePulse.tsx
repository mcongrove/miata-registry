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

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { toPrettyDate } from '../utils/common';
export function SitePulse() {
	const [lastActivity, setLastActivity] = useState<string>('');
	const [isActive, setIsActive] = useState<boolean | null>(null);

	useEffect(() => {
		const loadPulse = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/stats/pulse`
				);

				if (!response.ok) {
					if (response.status === 404) {
						setLastActivity('');
						setIsActive(false);

						return;
					}

					throw new Error('Failed to fetch car summary');
				}

				const data = await response.json();
				const lastActivityDate = new Date(data.timestamp);
				const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

				setIsActive(
					Date.now() - lastActivityDate.getTime() < thirtyDaysInMs
				);
				setLastActivity(toPrettyDate(data.timestamp).split(' at')[0]);
			} catch (error) {
				setLastActivity('');
			}
		};

		loadPulse();
	}, []);

	return (
		<div
			className={twMerge(
				'flex items-center justify-center gap-1.5 text-xs font-medium rounded-md py-1 px-2',
				!lastActivity
					? 'bg-neutral-900 text-neutral-600'
					: isActive
						? 'bg-emerald-900 text-emerald-500'
						: 'bg-rose-900 text-rose-400'
			)}
		>
			<div
				className={twMerge(
					'h-2 w-2 rounded-full',
					!lastActivity
						? 'bg-neutral-600'
						: isActive
							? 'bg-emerald-500 animate-pulse'
							: 'bg-rose-400 animate-pulse'
				)}
			/>{' '}
			{!lastActivity
				? 'Site pulse check not available'
				: isActive
					? `Site actively maintained as of ${lastActivity}`
					: `Site not updated since ${lastActivity}`}
		</div>
	);
}
