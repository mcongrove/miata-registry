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

import { useEffect, useState } from 'react';
import { toPrettyDate } from '../utils/common';

export function useArchiveHeartbeat() {
	const [archiveUrl, setArchiveUrl] = useState('');
	const [lastArchive, setLastArchive] = useState('');
	const [isArchived, setIsArchived] = useState<boolean | null>(null);

	useEffect(() => {
		const loadArchive = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/heartbeat/archive`
				);

				if (!response.ok) {
					if (response.status === 404) {
						setLastArchive('');
						setIsArchived(false);
					}

					return;
				}

				const archiveData = await response.json();
				const lastArchiveDate = new Date(archiveData.timestamp);
				const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

				setIsArchived(
					Date.now() - lastArchiveDate.getTime() < thirtyDaysInMs
				);
				setLastArchive(
					toPrettyDate(archiveData.timestamp).split(' at')[0]
				);
				setArchiveUrl(
					`https://archive.org/details/${archiveData.filename.replace('.zip', '')}`
				);
			} catch {
				setLastArchive('');
				setIsArchived(null);
				setArchiveUrl('');
			}
		};

		loadArchive();
	}, []);

	return { archiveUrl, isArchived, lastArchive };
}
