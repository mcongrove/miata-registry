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

import imageCompression from 'browser-image-compression';

export async function compressCarPhoto(file: File): Promise<File> {
	if (!file.type.startsWith('image/')) {
		throw new Error('Please select an image file');
	}

	if (file.size > 10 * 1024 * 1024) {
		throw new Error('File size must be less than 10MB');
	}

	return imageCompression(file, {
		maxSizeMB: 1,
		maxWidthOrHeight: 1000,
		useWebWorker: false,
		fileType: 'image/jpeg',
		initialQuality: 0.3,
	});
}

export async function uploadCarPhoto(
	carId: string,
	file: File,
	token: string
): Promise<void> {
	const formData = new FormData();

	formData.append('photo', file);

	const response = await fetch(
		`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/photos/${carId}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		}
	);

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));

		throw new Error(
			typeof error.details === 'string'
				? error.details
				: 'Failed to upload photo'
		);
	}
}
