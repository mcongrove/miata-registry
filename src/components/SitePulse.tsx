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
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { toPrettyDate } from '../utils/common';
export function SitePulse() {
	const [lastActivity, setLastActivity] = useState<string>('');
	const [isActive, setIsActive] = useState<boolean | null>(null);
	const [lastArchive, setLastArchive] = useState<string>('');
	const [isArchived, setIsArchived] = useState<boolean | null>(null);
	const [archiveUrl, setArchiveUrl] = useState<string>('');

	useEffect(() => {
		const loadPulse = async () => {
			try {
				const [pulseResponse, archiveResponse] = await Promise.all([
					fetch(
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/heartbeat/pulse`
					),
					fetch(
						`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/heartbeat/archive`
					),
				]);

				if (!pulseResponse.ok || !archiveResponse.ok) {
					if (pulseResponse.status === 404) {
						setLastActivity('');
						setIsActive(false);
					}

					if (archiveResponse.status === 404) {
						setLastArchive('');
						setIsArchived(false);
					}

					return;
				}

				const [pulseData, archiveData] = await Promise.all([
					pulseResponse.json(),
					archiveResponse.json(),
				]);

				const lastActivityDate = new Date(pulseData.timestamp);
				const lastArchiveDate = new Date(archiveData.timestamp);
				const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

				setIsActive(
					Date.now() - lastActivityDate.getTime() < thirtyDaysInMs
				);

				setLastActivity(
					toPrettyDate(pulseData.timestamp).split(' at')[0]
				);

				setIsArchived(
					Date.now() - lastArchiveDate.getTime() < thirtyDaysInMs
				);

				setLastArchive(
					toPrettyDate(archiveData.timestamp).split(' at')[0]
				);

				setArchiveUrl(
					`https://archive.org/details/${archiveData.filename.replace('.zip', '')}`
				);
			} catch (error) {
				setLastActivity('');
				setLastArchive('');
				setArchiveUrl('');
			}
		};

		loadPulse();
	}, []);

	return (
		<div className="flex flex-col gap-2 items-center">
			<div className="flex flex-col md:flex-row w-full md:w-fit gap-2">
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

				{archiveUrl ? (
					<Link
						to={archiveUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:opacity-80 transition-opacity"
					>
						<div
							className={twMerge(
								'flex items-center justify-center gap-1.5 text-xs font-medium rounded-md py-1 px-2',
								!lastArchive
									? 'bg-neutral-900 text-neutral-600'
									: isArchived
										? 'bg-emerald-900 text-emerald-500'
										: 'bg-rose-900 text-rose-400'
							)}
						>
							<div
								className={twMerge(
									'h-2 w-2 rounded-full',
									!lastArchive
										? 'bg-neutral-600'
										: isArchived
											? 'bg-emerald-500 animate-pulse'
											: 'bg-rose-400 animate-pulse'
								)}
							/>{' '}
							{!lastArchive
								? 'Data archive check not available'
								: isArchived
									? `Data last archived ${lastArchive}`
									: `Data not archived since ${lastArchive}`}
						</div>
					</Link>
				) : (
					<div
						className={twMerge(
							'flex items-center justify-center gap-1.5 text-xs font-medium rounded-md py-1 px-2',
							'bg-neutral-900 text-neutral-600'
						)}
					>
						<div className="h-2 w-2 rounded-full bg-neutral-600" />{' '}
						Data archive check not available
					</div>
				)}
			</div>

			<div className="text-xs text-brg-mid/80 text-center">
				<p>
					These statuses act as a proof that the site is actively
					maintained and the data is publicly archived.
				</p>

				<p>
					The actions that update these statuses are not run daily, so
					only large time lapses should be considered problematic.
				</p>
			</div>
		</div>
	);
}
